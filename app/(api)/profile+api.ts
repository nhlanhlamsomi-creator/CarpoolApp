import { neon } from "@neondatabase/serverless";

const ensureProfileColumns = async (sql: any) => {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_trips INTEGER DEFAULT 0;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_percentage INTEGER DEFAULT 0;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb;`;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    await ensureProfileColumns(sql);

    const response = await sql`
      SELECT
        id,
        name,
        email,
        clerk_id,
        profile_image_url,
        rating,
        total_trips,
        verification_percentage,
        profile_data
      FROM users
      WHERE clerk_id = ${clerkId}
      LIMIT 1
    `;

    const profile = response[0] ?? null;

    return Response.json({
      data: profile
        ? {
            ...profile,
            profile_data: profile.profile_data ?? {},
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, profile_data, ...updates } = body;

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    await ensureProfileColumns(sql);

    const profilePayload =
      profile_data && typeof profile_data === "object" ? profile_data : {};

    const response = await sql`
      UPDATE users
      SET
        name = COALESCE(${updates.name ?? null}, name),
        email = COALESCE(${updates.email ?? null}, email),
        profile_image_url = COALESCE(${updates.profile_image_url ?? null}, profile_image_url),
        rating = COALESCE(${updates.rating ?? null}, rating),
        total_trips = COALESCE(${updates.total_trips ?? null}, total_trips),
        verification_percentage = COALESCE(${updates.verification_percentage ?? null}, verification_percentage),
        profile_data = COALESCE(profile_data, '{}'::jsonb) || ${JSON.stringify(profilePayload)}::jsonb
      WHERE clerk_id = ${clerkId}
      RETURNING *
    `;

    return Response.json({ data: response[0] ?? null });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
