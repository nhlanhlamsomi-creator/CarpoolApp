import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ride_id, user_id } = body;

    if (!ride_id || !user_id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Ensure the ride belongs to the requesting user
    const { data: existing, error: fetchError } = await supabase
      .from("rides")
      .select("ride_id, user_id, payment_status")
      .eq("ride_id", ride_id)
      .single();

    if (fetchError) {
      console.error("Supabase fetch error (cancel):", fetchError);
      return Response.json({ error: "Could not find ride" }, { status: 404 });
    }

    if (existing.user_id !== user_id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // idempotent: if already cancelled, just return success
    if (existing.payment_status === "cancelled") {
      return Response.json({ data: { ok: true } });
    }

    const { data, error } = await supabase
      .from("rides")
      .update({ payment_status: "cancelled", status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("ride_id", ride_id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error (cancel):", error);
      return Response.json({ error: "Failed to cancel ride" }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
