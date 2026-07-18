import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
let sql: any = null;
if (DATABASE_URL) {
  try {
    sql = neon(DATABASE_URL);
  } catch (e) {
    console.error("Failed to initialize Neon client:", e);
  }
} else {
  console.error("Missing process.env.DATABASE_URL");
}

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  if (!sql) {
    console.error("Database client not initialized. Check DATABASE_URL.");
    return Response.json(
      { data: [] },
      { status: 200 },
    );
  }

  try {
    const response = await sql`
        SELECT
            rides.ride_id,
            rides.origin_address,
            rides.destination_address,
            rides.origin_latitude,
            rides.origin_longitude,
            rides.destination_latitude,
            rides.destination_longitude,
            rides.ride_time,
            rides.fare_price,
            rides.payment_status,
            rides.created_at,
            'driver', json_build_object(
                'driver_id', drivers.id,
                'first_name', drivers.first_name,
                'last_name', drivers.last_name,
                'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url,
                'car_seats', drivers.car_seats,
                'rating', drivers.rating
            ) AS driver 
        FROM 
            rides
        INNER JOIN
            drivers ON rides.driver_id = drivers.id
        WHERE 
            rides.user_id = ${id}
        ORDER BY 
            rides.created_at DESC;
    `;

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
