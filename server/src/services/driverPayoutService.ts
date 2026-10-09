import type Stripe from "stripe";
import { HttpError } from "../middleware/errorHandler";
import { getSupabaseServerClient } from "./supabase";

export type DriverRecord = Record<string, any>;

const PAYOUT_CURRENCY = "zar";

export async function recordDriverPaymentLedger({
  supabase,
  driverId,
  paymentIntentId,
  amountCents,
}: {
  supabase: ReturnType<typeof getSupabaseServerClient>;
  driverId: number;
  paymentIntentId: string;
  amountCents: number;
}) {
  const { error } = await supabase.from("driver_ledger_entries").insert({
    driver_id: driverId,
    entry_type: "payment",
    amount_cents: amountCents,
    currency: PAYOUT_CURRENCY,
    related_type: "payment_intent",
    related_id: paymentIntentId,
    description: `Passenger payment of ${amountCents / 100} ZAR`,
  });

  if (String(error?.code) === "23505" || error?.message?.includes("duplicate")) {
    return;
  }
  if (error) throw error;
}

export function normalizeDriverPayoutAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new HttpError(400, "Enter a valid withdrawal amount");
  }
  return Math.round(amount * 100);
}

export async function getDriverFromClerkId(
  clerkId: string,
  supabase = getSupabaseServerClient(),
) {
  const query = supabase
    .from("drivers")
    .select(
      "id, clerk_id, email, first_name, last_name, stripe_connected_account_id, stripe_account_status, stripe_onboarding_url",
    )
    .eq("clerk_id", clerkId);
  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Driver not found");

  return data as DriverRecord;
}

