import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("rides")
      .select(
        "ride_id, origin_address, destination_address, origin_latitude, origin_longitude, destination_latitude, destination_longitude, ride_time, fare_price, payment_status, created_at, driver_id, drivers(id, first_name, last_name, profile_image_url, car_image_url, car_seats, rating)"
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const response = (data ?? []).map((ride: any) => ({
      ...ride,
      driver: ride.drivers
        ? {
            driver_id: ride.drivers.id,
            first_name: ride.drivers.first_name,
            last_name: ride.drivers.last_name,
            profile_image_url: ride.drivers.profile_image_url,
            car_image_url: ride.drivers.car_image_url,
            car_seats: ride.drivers.car_seats,
            rating: ride.drivers.rating,
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
