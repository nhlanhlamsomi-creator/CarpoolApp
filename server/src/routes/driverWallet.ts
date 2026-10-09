import { Request, Response, Router } from "express";
import { HttpError } from "../middleware/errorHandler";
import { getStripeServerClient } from "../services/stripe";
import { getSupabaseServerClient } from "../services/supabase";
import {
  createDriverWithdrawal,
  ensureDriverStripeConnectAccount,
  getDriverFromClerkId,
  getDriverAvailableBalance,
  processStripePayoutEvent,
  verifyStripePayoutWebhookSignature,
} from "../services/driverPayoutService";

const router = Router();

function userIdFrom(response: Parameters<Parameters<typeof router.get>[1]>[1]) {
  return response.locals.authUserId as string;
}

router.post("/connect", async (_request, response) => {
  const clerkId = userIdFrom(response);
  const stripe = getStripeServerClient();
  const supabase = getSupabaseServerClient();

  const result = await ensureDriverStripeConnectAccount({
    stripe,
    supabase,
    clerkId,
  });

  response.json({
    data: {
      driver_id: result.driverId,
      stripe_connected_account_id: result.accountId,
      stripe_account_status: result.status,
      onboarding_url: result.onboardingUrl,
    },
  });
});

router.get("/balance", async (_request, response) => {
  const clerkId = userIdFrom(response);
  const stripe = getStripeServerClient();
  const supabase = getSupabaseServerClient();

  const balance = await getDriverAvailableBalance({ stripe, supabase, clerkId });
  response.json({ data: balance });
});

router.get("/withdrawals", async (_request, response) => {
  const clerkId = userIdFrom(response);
  const supabase = getSupabaseServerClient();
  const driver = await getDriverFromClerkId(clerkId, supabase);
  const { data, error } = await supabase
    .from("driver_withdrawals")
    .select(
      "id, stripe_payout_id, amount_cents, currency, status, failure_reason, created_at, updated_at, paid_at",
    )
    .eq("driver_id", driver.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  response.json({ data: data ?? [] });
});

router.post("/withdraw", async (request, response) => {
  const clerkId = userIdFrom(response);
  const amount = Number(request.body?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, "Withdrawal amount must be greater than zero");
  }

  const stripe = getStripeServerClient();
  const supabase = getSupabaseServerClient();
  const result = await createDriverWithdrawal({
    stripe,
    supabase,
    clerkId,
    amount,
  });

  response.status(201).json({ data: result.withdrawal });
});

export async function handleStripePayoutWebhook(
  request: Request,
  response: Response,
) {
  const stripe = getStripeServerClient();
  const supabase = getSupabaseServerClient();

  const stripeSignature = request.headers["stripe-signature"];
  const rawBody = request.body instanceof Buffer ? request.body : Buffer.from(JSON.stringify(request.body ?? {}));

  try {
    const event = verifyStripePayoutWebhookSignature({
      stripe,
      rawBody,
      signature: stripeSignature,
    });

    if (event.type === "payout.created" || event.type === "payout.updated" || event.type === "payout.paid" || event.type === "payout.failed") {
      const result = await processStripePayoutEvent({
        stripe,
        supabase,
        event,
      });

      if (result.duplicate) {
        response.json({ received: true, duplicate: true });
        return;
      }
    }

    response.json({ received: true });
  } catch (error) {
    if (error instanceof HttpError) {
      response.status(error.status).json({ error: error.message });
      return;
    }
    console.error("Stripe payout webhook error", error);
    response.status(400).json({ error: "Invalid Stripe webhook payload" });
  }
}

export default router;
