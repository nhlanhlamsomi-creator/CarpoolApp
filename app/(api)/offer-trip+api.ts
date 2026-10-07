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

    const availableTrips = (data ?? [])
      .map((trip: any) => ({
        ...trip,
        available_seats: Math.min(
          Number(trip.seats_available),
          Math.max(
            0,
            Number(trip.seats_available) - Number(trip.seats_booked),
          ),
        ),
      }))
      .filter(
        (trip: any) => trip.status === "active" && trip.available_seats > 0,
      );

    return Response.json({ data: availableTrips });
  } catch (error) {
    console.error("Failed to load available offered trips:", error);
    return Response.json(
      { error: "Unable to load available offered trips." },
      { status: 500 },
    );
  }
}

export async function POST() {
  return Response.json(
    { error: "Bookings must use the authenticated backend API." },
    { status: 405 },
  );
}
