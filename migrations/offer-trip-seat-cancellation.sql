ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS offer_trip_id bigint
  REFERENCES public.offer_trip(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS rides_offer_trip_id_idx
  ON public.rides (offer_trip_id)
  WHERE offer_trip_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.cancel_ride_and_release_offer_trip_seat(
  p_ride_id bigint,
  p_user_id text,
  p_recovered_offer_trip_id bigint DEFAULT NULL
)
RETURNS TABLE(cancelled_ride_id bigint, released_offer_trip_id bigint)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_offer_trip_id bigint;
  v_payment_status text;
BEGIN
  SELECT
    COALESCE(r.offer_trip_id, p_recovered_offer_trip_id),
    r.payment_status
  INTO v_offer_trip_id, v_payment_status
  FROM public.rides AS r
  WHERE r.ride_id = p_ride_id
    AND r.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_payment_status IS DISTINCT FROM 'cancelled' THEN
    UPDATE public.rides
    SET
      offer_trip_id = v_offer_trip_id,
      payment_status = 'cancelled',
      status = 'cancelled',
      cancelled_at = now()
    WHERE ride_id = p_ride_id;

    IF v_offer_trip_id IS NOT NULL THEN
      UPDATE public.offer_trip
      SET
        seats_booked = GREATEST(seats_booked - 1, 0),
        status = CASE
          WHEN status = 'full' AND seats_booked - 1 < seats_available THEN 'active'
          ELSE status
        END,
        updated_at = now()
      WHERE id = v_offer_trip_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated offered trip not found';
      END IF;
    END IF;
  END IF;

  RETURN QUERY SELECT p_ride_id, v_offer_trip_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_ride_and_release_offer_trip_seat(bigint, text, bigint)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_ride_and_release_offer_trip_seat(bigint, text, bigint)
  TO service_role;
