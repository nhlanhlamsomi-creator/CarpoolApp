ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS offer_trip_id bigint
  REFERENCES public.offer_trip(id) ON DELETE SET NULL;

ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS booked_seats integer NOT NULL DEFAULT 1;

ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS offer_trip_seats_released integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.rides'::regclass
      AND conname = 'rides_booked_seats_positive'
  ) THEN
    ALTER TABLE public.rides
      ADD CONSTRAINT rides_booked_seats_positive CHECK (booked_seats > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.rides'::regclass
      AND conname = 'rides_offer_trip_seats_released_valid'
  ) THEN
    ALTER TABLE public.rides
      ADD CONSTRAINT rides_offer_trip_seats_released_valid
      CHECK (
        offer_trip_seats_released >= 0
        AND offer_trip_seats_released <= booked_seats
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.offer_trip'::regclass
      AND conname = 'offer_trip_seat_counts_valid'
  ) THEN
    ALTER TABLE public.offer_trip
      ADD CONSTRAINT offer_trip_seat_counts_valid
      CHECK (
        seats_available >= 0
        AND seats_booked >= 0
        AND seats_booked <= seats_available
      )
      NOT VALID;
  END IF;
END;
$$;

UPDATE public.offer_trip
SET
  seats_booked = GREATEST(0, LEAST(seats_booked, seats_available)),
  status = CASE
    WHEN status IN ('active', 'full') AND seats_booked >= seats_available THEN 'full'
    WHEN status IN ('active', 'full') THEN 'active'
    ELSE status
  END,
  updated_at = now()
WHERE seats_booked < 0
   OR seats_booked > seats_available
   OR (status IN ('active', 'full') AND
       ((seats_booked >= seats_available AND status <> 'full') OR
        (seats_booked < seats_available AND status <> 'active')));

ALTER TABLE public.offer_trip
  VALIDATE CONSTRAINT offer_trip_seat_counts_valid;

UPDATE public.rides
SET offer_trip_seats_released = booked_seats
WHERE offer_trip_id IS NOT NULL
  AND (status = 'cancelled' OR payment_status = 'cancelled')
  AND offer_trip_seats_released = 0;

