CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  ride_id BIGINT NOT NULL REFERENCES public.rides(ride_id) ON DELETE CASCADE,
  sender_clerk_id TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_ride_created_at_idx
  ON public.messages (ride_id, created_at, id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.messages FROM anon, authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.messages_id_seq TO service_role;
