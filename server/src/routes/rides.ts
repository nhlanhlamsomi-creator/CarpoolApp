import { Router } from "express";
import { HttpError } from "../middleware/errorHandler";
import { getStripeServerClient } from "../services/stripe";
import { getSupabaseServerClient } from "../services/supabase";

const router = Router();

function userIdFrom(response: Parameters<Parameters<typeof router.get>[1]>[1]) {
  return response.locals.authUserId as string;
}

function finiteCoordinate(value: unknown, minimum: number, maximum: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? number
    : null;
}

router.get("/", async (_request, response) => {
  const userId = userIdFrom(response);
  const { data, error } = await getSupabaseServerClient()
    .from("rides")
    .select(
      "*, drivers(id, first_name, last_name, profile_image_url, car_image_url, car_seats, rating, phone_number)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rides = (data ?? []).map((ride: Record<string, any>) => {
    const driver = Array.isArray(ride.drivers) ? ride.drivers[0] : ride.drivers;
    return {
      ...ride,
      duration_minutes:
        ride.duration_minutes == null ? null : Number(ride.duration_minutes),
      status: ride.status ?? null,
      driver: driver
        ? {
            driver_id: driver.id,
            first_name: driver.first_name ?? "",
            last_name: driver.last_name ?? "",
            profile_image_url: driver.profile_image_url,
            car_image_url: driver.car_image_url,
            car_seats: Number.isFinite(Number(driver.car_seats))
              ? Number(driver.car_seats)
              : null,
            rating: driver.rating,
            phone_number: driver.phone_number,
          }
        : null,
    };
  });

  response.json({ data: rides });
});

router.post("/", async (request, response) => {
  const userId = userIdFrom(response);
  const body = request.body as Record<string, unknown>;
  const originAddress = String(body.origin_address ?? "").trim();
  const destinationAddress = String(body.destination_address ?? "").trim();
  const originLatitude = finiteCoordinate(body.origin_latitude, -90, 90);
  const originLongitude = finiteCoordinate(body.origin_longitude, -180, 180);
  const destinationLatitude = finiteCoordinate(
    body.destination_latitude,
    -90,
    90,
  );
  const destinationLongitude = finiteCoordinate(
    body.destination_longitude,
    -180,
    180,
  );
  const farePrice = Number(body.fare_price);
  const driverId = Number(body.driver_id);
  const paymentIntentId = String(body.payment_intent_id ?? "").trim();

  if (
    !originAddress ||
    originAddress.length > 500 ||
    !destinationAddress ||
    destinationAddress.length > 500 ||
    originLatitude === null ||
    originLongitude === null ||
    destinationLatitude === null ||
    destinationLongitude === null ||
    !Number.isSafeInteger(farePrice) ||
    farePrice <= 0 ||
    !Number.isSafeInteger(driverId) ||
    driverId <= 0 ||
    !paymentIntentId
  ) {
    throw new HttpError(400, "Invalid or missing ride details");
  }

  const rideTimeValue = body.ride_time;
  const rideTimeNumber = Number(rideTimeValue);
  let scheduledFor: string;
  let durationMinutes: number | null;
  if (Number.isFinite(rideTimeNumber) && rideTimeNumber > 0) {
    durationMinutes = Math.round(rideTimeNumber);
    scheduledFor = new Date(Date.now() + durationMinutes * 60000).toISOString();
  } else if (typeof rideTimeValue === "string") {
    const date = new Date(rideTimeValue);
    if (!Number.isFinite(date.getTime())) {
      throw new HttpError(400, "Invalid ride time");
    }
    scheduledFor = date.toISOString();
    durationMinutes = null;
  } else {
    throw new HttpError(400, "Invalid ride time");
  }

  const stripe = getStripeServerClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.metadata.clerk_user_id !== userId) {
    throw new HttpError(403, "Payment does not belong to this account");
  }
  if (
    paymentIntent.status !== "succeeded" ||
    paymentIntent.currency !== "zar" ||
    paymentIntent.amount !== farePrice
  ) {
    throw new HttpError(400, "Payment is not complete or does not match the fare");
  }

  const supabase = getSupabaseServerClient();
  const { data: existingRide, error: existingRideError } = await supabase
    .from("rides")
    .select("ride_id")
    .eq("stripe_payment_id", paymentIntentId)
    .maybeSingle();
  if (existingRideError) throw existingRideError;
  if (existingRide) throw new HttpError(409, "This payment already has a ride");

  const { data, error } = await supabase
    .from("rides")
    .insert({
      origin_address: originAddress,
      destination_address: destinationAddress,
      origin_latitude: originLatitude,
      origin_longitude: originLongitude,
      destination_latitude: destinationLatitude,
      destination_longitude: destinationLongitude,
      ride_time: scheduledFor,
      duration_minutes: durationMinutes,
      scheduled_for: scheduledFor,
      status: "booked",
      fare_price: farePrice,
      payment_status: "paid",
      payment_method: "Stripe",
      stripe_payment_id: paymentIntentId,
      driver_id: driverId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  response.status(201).json({ data });
});

router.post("/:rideId/cancel", async (request, response) => {
  const userId = userIdFrom(response);
  const rideId = Number(request.params.rideId);
  if (!Number.isSafeInteger(rideId) || rideId <= 0) {
    throw new HttpError(400, "Invalid ride ID");
  }

  const supabase = getSupabaseServerClient();
  const { data: ride, error: readError } = await supabase
    .from("rides")
    .select("ride_id, payment_status")
    .eq("ride_id", rideId)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;
  if (!ride) throw new HttpError(404, "Ride not found");
  if (ride.payment_status === "cancelled") {
    response.json({ data: { ok: true } });
    return;
  }

  const { data, error } = await supabase
    .from("rides")
    .update({
      payment_status: "cancelled",
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("ride_id", rideId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  response.json({ data });
});

export default router;