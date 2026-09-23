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

    const response = (data ?? []).map((ride: any) => {
      // Supabase can return a one-to-many relation as an array depending on
      // the generated relationship metadata. Normalize it before the mobile
      // card reads the driver fields.
      const relatedDriver = Array.isArray(ride.drivers)
        ? ride.drivers[0]
        : ride.drivers;

      return {
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
      driver: relatedDriver
        ? {
            driver_id: relatedDriver.id,
            first_name: relatedDriver.first_name ?? "",
            last_name: relatedDriver.last_name ?? "",
            profile_image_url: relatedDriver.profile_image_url,
            car_image_url: relatedDriver.car_image_url,
            car_seats: Number.isFinite(Number(relatedDriver.car_seats))
              ? Number(relatedDriver.car_seats)
              : null,
            rating: relatedDriver.rating,
            phone_number: relatedDriver.phone_number,
          }
        : null,
      };
    });

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