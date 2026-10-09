import { Router } from "express";
import { HttpError } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/requireAuth";
import { getStripeServerClient } from "../services/stripe";
import { getSupabaseServerClient } from "../services/supabase";
import { recordDriverPaymentLedger } from "../services/driverPayoutService";

const router = Router();

const OFFER_TRIP_COLUMNS = `
  id,
  driver_id,
  leaving_from,
  going_to,
  leaving_from_lat,
  leaving_from_lng,
  going_to_lat,
  going_to_lng,
  departure_date,
  departure_time,
  repeat_weekly,
  repeat_days,
  seats_available,
  seats_booked,
  price_per_seat,
  service_fee_percentage,
  status,
  created_at,
  updated_at,
  drivers(
    id,
    first_name,
    last_name,
    profile_image_url,
    car_seats,
    rating
  )
`;

router.get("/", async (_request, response) => {
  const { data, error } = await getSupabaseServerClient()
    .from("offer_trip")
    .select(OFFER_TRIP_COLUMNS)
    .eq("status", "active")
    .order("departure_date", { ascending: true })
    .order("departure_time", { ascending: true })
    .limit(20);

  if (error) throw error;

  const availableTrips = (data ?? [])
    .map((trip) => ({
      ...trip,
      seats_available: Number(trip.seats_available),
      seats_booked: Number(trip.seats_booked),
      available_seats: Math.min(
        Number(trip.seats_available),
        Math.max(
          0,
          Number(trip.seats_available) - Number(trip.seats_booked),
        ),
      ),
    }))
    .filter((trip) => trip.status === "active" && trip.available_seats > 0);

  response.json({ data: availableTrips });
});

router.post("/", requireAuth, async (request, response) => {
  const tripId = Number(request.body?.tripId);
  const paymentIntentId = String(request.body?.payment_intent_id ?? "").trim();
  const requestedSeatCount = Number(request.body?.seat_count ?? 1);
  const userId = response.locals.authUserId as string;

  if (
    !Number.isSafeInteger(tripId) ||
    tripId <= 0 ||
    !paymentIntentId ||
    !Number.isSafeInteger(requestedSeatCount) ||
    requestedSeatCount <= 0
  ) {
    throw new HttpError(400, "A valid trip and payment are required");
  }

  const stripe = getStripeServerClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (
    paymentIntent.metadata.clerk_user_id !== userId ||
    paymentIntent.metadata.offer_trip_id !== String(tripId) ||
    Number(paymentIntent.metadata.seat_count ?? 1) !== requestedSeatCount
  ) {
    throw new HttpError(403, "Payment does not match this trip or account");
  }
  if (
    paymentIntent.status !== "succeeded" ||
    paymentIntent.currency !== "zar"
  ) {
    throw new HttpError(400, "Payment is not complete");
  }

  const refundPayment = async () => {
    const existingRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });
    if (existingRefunds.data.length === 0) {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(paymentIntent.transfer_data?.destination
          ? { reverse_transfer: true }
          : {}),
      });
    }
  };

  const supabase = getSupabaseServerClient();
  const { data: trip, error: tripError } = await supabase
    .from("offer_trip")
    .select(
      "id, driver_id, leaving_from, going_to, leaving_from_lat, leaving_from_lng, going_to_lat, going_to_lng, departure_date, departure_time, seats_available, seats_booked, price_per_seat, status",
    )
    .eq("id", tripId)
    .maybeSingle();

  if (tripError) {
    await refundPayment();
    throw new HttpError(500, "Unable to confirm the trip; your payment was refunded");
  }
  if (!trip) {
    await refundPayment();
    throw new HttpError(409, "This trip is unavailable; your payment was refunded");
  }

  const farePerSeatInCents = Math.round(Number(trip.price_per_seat) * 100);
  const totalFareInCents = farePerSeatInCents * requestedSeatCount;
  if (
    !Number.isSafeInteger(farePerSeatInCents) ||
    farePerSeatInCents <= 0 ||
    !Number.isSafeInteger(totalFareInCents) ||
    totalFareInCents > 2_147_483_647
  ) {
    await refundPayment();
    throw new HttpError(500, "The trip fare is invalid; your payment was refunded");
  }
  if (paymentIntent.amount !== totalFareInCents) {
    await refundPayment();
    throw new HttpError(400, "Payment does not match the trip fare; it was refunded");
  }

  const { data: existingRide, error: existingRideError } = await supabase
    .from("rides")
    .select("ride_id, user_id, offer_trip_id, booked_seats, scheduled_for, status, payment_status")
    .eq("stripe_payment_id", paymentIntentId)
    .maybeSingle();
  if (existingRideError) {
    await refundPayment();
    throw new HttpError(500, "Unable to confirm the booking; your payment was refunded");
  }
  if (existingRide) {
    if (existingRide.user_id !== userId) {
      throw new HttpError(403, "This payment belongs to another account");
    }
    if (
      existingRide.offer_trip_id != null &&
      Number(existingRide.offer_trip_id) !== tripId
    ) {
      throw new HttpError(409, "This payment is already linked to another trip");
    }
    if (
      existingRide.status === "cancelled" ||
      existingRide.payment_status === "cancelled"
    ) {
      throw new HttpError(409, "This booking has already been cancelled");
    }
    await recordDriverPaymentLedger({
      supabase,
      driverId: Number(trip.driver_id),
      paymentIntentId,
      amountCents: paymentIntent.amount,
    });
    response.status(200).json({ data: { ride: existingRide } });
    return;
  }

  const { data: booking, error: reservationError } = await supabase.rpc(
    "reserve_offer_trip_seats",
    {
      p_trip_id: tripId,
      p_user_id: userId,
      p_payment_intent_id: paymentIntentId,
      p_seat_count: requestedSeatCount,
      p_fare_per_seat_cents: farePerSeatInCents,
    },
  );

  if (reservationError) {
    await refundPayment();
    if (reservationError.message.includes("insufficient available seats")) {
      throw new HttpError(
        409,
        "This ride no longer has enough seats; your payment was refunded",
      );
    }
    throw new HttpError(
      500,
      "Unable to reserve the seats; your payment was refunded",
    );
  }

  await recordDriverPaymentLedger({
    supabase,
    driverId: Number(trip.driver_id),
    paymentIntentId,
    amountCents: paymentIntent.amount,
  });
  response.status(201).json({ data: booking });
});

export default router;