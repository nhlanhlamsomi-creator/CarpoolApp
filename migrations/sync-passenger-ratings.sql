CREATE OR REPLACE FUNCTION public.refresh_passenger_rating(
  p_passenger_clerk_id TEXT
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.users AS passenger
  SET rating = (
    SELECT AVG(rating)::NUMERIC
    FROM public.passenger_ratings
    WHERE passenger_clerk_id = p_passenger_clerk_id
  )
  WHERE passenger.clerk_id = p_passenger_clerk_id;
$$;

CREATE OR REPLACE FUNCTION public.sync_passenger_rating()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM public.refresh_passenger_rating(OLD.passenger_clerk_id);
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM public.refresh_passenger_rating(NEW.passenger_clerk_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_passenger_rating(TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_passenger_rating()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS passenger_ratings_sync_user_rating
  ON public.passenger_ratings;

CREATE TRIGGER passenger_ratings_sync_user_rating
AFTER INSERT OR UPDATE OR DELETE ON public.passenger_ratings
FOR EACH ROW
EXECUTE FUNCTION public.sync_passenger_rating();

UPDATE public.users AS passenger
SET rating = ratings.average_rating
FROM (
  SELECT passenger_clerk_id, AVG(rating)::NUMERIC AS average_rating
  FROM public.passenger_ratings
  GROUP BY passenger_clerk_id
) AS ratings
WHERE passenger.clerk_id = ratings.passenger_clerk_id;
