import { detectSafetyAnomaly, LocationSample } from "@/lib/safety";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const number = (value: unknown) =>
  typeof value === "number" ? value : Number(value);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rideId = number(body.ride_id);
      const { data: existingAlert, error: alertLookupError } = await supabase
        .from("safety_alerts")
        .select("id")
        .eq("ride_id", rideId)
        .eq("trigger_source", "AUTOMATED")
        .in("status", ["open", "acknowledged"])
        .maybeSingle();
      if (alertLookupError) throw alertLookupError;

      if (!existingAlert) {
        const { error: alertInsertError } = await supabase.from("safety_alerts").insert({
          ride_id: rideId,
          passenger_id: ride.user_id,
          driver_id: ride.driver_id,
          trigger_source: "AUTOMATED",
          severity: "high",
          latitude,
          longitude,
          reason: anomaly.reason,
          route_deviation_meters: anomaly.deviationMeters,
          status: "open",
        });
        if (alertInsertError) throw alertInsertError;
      }
      ? new Date(body.recorded_at)
      : new Date();
    if (
      Number.isNaN(recordedAt.getTime()) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return Response.json(
        { error: "Invalid location or timestamp" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .select(
        "ride_id, user_id, driver_id, status, origin_latitude, origin_longitude, destination_latitude, destination_longitude",
      )
      .eq("ride_id", rideId)
      .eq("driver_id", driverId)
      .maybeSingle();

    if (rideError) throw rideError;
    if (!ride)
      return Response.json({ error: "Ride not found" }, { status: 404 });
    if (!["accepted", "in_progress"].includes(ride.status)) {
      return Response.json({
        data: { accepted: false, reason: "Ride is not active" },
      });
    }

    const { error: insertError } = await supabase
      .from("ride_location_updates")
      .insert({
        ride_id: rideId,
        driver_id: driverId,
        latitude,
        longitude,
        recorded_at: recordedAt.toISOString(),
      });
    if (insertError) throw insertError;

    const { data: recent, error: recentError } = await supabase
      .from("ride_location_updates")
      .select("latitude, longitude, recorded_at")
      .eq("ride_id", rideId)
      .order("recorded_at", { ascending: false })
      .limit(20);
    if (recentError) throw recentError;

    const anomaly = detectSafetyAnomaly({
      origin: {
        latitude: Number(ride.origin_latitude),
        longitude: Number(ride.origin_longitude),
      },
      destination: {
        latitude: Number(ride.destination_latitude),
        longitude: Number(ride.destination_longitude),
      },
      samples: (recent ?? []).map(
        (sample: any): LocationSample => ({
          latitude: Number(sample.latitude),
          longitude: Number(sample.longitude),
          recordedAt: sample.recorded_at,
        }),
      ),
      thresholds: {
        offRouteMeters: Number(process.env.SAFETY_OFF_ROUTE_METERS ?? 750),
        minimumAwayMeters: Number(
          process.env.SAFETY_AWAY_FROM_DESTINATION_METERS ?? 500,
        ),
        sustainedMinutes: Number(process.env.SAFETY_SUSTAINED_MINUTES ?? 3),
        prolongedStopMinutes: Number(
          process.env.SAFETY_PROLONGED_STOP_MINUTES ?? 10,
        ),
        prolongedStopMaxMovementMeters: Number(
          process.env.SAFETY_PROLONGED_STOP_MAX_MOVEMENT_METERS ?? 50,
        ),
      },
    });

    if (anomaly) {
      const { data: existingAlert, error: alertLookupError } = await supabase
        .from("safety_alerts")
        .select("id")
        .eq("ride_id", rideId)
        .eq("trigger_source", "AUTOMATED")
        .in("status", ["open", "acknowledged"])
        .maybeSingle();
      if (alertLookupError) throw alertLookupError;

      if (!existingAlert) {
        const { error: alertInsertError } = await supabase
          .from("safety_alerts")
          .insert({
          ride_id: rideId,
          passenger_id: ride.user_id,
          driver_id: ride.driver_id,
          trigger_source: "AUTOMATED",
          severity: "high",
          latitude,
          longitude,
          reason: anomaly.reason,
          route_deviation_meters: anomaly.deviationMeters,
          status: "open",
          });
        if (alertInsertError) throw alertInsertError;
      }
    }

    return Response.json({
      data: { accepted: true, automatedAlertCreated: Boolean(anomaly) },
    });
  } catch (error) {
    console.error("Error processing ride location:", error);
    return Response.json(
      { error: "Unable to process ride location" },
      { status: 500 },
    );
  }
}
