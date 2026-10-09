ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS stripe_connected_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_account_status TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS stripe_onboarding_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.driver_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id BIGINT NOT NULL,
  stripe_connected_account_id TEXT NOT NULL,
  stripe_payout_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'zar',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.driver_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id BIGINT NOT NULL,
  entry_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'zar',
  related_type TEXT,
  related_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS driver_withdrawals_driver_id_idx
  ON public.driver_withdrawals USING btree (driver_id);

CREATE INDEX IF NOT EXISTS driver_withdrawals_status_idx
  ON public.driver_withdrawals USING btree (status);

CREATE INDEX IF NOT EXISTS driver_ledger_entries_driver_id_idx
  ON public.driver_ledger_entries USING btree (driver_id);
