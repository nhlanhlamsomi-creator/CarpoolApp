import type Stripe from "stripe";
import { HttpError } from "../middleware/errorHandler";
import { getSupabaseServerClient } from "./supabase";

export type DriverRecord = Record<string, any>;

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

  if (driver.stripe_connected_account_id) {
    return {
      driver,
      accountId: driver.stripe_connected_account_id,
      onboardingUrl: driver.stripe_onboarding_url ?? null,
      status: driver.stripe_account_status ?? "connected",
    };
  }

  const account = await stripe.accounts.create({
    type: "standard",
    country: "US",
    email: driver.email ?? `${clerkId}@example.invalid`,
    capabilities: { transfers: { requested: true } },
    metadata: {
      driver_id: String(driver.id),
      clerk_user_id: clerkId,
      source: "driver-wallet",
    },
  });

  const returnUrl =
    process.env.APP_URL || "https://example.com/driver/onboarding/return";
  const refreshUrl =
    process.env.APP_URL || "https://example.com/driver/onboarding/refresh";

  const onboarding = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  const { error } = await supabase
    .from("drivers")
    .update({
      stripe_connected_account_id: account.id,
      stripe_account_status: "created",
      stripe_onboarding_url: onboarding.url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", driver.id);

  if (error) throw error;

  return {
    driver: {
      ...driver,
      stripe_connected_account_id: account.id,
      stripe_account_status: "created",
      stripe_onboarding_url: onboarding.url,
    },
    accountId: account.id,
    onboardingUrl: onboarding.url,
    status: "created",
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

  const balance = await stripe.balance.retrieve(undefined, {
    stripeAccount: driver.stripe_connected_account_id,
  } as Stripe.RequestOptions);
  const available = balance.available?.find((entry) => entry.currency === "zar")?.amount ?? 0;
  const pending = balance.pending?.find((entry) => entry.currency === "zar")?.amount ?? 0;

  return {
    currency: "zar",
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

  if (amountCents > balance.available_cents) {
    throw new HttpError(422, "Insufficient available balance for this withdrawal");
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from("driver_withdrawals")
    .select("id, status")
    .eq("driver_id", driver.id)
    .in("status", ["pending", "paid"])
    .eq("amount_cents", amountCents)
    .maybeSingle();

  if (duplicateError) throw duplicateError;
  if (duplicate) {
    throw new HttpError(409, "This withdrawal has already been requested");
  }

  const payout = await stripe.payouts.create(
    {
      amount: amountCents,
      currency: "zar",
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
      currency: "zar",
      status: payout.status === "pending" ? "pending" : payout.status,
      failure_reason: null,
      paid_at: null,
    })
    .select(
      "id, driver_id, stripe_connected_account_id, stripe_payout_id, amount_cents, currency, status, failure_reason, created_at, updated_at, paid_at",
    )
    .single();

  if (error) throw error;

  await supabase.from("driver_ledger_entries").insert({
    driver_id: driver.id,
    entry_type: "withdrawal",
    amount_cents: -amountCents,
    currency: "zar",
    related_type: "driver_withdrawal",
    related_id: data?.id ?? payout.id,
    description: `Driver withdrawal of ${amountCents / 100} ZAR`,
  });

  return {
    withdrawal: {
      id: data?.id ?? payout.id,
      driver_id: driver.id,
      stripe_connected_account_id: driver.stripe_connected_account_id,
      stripe_payout_id: payout.id,
      amount_cents: amountCents,
      amount_rands: Number((amountCents / 100).toFixed(2)),
      currency: "zar",
      status: "pending",
      failure_reason: null,
      created_at: data?.created_at ?? new Date().toISOString(),
      updated_at: data?.updated_at ?? new Date().toISOString(),
      paid_at: null,
    },
  };
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
    account?: string;
    failure_code?: string;
    failure_message?: string;
  };
  const payoutId = payout.id;
  const driverId = Number(payout.metadata?.driver_id ?? 0);

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingEventError) throw existingEventError;
  if (existingEvent) {
    return { processed: false, duplicate: true };
  }

  const { error: eventError } = await supabase.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    payload: event,
  });

  if (eventError) {
    if (String(eventError.code) === "23505" || eventError.message?.includes("duplicate")) {
      return { processed: false, duplicate: true };
    }
    throw eventError;
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
      return { processed: true, duplicate: false, ignored: true };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("driver_withdrawals")
      .insert({
        driver_id: driverMetaId,
        stripe_connected_account_id: payoutWithExtras.account ?? "",
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
