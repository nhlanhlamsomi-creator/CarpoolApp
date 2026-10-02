CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ride_id BIGINT NOT NULL,
  passenger_clerk_id TEXT NOT NULL,
  driver_id BIGINT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT CHECK (feedback IS NULL OR char_length(feedback) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT driver_ratings_one_per_passenger_trip
    UNIQUE (ride_id, passenger_clerk_id)
);

CREATE INDEX IF NOT EXISTS driver_ratings_driver_id_idx
  ON public.driver_ratings (driver_id);

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.record_driver_rating(
  p_ride_id BIGINT,
  p_passenger_clerk_id TEXT,
  p_driver_id BIGINT,
  p_rating INTEGER,
  p_feedback TEXT
)
RETURNS TABLE (rating NUMERIC, rating_count INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.driver_ratings (
    ride_id,
    passenger_clerk_id,
    driver_id,
    rating,
    feedback
  )
  VALUES (
    p_ride_id,
    p_passenger_clerk_id,
    p_driver_id,
    p_rating,
    p_feedback
  );

  UPDATE public.drivers AS driver
  SET
    rating_count = COALESCE(driver.rating_count, 0) + 1,
    rating = ROUND(
      (
        COALESCE(driver.rating, p_rating)::NUMERIC
          * COALESCE(driver.rating_count, 0)
        + p_rating
      ) / (COALESCE(driver.rating_count, 0) + 1),
      1
    )
  WHERE driver.id = p_driver_id
  RETURNING driver.rating, driver.rating_count
    INTO rating, rating_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Driver not found';
  END IF;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.record_driver_rating(BIGINT, TEXT, BIGINT, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_driver_rating(BIGINT, TEXT, BIGINT, INTEGER, TEXT)
  TO service_role;
