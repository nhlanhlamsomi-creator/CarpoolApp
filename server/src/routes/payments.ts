import { Router } from "express";
import type Stripe from "stripe";
import { HttpError } from "../middleware/errorHandler";
import { getStripeServerClient } from "../services/stripe";

const router = Router();

function userIdFrom(response: Parameters<Parameters<typeof router.post>[1]>[1]) {
  return response.locals.authUserId as string;
}

router.post("/intents", async (request, response) => {
  const userId = userIdFrom(response);
  const body = request.body as Record<string, unknown>;
  const amount = Number(body.amount);
  const name = String(body.name ?? "Passenger").trim().slice(0, 120) || "Passenger";
  const email = String(body.email ?? "").trim().slice(0, 254);

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new HttpError(400, "A valid amount and email are required");
  }

  const stripe = getStripeServerClient();
  const candidates = await stripe.customers.list({ email, limit: 10 });
  let customer = candidates.data.find(
    (candidate) => candidate.metadata.clerk_user_id === userId,
  );
  if (!customer) {
    customer = await stripe.customers.create({
      name,
      email,
      metadata: { clerk_user_id: userId },
    });
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-06-20" as Stripe.LatestApiVersion },
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "zar",
    customer: customer.id,
    payment_method_types: ["card"],
    confirm: false,
    description: `Lyft ride booking for ${name}`,
    receipt_email: email,
    metadata: { clerk_user_id: userId },
  });

  response.status(201).json({
    paymentIntent: {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    },
    ephemeralKey,
    customer: customer.id,
  });
});

export default router;