import { getSupabaseServerClient } from "@/lib/supabase-server";

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

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("offer_trip")
      .select(OFFER_TRIP_COLUMNS)
      .eq("status", "active")
      .order("departure_date", { ascending: true })
      .order("departure_time", { ascending: true })
      .limit(20);

    if (error) throw error;

    const availableTrips = (data ?? []).filter(
      (trip: any) => Number(trip.seats_booked) < Number(trip.seats_available),
    );

    return Response.json({ data: availableTrips });
  } catch {
    return Response.json({ data: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tripId = Number(body?.tripId);
    const userId = String(body?.userId ?? "").trim();

    if (!Number.isInteger(tripId) || tripId <= 0 || !userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
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
      return Response.json(
        { error: "This ride is no longer available" },
        { status: 409 },
      );
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
      return Response.json(
        { error: "This ride was just booked by someone else" },
        { status: 409 },
      );
    }

    const scheduledFor = new Date(
      `${trip.departure_date}T${trip.departure_time}Z`,
    ).toISOString();
    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .insert({
        origin_address: trip.leaving_from,
        destination_address: trip.going_to,
        origin_latitude: trip.leaving_from_lat,
        origin_longitude: trip.leaving_from_lng,
        destination_latitude: trip.going_to_lat,
        destination_longitude: trip.going_to_lng,
        ride_time: scheduledFor,
        scheduled_for: scheduledFor,
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

    return Response.json({ data: { trip: updatedTrip, ride } }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to book this ride" }, { status: 500 });
  }
}
