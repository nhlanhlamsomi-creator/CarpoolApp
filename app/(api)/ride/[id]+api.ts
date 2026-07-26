import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("rides")
      .select(
        `ride_id,
         origin_address,
         destination_address,
         origin_latitude,
         origin_longitude,
         destination_latitude,
         destination_longitude,
         ride_time,
         duration_minutes,
         scheduled_for,
         status,
         completed_at,
         cancelled_at,
         fare_price,
         payment_status,
         created_at,
         driver_id,
         drivers(id, first_name, last_name, profile_image_url, car_image_url, car_seats, rating, phone_number)`
      )
      .eq("user_id", id)
      // Upcoming trips first, soonest at the top; then the rest newest first.
      .order("scheduled_for", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const response = (data ?? []).map((ride: any) => ({
      ...ride,
      // Old rows predate duration_minutes, so fall back to the gap between
      // creation and scheduled time rather than showing nothing.
      duration_minutes:
        ride.duration_minutes ??
        (ride.ride_time && ride.created_at
          ? Math.max(
              0,
              Math.round(
                (new Date(ride.ride_time).getTime() -
                  new Date(ride.created_at).getTime()) /
                  60000,
              ),
            )
          : null),
      status: ride.status ?? "completed",
      driver: ride.drivers
        ? {
            driver_id: ride.drivers.id,
            first_name: ride.drivers.first_name,
            last_name: ride.drivers.last_name,
            profile_image_url: ride.drivers.profile_image_url,
            car_image_url: ride.drivers.car_image_url,
            car_seats: ride.drivers.car_seats,
            rating: ride.drivers.rating,
            phone_number: ride.drivers.phone_number,
          }
        : null,
    }));

    return Response.json({ data: response });
  } catch (error: any) {
    console.error("Error fetching recent rides:", error);

    const code = error?.code || error?.cause?.code;
    if (code === "ETIMEDOUT" || code === "ECONNREFUSED") {
      return Response.json({ data: [] }, { status: 200 });
    }

    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}