-- Allow public reads for hub and safety metadata used by the mobile app.
-- Run this in the Supabase SQL editor against the target project.

ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.hubs TO anon;
GRANT SELECT ON public.safety_alerts TO anon;

DROP POLICY IF EXISTS "public_hubs_are_viewable_by_anon" ON public.hubs;
CREATE POLICY "public_hubs_are_viewable_by_anon"
  ON public.hubs
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "public_safety_alerts_are_viewable_by_anon" ON public.safety_alerts;
CREATE POLICY "public_safety_alerts_are_viewable_by_anon"
  ON public.safety_alerts
  FOR SELECT
  TO anon
  USING (true);
