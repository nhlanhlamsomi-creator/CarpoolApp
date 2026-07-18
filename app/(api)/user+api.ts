import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    console.log("========== CREATE USER ==========");

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.log("DATABASE_URL is missing");
      return Response.json(
        { error: "DATABASE_URL is missing" },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

    const body = await request.json();

    console.log("Request Body:", body);

    const { name, email, clerkId } = body;

    if (!name || !email || !clerkId) {
      return Response.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const existingUser = await sql`
      SELECT * FROM users
      WHERE clerk_id = ${clerkId};
    `;

    if (existingUser.length > 0) {
      console.log("User already exists");

      return Response.json(
        {
          message: "User already exists",
          data: existingUser[0],
        },
        { status: 200 }
      );
    }

    const response = await sql`
      INSERT INTO users (
        name,
        email,
        clerk_id
      )
      VALUES (
        ${name},
        ${email},
        ${clerkId}
      )
      RETURNING *;
    `;

    console.log("Inserted User:");
    console.log(response[0]);

    return Response.json(
      {
        success: true,
        data: response[0],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("USER API ERROR:");
    console.error(error);

    return Response.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}