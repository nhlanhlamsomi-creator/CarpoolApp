import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: profile, error } = await supabase
      .from("users")
      .select("id, name, email, clerk_id, profile_image_url, rating, total_trips, verification_percentage, profile_data")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (error) {
      throw error;
    }

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

    const supabase = getSupabaseClient();

    const profilePayload =
      profile_data && typeof profile_data === "object" ? profile_data : {};

    const { data, error } = await supabase
      .from("users")
      .update({
        name: updates.name,
        email: updates.email,
        profile_image_url: updates.profile_image_url,
        rating: updates.rating,
        total_trips: updates.total_trips,
        verification_percentage: updates.verification_percentage,
        profile_data: {
          ...(profilePayload || {}),
        },
      })
      .eq("clerk_id", clerkId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ data });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