export async function ensureDriverStripeConnectAccount({
  stripe,
  supabase,
  clerkId,
}: {
  stripe: Stripe;
  supabase: ReturnType<typeof getSupabaseServerClient>;
  clerkId: string;
}) {
  const driver = await getDriverFromClerkId(clerkId, supabase);
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new HttpError(503, "APP_URL must be configured for Stripe Connect onboarding");
  }

  let account: Stripe.Account;
  if (driver.stripe_connected_account_id) {
    account = await stripe.accounts.retrieve(driver.stripe_connected_account_id);
  } else {
    const country = process.env.STRIPE_CONNECT_ACCOUNT_COUNTRY?.toUpperCase();
    if (!country || !/^[A-Z]{2}$/.test(country)) {
      throw new HttpError(
        503,
        "Set STRIPE_CONNECT_ACCOUNT_COUNTRY to the driver's eligible Stripe country",
      );
    }

    account = await stripe.accounts.create({
      type: "express",
      country,
      ...(driver.email ? { email: driver.email } : {}),
      capabilities: { transfers: { requested: true } },
      metadata: {
        driver_id: String(driver.id),
        clerk_user_id: clerkId,
        source: "driver-wallet",
      },
    });
  }

  const accountReady =
    account.payouts_enabled && account.capabilities?.transfers === "active";
  if (accountReady) {
    const { error } = await supabase
      .from("drivers")
      .update({
        stripe_account_status: "connected",
        stripe_onboarding_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driver.id);
    if (error) throw error;

    return {
      driver: { ...driver, stripe_account_status: "connected", stripe_onboarding_url: null },
      driverId: driver.id,
      accountId: account.id,
      onboardingUrl: null,
      status: "connected",
    };
  }

  const onboarding = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: new URL("/driver/onboarding/refresh", appUrl).toString(),
    return_url: new URL("/driver/onboarding/return", appUrl).toString(),
    type: "account_onboarding",
  });

  const { error } = await supabase
    .from("drivers")
    .update({
      stripe_connected_account_id: account.id,
      stripe_account_status: "onboarding_required",
      stripe_onboarding_url: onboarding.url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", driver.id);

  if (error) throw error;

  return {
    driver: {
      ...driver,
      stripe_connected_account_id: account.id,
      stripe_account_status: "onboarding_required",
      stripe_onboarding_url: onboarding.url,
    },
    driverId: driver.id,
    accountId: account.id,
    onboardingUrl: onboarding.url,
    status: "onboarding_required",
  };
}

export async function getDriverAvailableBalance({
  stripe,
  clerkId,
  supabase,
}: {
  stripe: Stripe;
  supabase: ReturnType<typeof getSupabaseServerClient>;
  clerkId: string;
}) {
  const driver = await getDriverFromClerkId(clerkId, supabase);
  if (!driver.stripe_connected_account_id) {
    throw new HttpError(400, "Driver Stripe account has not been configured");
  }

  const account = await stripe.accounts.retrieve(driver.stripe_connected_account_id);
  const balance = await stripe.balance.retrieve(undefined, {
    stripeAccount: driver.stripe_connected_account_id,
  } as Stripe.RequestOptions);
  const available =
    balance.available?.find((entry) => entry.currency === PAYOUT_CURRENCY)?.amount ?? 0;
  const pending =
    balance.pending?.find((entry) => entry.currency === PAYOUT_CURRENCY)?.amount ?? 0;

  return {
    currency: PAYOUT_CURRENCY,
    payouts_enabled:
      account.payouts_enabled && account.capabilities?.transfers === "active",
    available_cents: available,
    pending_cents: pending,
    available_rands: Number((available / 100).toFixed(2)),
  };
}

export async function createDriverWithdrawal({
  stripe,
  supabase,
  clerkId,
  amount,
}: {
  stripe: Stripe;
  supabase: ReturnType<typeof getSupabaseServerClient>;
  clerkId: string;
  amount: number;
}) {
  const driver = await getDriverFromClerkId(clerkId, supabase);
  if (!driver.stripe_connected_account_id) {
    throw new HttpError(400, "Driver Stripe account has not been configured");
  }

  const amountCents = normalizeDriverPayoutAmount(amount);
  const balance = await getDriverAvailableBalance({ stripe, clerkId, supabase });

  if (!balance.payouts_enabled) {
    throw new HttpError(409, "Complete Stripe Connect onboarding before withdrawing");
  }

  if (amountCents > balance.available_cents) {
    throw new HttpError(422, "Insufficient available balance for this withdrawal");
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from("driver_withdrawals")
    .select("id, status")
    .eq("driver_id", driver.id)
    .in("status", ["pending"])
    .eq("amount_cents", amountCents)
    .maybeSingle();

  if (duplicateError) throw duplicateError;
  if (duplicate) {
    throw new HttpError(409, "This withdrawal has already been requested");
  }

  const payout = await stripe.payouts.create(
    {
      amount: amountCents,
      currency: PAYOUT_CURRENCY,
      description: `Driver withdrawal for ${driver.first_name ?? "driver"}`,
      metadata: {
        clerk_user_id: clerkId,
        driver_id: String(driver.id),
        withdrawal_amount_cents: String(amountCents),
      },
    },
    { stripeAccount: driver.stripe_connected_account_id },
  );

  const { data, error } = await supabase
    .from("driver_withdrawals")
    .insert({
      driver_id: driver.id,
      stripe_connected_account_id: driver.stripe_connected_account_id,
      stripe_payout_id: payout.id,
      amount_cents: amountCents,
      currency: PAYOUT_CURRENCY,
      status: "pending",
      failure_reason: null,
      paid_at: null,
    })
    .select(
      "id, driver_id, stripe_connected_account_id, stripe_payout_id, amount_cents, currency, status, failure_reason, created_at, updated_at, paid_at",
    )
    .single();

  if (error) throw error;

  const { error: ledgerError } = await supabase.from("driver_ledger_entries").insert({
    driver_id: driver.id,
    entry_type: "withdrawal",
    amount_cents: -amountCents,
    currency: PAYOUT_CURRENCY,
    related_type: "driver_withdrawal",
    related_id: data?.id ?? payout.id,
    description: `Driver withdrawal of ${amountCents / 100} ZAR`,
  });
  if (ledgerError) throw ledgerError;

  return {
    withdrawal: {
      id: data?.id ?? payout.id,
      driver_id: driver.id,
      stripe_connected_account_id: driver.stripe_connected_account_id,
      stripe_payout_id: payout.id,
      amount_cents: amountCents,
      amount_rands: Number((amountCents / 100).toFixed(2)),
      currency: PAYOUT_CURRENCY,
      status: "pending",
      failure_reason: null,
      created_at: data?.created_at ?? new Date().toISOString(),
      updated_at: data?.updated_at ?? new Date().toISOString(),
      paid_at: null,
    },
  };
}

async function recordStripeWebhookEvent(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  event: Stripe.Event,
) {
  const { error } = await supabase.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    payload: event,
  });

  if (String(error?.code) === "23505" || error?.message?.includes("duplicate")) {
    return false;
  }
  if (error) throw error;
  return true;
}

