import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: rides, error } = await supabase
      .from("rides")
      .select("*, drivers(first_name, last_name)")
      .eq("user_id", clerkId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    const completedTrips = (rides ?? []).filter((ride: any) => ride.payment_status === "paid").length;
    const cancelledTrips = (rides ?? []).filter((ride: any) => ride.payment_status === "cancelled").length;
    const moneySpent = (rides ?? []).reduce((sum: number, ride: any) => sum + Number(ride.fare_price || 0), 0);
    const favoriteDriver = rides?.[0]?.drivers?.first_name && rides?.[0]?.drivers?.last_name
      ? `${rides[0].drivers.first_name} ${rides[0].drivers.last_name}`
      : "Not available";
    const lastRide = rides?.[0]?.destination_address || "No rides yet";

    return Response.json({
      data: {
        completed_trips: completedTrips,
        cancelled_trips: cancelledTrips,
        money_spent: moneySpent,
        favorite_driver: favoriteDriver,
        last_ride: lastRide,
      },
    });
  } catch (error) {
    console.error("Error fetching ride summary:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
