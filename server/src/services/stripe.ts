import Stripe from "stripe";
import { HttpError } from "../middleware/errorHandler";

let client: Stripe | undefined;

export function getStripeServerClient(): Stripe {
  if (client) return client;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new HttpError(500, "Payments are not configured");
  }

  client = new Stripe(secretKey);
  return client;
}