CREATE INDEX IF NOT EXISTS rides_offer_trip_id_idx
  ON public.rides (offer_trip_id)
  WHERE offer_trip_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.reserve_offer_trip_seats(
  p_trip_id bigint,
  p_user_id text,
  p_payment_intent_id text,
  p_seat_count integer,
  p_fare_per_seat_cents integer
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_trip public.offer_trip%ROWTYPE;
  v_ride public.rides%ROWTYPE;
  v_new_booked integer;
  v_scheduled_for timestamptz;
BEGIN
  IF p_seat_count IS NULL OR p_seat_count <= 0 THEN
    RAISE EXCEPTION 'Invalid seat count' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_trip
  FROM public.offer_trip
  WHERE id = p_trip_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offered trip not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT *
  INTO v_ride
  FROM public.rides
  WHERE stripe_payment_id = p_payment_intent_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_ride.user_id <> p_user_id
       OR v_ride.offer_trip_id IS DISTINCT FROM p_trip_id
       OR v_ride.booked_seats <> p_seat_count THEN
      RAISE EXCEPTION 'Payment is already linked to a different booking'
        USING ERRCODE = '23505';
    END IF;
    IF v_ride.status = 'cancelled' OR v_ride.payment_status = 'cancelled' THEN
      RAISE EXCEPTION 'This booking has already been cancelled'
        USING ERRCODE = 'P0001';
    END IF;

    RETURN jsonb_build_object(
      'ride', jsonb_build_object(
        'ride_id', v_ride.ride_id,
        'scheduled_for', v_ride.scheduled_for,
        'status', v_ride.status
      ),
      'trip', jsonb_build_object(
        'id', v_trip.id,
        'seats_available', v_trip.seats_available,
        'seats_booked', v_trip.seats_booked,
        'available_seats', LEAST(v_trip.seats_available, GREATEST(v_trip.seats_available - v_trip.seats_booked, 0)),
        'status', v_trip.status
      )
    );
  END IF;

  IF v_trip.status <> 'active'
     OR v_trip.seats_available <= 0
     OR v_trip.seats_booked < 0
     OR v_trip.seats_booked + p_seat_count > v_trip.seats_available THEN
    RAISE EXCEPTION 'Offered trip has insufficient available seats'
      USING ERRCODE = 'P0001';
  END IF;

  IF p_fare_per_seat_cents IS NULL
     OR p_fare_per_seat_cents <= 0
     OR round(v_trip.price_per_seat * 100)::integer <> p_fare_per_seat_cents THEN
    RAISE EXCEPTION 'Offered trip price changed during booking'
      USING ERRCODE = 'P0001';
  END IF;

  v_scheduled_for :=
    (v_trip.departure_date::date + v_trip.departure_time::time) AT TIME ZONE 'UTC';
  v_new_booked := v_trip.seats_booked + p_seat_count;

  UPDATE public.offer_trip
  SET
    seats_booked = v_new_booked,
    status = CASE WHEN v_new_booked = seats_available THEN 'full' ELSE 'active' END,
    updated_at = now()
  WHERE id = p_trip_id
  RETURNING * INTO v_trip;

  INSERT INTO public.rides (
    origin_address,
    destination_address,
    origin_latitude,
    origin_longitude,
    destination_latitude,
    destination_longitude,
    ride_time,
    scheduled_for,
    status,
    fare_price,
    payment_status,
    payment_method,
    stripe_payment_id,
    offer_trip_id,
    booked_seats,
    driver_id,
    user_id
  )
  VALUES (
    v_trip.leaving_from,
    v_trip.going_to,
    v_trip.leaving_from_lat,
    v_trip.leaving_from_lng,
    v_trip.going_to_lat,
    v_trip.going_to_lng,
    v_scheduled_for,
    v_scheduled_for,
    'booked',
    p_fare_per_seat_cents * p_seat_count,
    'paid',
    'Stripe',
    p_payment_intent_id,
    v_trip.id,
    p_seat_count,
    v_trip.driver_id,
    p_user_id
  )
  RETURNING * INTO v_ride;

  RETURN jsonb_build_object(
    'ride', jsonb_build_object(
      'ride_id', v_ride.ride_id,
      'scheduled_for', v_ride.scheduled_for,
      'status', v_ride.status
    ),
    'trip', jsonb_build_object(
      'id', v_trip.id,
      'seats_available', v_trip.seats_available,
      'seats_booked', v_trip.seats_booked,
      'available_seats', LEAST(v_trip.seats_available, GREATEST(v_trip.seats_available - v_trip.seats_booked, 0)),
      'status', v_trip.status
    )
  );
END;
$$;

DROP FUNCTION IF EXISTS public.cancel_ride_and_release_offer_trip_seat(bigint, text, bigint);

CREATE FUNCTION public.cancel_ride_and_release_offer_trip_seat(
  p_ride_id bigint,
  p_user_id text,
  p_recovered_offer_trip_id bigint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_ride public.rides%ROWTYPE;
  v_offer_trip_id bigint;
  v_trip public.offer_trip%ROWTYPE;
  v_is_active boolean;
  v_released_seats integer;
BEGIN
  SELECT *
  INTO v_ride
  FROM public.rides AS r
  WHERE r.ride_id = p_ride_id
    AND r.user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found' USING ERRCODE = 'P0002';
  END IF;

  v_offer_trip_id := COALESCE(v_ride.offer_trip_id, p_recovered_offer_trip_id);

  IF v_offer_trip_id IS NOT NULL THEN
    PERFORM 1
    FROM public.offer_trip
    WHERE id = v_offer_trip_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Associated offered trip not found' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  SELECT *
  INTO v_ride
  FROM public.rides AS r
  WHERE r.ride_id = p_ride_id
    AND r.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found' USING ERRCODE = 'P0002';
  END IF;

  IF (v_ride.status = 'cancelled' OR v_ride.payment_status = 'cancelled')
     AND (
       v_offer_trip_id IS NULL
       OR v_ride.offer_trip_seats_released >= v_ride.booked_seats
     ) THEN
    RETURN jsonb_build_object(
      'cancelled_ride_id', p_ride_id,
      'released_offer_trip_id', v_offer_trip_id,
      'already_cancelled', true
    );
  END IF;

  v_is_active :=
    v_ride.status IN ('booked', 'scheduled', 'accepted', 'confirmed', 'in_progress')
    AND v_ride.payment_status = 'paid';

  IF NOT v_is_active
     AND v_ride.status <> 'cancelled'
     AND v_ride.payment_status <> 'cancelled' THEN
    RAISE EXCEPTION 'Only active bookings can be cancelled' USING ERRCODE = 'P0001';
  END IF;

  v_offer_trip_id := COALESCE(v_ride.offer_trip_id, p_recovered_offer_trip_id);

  IF v_offer_trip_id IS NOT NULL THEN
    v_released_seats := v_ride.booked_seats - v_ride.offer_trip_seats_released;

    UPDATE public.offer_trip
    SET
      seats_booked = GREATEST(
        seats_booked - (v_ride.booked_seats - v_ride.offer_trip_seats_released),
        0
      ),
      status = CASE
        WHEN status = 'full'
          AND seats_booked - (v_ride.booked_seats - v_ride.offer_trip_seats_released) < seats_available
          THEN 'active'
        ELSE status
      END,
      updated_at = now()
    WHERE id = v_offer_trip_id
    RETURNING * INTO v_trip;
  END IF;

  UPDATE public.rides
  SET
    offer_trip_id = v_offer_trip_id,
    offer_trip_seats_released = CASE
      WHEN v_offer_trip_id IS NULL THEN offer_trip_seats_released
      ELSE booked_seats
    END,
    payment_status = 'cancelled',
    status = 'cancelled',
    cancelled_at = now()
  WHERE ride_id = p_ride_id
  RETURNING * INTO v_ride;

  RETURN jsonb_build_object(
    'cancelled_ride_id', p_ride_id,
    'released_offer_trip_id', v_offer_trip_id,
    'released_seats', CASE
      WHEN v_offer_trip_id IS NULL THEN 0
      ELSE v_released_seats
    END,
    'available_seats', CASE
      WHEN v_offer_trip_id IS NULL THEN NULL
      ELSE LEAST(v_trip.seats_available, GREATEST(v_trip.seats_available - v_trip.seats_booked, 0))
    END,
    'already_cancelled', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_offer_trip_seats(bigint, text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_offer_trip_seats(bigint, text, text, integer, integer)
  TO service_role;

REVOKE ALL ON FUNCTION public.cancel_ride_and_release_offer_trip_seat(bigint, text, bigint)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_ride_and_release_offer_trip_seat(bigint, text, bigint)
  TO service_role;
