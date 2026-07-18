import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    const rides = await sql`
      SELECT r.*, d.first_name, d.last_name
      FROM rides r
      LEFT JOIN drivers d ON d.id = r.driver_id
      WHERE r.user_id = ${clerkId}
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    const completedTrips = rides.filter((ride: any) => ride.payment_status === "paid").length;
    const cancelledTrips = rides.filter((ride: any) => ride.payment_status === "cancelled").length;
    const moneySpent = rides.reduce((sum: number, ride: any) => sum + Number(ride.fare_price || 0), 0);
    const favoriteDriver = rides[0]?.first_name && rides[0]?.last_name
      ? `${rides[0].first_name} ${rides[0].last_name}`
      : "Not available";
    const lastRide = rides[0]?.destination_address || "No rides yet";

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