export async function processStripePayoutEvent({
  stripe,
  supabase,
  event,
}: {
  stripe: Stripe;
  supabase: ReturnType<typeof getSupabaseServerClient>;
  event: Stripe.Event;
}) {
  const payout = event.data.object as Stripe.Payout;
  const payoutWithExtras = payout as typeof payout & {
    failure_code?: string;
    failure_message?: string;
  };
  const payoutId = payout.id;
  const driverId = Number(payout.metadata?.driver_id ?? 0);
  const connectedAccountId = event.account ?? "";

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingEventError) throw existingEventError;
  if (existingEvent) {
    return { processed: false, duplicate: true };
  }

  const normalizedStatus =
    event.type === "payout.paid"
      ? "paid"
      : event.type === "payout.failed"
        ? "failed"
        : event.type === "payout.created"
          ? "pending"
          : event.type === "payout.updated"
            ? "pending"
            : "pending";

  const { data: existingWithdrawal, error: readError } = await supabase
    .from("driver_withdrawals")
    .select(
      "id, status, amount_cents, driver_id, stripe_payout_id, failure_reason, paid_at",
    )
    .eq("stripe_payout_id", payoutId)
    .maybeSingle();

  if (readError) throw readError;

  const amountCents = Number(payout.amount ?? existingWithdrawal?.amount_cents ?? 0);
  const driverMetaId = Number.isFinite(driverId) && driverId > 0 ? driverId : existingWithdrawal?.driver_id ?? null;

  if (!existingWithdrawal) {
    if (!driverMetaId) {
      const recorded = await recordStripeWebhookEvent(supabase, event);
      if (!recorded) return { processed: false, duplicate: true };
      return { processed: true, duplicate: false, ignored: true };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("driver_withdrawals")
      .insert({
        driver_id: driverMetaId,
        stripe_connected_account_id: connectedAccountId,
        stripe_payout_id: payoutId,
        amount_cents: amountCents,
        currency: payout.currency ?? "zar",
        status: normalizedStatus,
        failure_reason: payoutWithExtras.failure_code ?? payoutWithExtras.failure_message ?? null,
        paid_at: normalizedStatus === "paid" ? new Date().toISOString() : null,
      })
      .select(
        "id, driver_id, stripe_connected_account_id, stripe_payout_id, amount_cents, currency, status, failure_reason, created_at, updated_at, paid_at",
      )
      .single();

    if (insertError) throw insertError;
    const { error: ledgerError } = await supabase
      .from("driver_ledger_entries")
      .insert({
        driver_id: driverMetaId,
        entry_type: "withdrawal",
        amount_cents: -amountCents,
        currency: payout.currency ?? PAYOUT_CURRENCY,
        related_type: "stripe_payout",
        related_id: payoutId,
        description: `Driver withdrawal of ${amountCents / 100} ZAR`,
      });
    if (ledgerError && String(ledgerError.code) !== "23505") throw ledgerError;
    const recorded = await recordStripeWebhookEvent(supabase, event);
    if (!recorded) return { processed: false, duplicate: true };
    return { processed: true, duplicate: false, withdrawal: inserted };
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
    failure_reason:
      payoutWithExtras.failure_code || payoutWithExtras.failure_message
        ? (payoutWithExtras.failure_code ?? payoutWithExtras.failure_message ?? null)
        : existingWithdrawal.failure_reason,
  };

  if (normalizedStatus === "paid") {
    updatePayload.status = "paid";
    updatePayload.paid_at = new Date().toISOString();
  } else if (normalizedStatus === "failed") {
    updatePayload.status = "failed";
    updatePayload.paid_at = null;
  } else {
    updatePayload.status = "pending";
  }

  const { data: updated, error: updateError } = await supabase
    .from("driver_withdrawals")
    .update(updatePayload)
    .eq("id", existingWithdrawal.id)
    .select(
      "id, driver_id, stripe_connected_account_id, stripe_payout_id, amount_cents, currency, status, failure_reason, created_at, updated_at, paid_at",
    )
    .single();

  if (updateError) throw updateError;

  if (normalizedStatus === "failed") {
    const { error: reversalError } = await supabase
      .from("driver_ledger_entries")
      .insert({
        driver_id: existingWithdrawal.driver_id,
        entry_type: "withdrawal_reversal",
        amount_cents: amountCents,
        currency: payout.currency ?? PAYOUT_CURRENCY,
        related_type: "stripe_payout",
        related_id: payoutId,
        description: `Failed withdrawal returned ${amountCents / 100} ZAR`,
      });
    if (reversalError && String(reversalError.code) !== "23505") {
      throw reversalError;
    }
  }

  const recorded = await recordStripeWebhookEvent(supabase, event);
  if (!recorded) return { processed: false, duplicate: true };

  return { processed: true, duplicate: false, withdrawal: updated };
}

export function verifyStripePayoutWebhookSignature({
  stripe,
  rawBody,
  signature,
}: {
  stripe: Stripe;
  rawBody: Buffer | string;
  signature?: string | string[];
}) {
  if (!signature || Array.isArray(signature)) {
    throw new HttpError(400, "Missing Stripe webhook signature");
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new HttpError(500, "Stripe webhook secret is not configured");
  }

  return stripe.webhooks.constructEvent(
    typeof rawBody === "string" ? Buffer.from(rawBody) : rawBody,
    signature,
    secret,
  );
}
