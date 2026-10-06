ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.record_passenger_driver_rating(
  p_ride_id TEXT,
  p_passenger_clerk_id TEXT,
  p_driver_id BIGINT,
  p_rating INTEGER,
  p_comment TEXT
)
RETURNS TABLE (average_rating NUMERIC, rating_count INTEGER)
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_average_rating NUMERIC;
  v_rating_count INTEGER;
BEGIN
  PERFORM 1
  FROM public.drivers
  WHERE id = p_driver_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Driver not found';
  END IF;

  INSERT INTO public.passenger_ratings (
    ride_id,
    driver_id,
    passenger_clerk_id,
    rating,
    comment
  )
  VALUES (
    p_ride_id,
    p_driver_id,
    p_passenger_clerk_id,
    p_rating,
    p_comment
  );

  SELECT ROUND(AVG(rating)::NUMERIC, 1), COUNT(*)::INTEGER
  INTO v_average_rating, v_rating_count
  FROM public.passenger_ratings
  WHERE driver_id = p_driver_id;

  UPDATE public.drivers
  SET rating = v_average_rating,
      rating_count = v_rating_count
  WHERE id = p_driver_id;

  RETURN QUERY SELECT v_average_rating, v_rating_count;
END;
$$;

DROP TRIGGER IF EXISTS passenger_ratings_sync_user_rating
  ON public.passenger_ratings;

DROP FUNCTION IF EXISTS public.sync_passenger_rating();
DROP FUNCTION IF EXISTS public.refresh_passenger_rating(TEXT);

REVOKE ALL ON FUNCTION public.record_passenger_driver_rating(TEXT, TEXT, BIGINT, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_passenger_driver_rating(TEXT, TEXT, BIGINT, INTEGER, TEXT)
  TO service_role;

UPDATE public.drivers AS driver
SET rating = ratings.average_rating,
    rating_count = ratings.rating_count
FROM (
  SELECT driver_id,
         ROUND(AVG(rating)::NUMERIC, 1) AS average_rating,
         COUNT(*)::INTEGER AS rating_count
  FROM public.passenger_ratings
  GROUP BY driver_id
) AS ratings
WHERE driver.id = ratings.driver_id;
