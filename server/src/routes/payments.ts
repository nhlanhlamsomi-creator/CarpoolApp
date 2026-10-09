import { Router } from "express";
import type Stripe from "stripe";
import { HttpError } from "../middleware/errorHandler";
import { getStripeServerClient } from "../services/stripe";
import { getSupabaseServerClient } from "../services/supabase";

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
  const offerTripId =
    body.offer_trip_id == null ? null : Number(body.offer_trip_id);
  const seatCount = Number(body.seat_count ?? 1);
  const requestedDriverId =
    body.driver_id == null ? null : Number(body.driver_id);

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    (offerTripId !== null &&
      (!Number.isSafeInteger(offerTripId) || offerTripId <= 0)) ||
    !Number.isSafeInteger(seatCount) ||
    seatCount <= 0 ||
    (offerTripId === null && seatCount !== 1)
    || (requestedDriverId !== null &&
      (!Number.isSafeInteger(requestedDriverId) || requestedDriverId <= 0))
  ) {
    throw new HttpError(400, "A valid amount and email are required");
  }

  const amountCents = Math.round(amount * 100);
  const supabase = getSupabaseServerClient();
  let driverId = requestedDriverId;
  if (offerTripId !== null) {
    const { data: trip, error: tripError } = await supabase
      .from("offer_trip")
      .select("id, driver_id, price_per_seat, status")
      .eq("id", offerTripId)
      .maybeSingle();

    if (tripError) throw tripError;
    if (!trip || trip.status !== "active") {
      throw new HttpError(404, "This trip is not available for payment");
    }

    const farePerSeatCents = Math.round(Number(trip.price_per_seat) * 100);
    if (farePerSeatCents * seatCount !== amountCents) {
      throw new HttpError(400, "Payment amount does not match the trip fare");
    }
    driverId = Number(trip.driver_id);
  }

  if (driverId === null) {
    throw new HttpError(400, "A driver is required for this payment");
  }

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id, stripe_connected_account_id")
    .eq("id", driverId)
    .maybeSingle();
  if (driverError) throw driverError;
  if (!driver?.stripe_connected_account_id) {
    throw new HttpError(409, "This driver has not connected a Stripe payout account");
  }

  const stripe = getStripeServerClient();
  const connectedAccount = await stripe.accounts.retrieve(
    driver.stripe_connected_account_id,
  );
  if (
    !connectedAccount.payouts_enabled ||
    connectedAccount.capabilities?.transfers !== "active"
  ) {
    throw new HttpError(409, "This driver's Stripe payout account is not ready");
  }

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
    amount: amountCents,
    currency: "zar",
    customer: customer.id,
    payment_method_types: ["card"],
    confirm: false,
    description: `Lyft ride booking for ${name}`,
    receipt_email: email,
    transfer_data: { destination: driver.stripe_connected_account_id },
    metadata: {
      clerk_user_id: userId,
      driver_id: String(driver.id),
      stripe_connected_account_id: driver.stripe_connected_account_id,
      ...(offerTripId === null ? {} : { offer_trip_id: String(offerTripId) }),
      ...(offerTripId === null ? {} : { seat_count: String(seatCount) }),
    },
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