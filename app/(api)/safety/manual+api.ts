import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ride_id: rideId,
      passenger_id: passengerId,
      latitude,
      longitude,
      reason = "Passenger requested help",
    } = body;
    if (!rideId || !passengerId)
      return Response.json(
        { error: "ride_id and passenger_id are required" },
        { status: 400 },
      );

    const supabase = getSupabaseServerClient();
    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .select("ride_id, user_id, driver_id")
      .eq("ride_id", rideId)
      .eq("user_id", passengerId)
      .maybeSingle();
    if (rideError) throw rideError;
    if (!ride)
      return Response.json({ error: "Ride not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("safety_alerts")
      .insert({
        ride_id: ride.ride_id,
        passenger_id: ride.user_id,
        driver_id: ride.driver_id,
        trigger_source: "MANUAL",
        severity: "critical",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        reason,
        status: "open",
      })
      .select("id, status, trigger_source")
      .single();
    if (error) throw error;
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating manual safety alert:", error);
    return Response.json(
      { error: "Unable to create safety alert" },
      { status: 500 },
    );
  }
}
