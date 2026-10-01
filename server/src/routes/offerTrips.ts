import { Router } from "express";
import { HttpError } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/requireAuth";
import { getSupabaseServerClient } from "../services/supabase";

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

  const availableTrips = (data ?? []).filter(
    (trip) => Number(trip.seats_booked) < Number(trip.seats_available),
  );

  response.json({ data: availableTrips });
});

router.post("/", requireAuth, async (request, response) => {
  const tripId = Number(request.body?.tripId);
  const userId = response.locals.authUserId as string;

  if (!Number.isSafeInteger(tripId) || tripId <= 0) {
    throw new HttpError(400, "Invalid trip ID");
  }

  const supabase = getSupabaseServerClient();
  const { data: trip, error: tripError } = await supabase
    .from("offer_trip")
    .select(
      "id, driver_id, leaving_from, going_to, leaving_from_lat, leaving_from_lng, going_to_lat, going_to_lng, departure_date, departure_time, seats_available, seats_booked, price_per_seat, status",
    )
    .eq("id", tripId)
    .maybeSingle();

  if (tripError) throw tripError;
  if (
    !trip ||
    trip.status !== "active" ||
    Number(trip.seats_booked) >= Number(trip.seats_available)
  ) {
    throw new HttpError(409, "This ride is no longer available");
  }

  const currentSeatsBooked = Number(trip.seats_booked);
  const { data: updatedTrip, error: updateError } = await supabase
    .from("offer_trip")
    .update({
      seats_booked: currentSeatsBooked + 1,
      status:
        currentSeatsBooked + 1 >= Number(trip.seats_available)
          ? "full"
          : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", tripId)
    .eq("status", "active")
    .eq("seats_booked", currentSeatsBooked)
    .select("id, seats_available, seats_booked, status")
    .maybeSingle();

  if (updateError) throw updateError;
  if (!updatedTrip) {
    throw new HttpError(409, "This ride was just booked by someone else");
  }

  const scheduledFor = new Date(
    `${trip.departure_date}T${trip.departure_time}Z`,
  );
  if (!Number.isFinite(scheduledFor.getTime())) {
    throw new HttpError(500, "The trip has an invalid departure time");
  }

  const scheduledForIso = scheduledFor.toISOString();
  const { data: ride, error: rideError } = await supabase
    .from("rides")
    .insert({
      origin_address: trip.leaving_from,
      destination_address: trip.going_to,
      origin_latitude: trip.leaving_from_lat,
      origin_longitude: trip.leaving_from_lng,
      destination_latitude: trip.going_to_lat,
      destination_longitude: trip.going_to_lng,
      ride_time: scheduledForIso,
      scheduled_for: scheduledForIso,
      status: "booked",
      fare_price: Math.round(Number(trip.price_per_seat) * 100),
      payment_status: "pending",
      payment_method: "Offer trip reservation",
      driver_id: trip.driver_id,
      user_id: userId,
    })
    .select("ride_id, scheduled_for, status")
    .single();

  if (rideError) {
    await supabase
      .from("offer_trip")
      .update({
        seats_booked: currentSeatsBooked,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId)
      .eq("seats_booked", currentSeatsBooked + 1);
    throw rideError;
  }

  response.status(201).json({ data: { trip: updatedTrip, ride } });
});

export default router;