import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { clerkId }: { clerkId: string }) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ data: null });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT id, full_name, email, status, verified, phone_number, profile_image_url, driver_license_url, government_id_url, vehicle_details, bank_details
      FROM drivers
      WHERE email = ${clerkId}
      LIMIT 1
    `;

    return Response.json({ data: response[0] ?? null });
  } catch (error) {
    console.error("Error fetching driver application:", error);
    return Response.json({ data: null });
  }
}
