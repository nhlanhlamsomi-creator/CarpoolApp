import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request, { rideId }: { rideId: string }) {
  const passengerId = new URL(request.url).searchParams.get("passenger_id");
  if (!rideId || !passengerId)
    return Response.json(
      { error: "Missing ride or passenger" },
      { status: 400 },
    );

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("safety_alerts")
      .select(
        "id, ride_id, severity, trigger_source, latitude, longitude, reason, passenger_response, status, created_at",
      )
      .eq("ride_id", rideId)
      .eq("passenger_id", passengerId)
      .in("status", ["open", "acknowledged"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return Response.json({ data: data ?? null });
  } catch (error) {
    console.error("Error fetching safety alert:", error);
    return Response.json(
      { error: "Unable to fetch safety alert" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { rideId }: { rideId: string }) {
  try {
    const {
      passenger_id: passengerId,
      response,
      status,
    } = await request.json();
    if (
      !passengerId ||
      !response ||
      !["acknowledged", "dismissed"].includes(status)
    ) {
      return Response.json(
        { error: "Invalid alert response" },
        { status: 400 },
      );
    }
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("safety_alerts")
      .update({
        passenger_response: response,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("ride_id", rideId)
      .eq("passenger_id", passengerId)
      .in("status", ["open", "acknowledged"])
      .select("id, status, passenger_response")
      .maybeSingle();
    if (error) throw error;
    return Response.json({ data });
  } catch (error) {
    console.error("Error updating safety alert:", error);
    return Response.json(
      { error: "Unable to update safety alert" },
      { status: 500 },
    );
  }
}
