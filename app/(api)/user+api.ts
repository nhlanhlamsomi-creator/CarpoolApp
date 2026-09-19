
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { name, email, clerkId } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      typeof clerkId !== "string" ||
      !clerkId.trim()
    ) {
      return Response.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id, name, email, clerk_id")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingUser) {
      return Response.json(
        {
          message: "User already exists",
          data: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            clerk_id: existingUser.clerk_id,
          },
        },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), clerk_id: clerkId.trim() })
      .select("id, name, email, clerk_id")
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
  } catch {
    return Response.json(
      {
        success: false,
        error: "Unable to create account",
      },
      {
        status: 500,
      }
    );
  }
}