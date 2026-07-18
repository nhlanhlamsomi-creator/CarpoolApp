import { neon } from "@neondatabase/serverless";

const fallbackDrivers = [
  {
    id: 101,
    first_name: "Sipho",
    last_name: "Mahlangu",
    profile_image_url: "",
    car_image_url: "",
    car_seats: 4,
    rating: 4.8,
  },
  {
    id: 102,
    first_name: "Aisha",
    last_name: "Peters",
    profile_image_url: "",
    car_image_url: "",
    car_seats: 3,
    rating: 4.6,
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!process.env.DATABASE_URL) {
      return Response.json({ data: email ? null : fallbackDrivers });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    if (email) {
      const response = await sql`
        SELECT
          id,
          full_name,
          email,
          phone_number,
          profile_image_url,
          status,
          verified,
          driver_license_url,
          government_id_url,
          vehicle_details,
          bank_details
        FROM drivers
        WHERE email = ${email}
        LIMIT 1
      `;

      return Response.json({ data: response[0] ?? null });
    }

    const response = await sql`
      SELECT id, first_name, last_name, profile_image_url, car_image_url, car_seats, rating
      FROM drivers
      WHERE status = 'approved' AND verified = true
    `;

    return Response.json({
      data:
        Array.isArray(response) && response.length > 0
          ? response
          : fallbackDrivers,
    });
  } catch (error: any) {
    console.error("Error fetching drivers:", error);

    const code = error?.code || error?.cause?.code;
    if (code === "ETIMEDOUT" || code === "ECONNREFUSED") {
      return Response.json({ data: fallbackDrivers });
    }

    return Response.json({ data: null });
  }
}
