
import { getSupabaseServerClient } from "@/lib/supabase-server";

const fallbackRequests = [
  {
    id: 1,
    passenger_name: "Maria",
    pickup_address: "12 Market St",
    destination_address: "77 Ocean Ave",
    pickup_latitude: 37.7749,
    pickup_longitude: -122.4194,
    destination_latitude: 37.7897,
    destination_longitude: -122.3900,
    status: "waiting",
    price: 24.5,
  },
  {
    id: 2,
    passenger_name: "Jason",
    pickup_address: "98 Elm St",
    destination_address: "10 Pine Plaza",
    pickup_latitude: 37.7815,
    pickup_longitude: -122.4058,
    destination_latitude: 37.7932,
    destination_longitude: -122.4037,
    status: "waiting",
    price: 18.75,
  },
];

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("driver_requests")
      .select(
        "id, passenger_name, pickup_address, destination_address, pickup_latitude, pickup_longitude, destination_latitude, destination_longitude, status, price"
      )
      .eq("status", "waiting")
      .limit(10);

    if (error) {
      throw error;
    }

    return Response.json({ data: data ?? fallbackRequests });
  } catch (error) {
    console.error("Error fetching driver requests:", error);
    return Response.json({ data: fallbackRequests });
  }
}
