CREATE TABLE IF NOT EXISTS public.ride_location_updates (
  id BIGSERIAL PRIMARY KEY,
  ride_id BIGINT NOT NULL REFERENCES public.rides(ride_id) ON DELETE CASCADE,
  driver_id BIGINT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ride_location_updates_ride_time_idx
  ON public.ride_location_updates (ride_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id BIGSERIAL PRIMARY KEY,
  ride_id BIGINT NOT NULL REFERENCES public.rides(ride_id) ON DELETE CASCADE,
  passenger_id TEXT NOT NULL,
  driver_id BIGINT NOT NULL,
  incident_type TEXT NOT NULL DEFAULT 'ride_safety',
  severity TEXT NOT NULL DEFAULT 'high',
  trigger_source TEXT NOT NULL CHECK (trigger_source IN ('MANUAL', 'AUTOMATED')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  reason TEXT NOT NULL,
  route_deviation_meters INTEGER,
  passenger_response TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS ride_id BIGINT;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS passenger_id TEXT;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS driver_id BIGINT;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS incident_type TEXT DEFAULT 'ride_safety';
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'high';
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS trigger_source TEXT;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS route_deviation_meters INTEGER;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS passenger_response TEXT;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE public.safety_alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS safety_alerts_passenger_time_idx
  ON public.safety_alerts (passenger_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS one_open_automated_alert_per_ride_idx
  ON public.safety_alerts (ride_id)
  WHERE trigger_source = 'AUTOMATED' AND status IN ('open', 'acknowledged');