import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    console.log("========== CREATE USER ==========");

    const supabase = getSupabaseClient();
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

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingUser) {
      console.log("User already exists");

      return Response.json(
        {
          message: "User already exists",
          data: existingUser,
        },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .insert({ name, email, clerk_id: clerkId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json(
      {
        success: true,
        data,
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