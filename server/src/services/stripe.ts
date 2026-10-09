import Stripe from "stripe";
import { HttpError } from "../middleware/errorHandler";

let client: Stripe | undefined;

export function getStripeServerClient(): Stripe {
  if (client) return client;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey?.startsWith("sk_test_")) {
    throw new HttpError(
      503,
      "Stripe Sandbox is not configured. Set STRIPE_SECRET_KEY to a test-mode secret key.",
    );
  }

  client = new Stripe(secretKey);
  return client;
}