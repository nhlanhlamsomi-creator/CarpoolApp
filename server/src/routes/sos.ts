import { Router } from "express";
import { HttpError } from "../middleware/errorHandler";
import { getSupabaseServerClient } from "../services/supabase";

const router = Router();

function userIdFrom(response: Parameters<Parameters<typeof router.post>[1]>[1]) {
  return response.locals.authUserId as string;
}

function optionalCoordinate(value: unknown, minimum: number, maximum: number) {
  if (value === undefined || value === null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw new HttpError(400, "Invalid location coordinates");
  }
  return number;
}

router.post("/", async (request, response) => {
  const userId = userIdFrom(response);
  const body = request.body as Record<string, unknown>;
  const rideId = Number(body.ride_id);
  const reason = String(body.reason ?? "Passenger requested help").trim();
  const latitude = optionalCoordinate(body.latitude, -90, 90);
  const longitude = optionalCoordinate(body.longitude, -180, 180);

  if (!Number.isSafeInteger(rideId) || rideId <= 0 || !reason || reason.length > 500) {
    throw new HttpError(400, "Invalid SOS details");
  }
  if ((latitude === null) !== (longitude === null)) {
    throw new HttpError(400, "Both location coordinates are required together");
  }

  const supabase = getSupabaseServerClient();
  const { data: ride, error: rideError } = await supabase
    .from("rides")
    .select("ride_id, user_id, driver_id")
    .eq("ride_id", rideId)
    .eq("user_id", userId)
    .maybeSingle();
  if (rideError) throw rideError;
  if (!ride) throw new HttpError(404, "Ride not found");

  const { data, error } = await supabase
    .from("safety_alerts")
    .insert({
      ride_id: ride.ride_id,
      passenger_id: userId,
      driver_id: ride.driver_id,
      trigger_source: "MANUAL",
      severity: "critical",
      incident_type: "ride_safety",
      latitude,
      longitude,
      reason,
      status: "open",
    })
    .select("id, ride_id, status, trigger_source")
    .single();
  if (error) throw error;
  response.status(201).json({ data });
});

router.get("/:rideId", async (request, response) => {
  const userId = userIdFrom(response);
  const rideId = Number(request.params.rideId);
  if (!Number.isSafeInteger(rideId) || rideId <= 0) {
    throw new HttpError(400, "Invalid ride ID");
  }

  const { data, error } = await getSupabaseServerClient()
    .from("safety_alerts")
    .select(
      "id, ride_id, severity, trigger_source, latitude, longitude, reason, passenger_response, status, created_at",
    )
    .eq("ride_id", rideId)
    .eq("passenger_id", userId)
    .in("status", ["open", "acknowledged"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  response.json({ data: data ?? null });
});

router.patch("/:rideId", async (request, response) => {
  const userId = userIdFrom(response);
  const rideId = Number(request.params.rideId);
  const body = request.body as Record<string, unknown>;
  const status = body.status;
  const alertResponse = String(body.response ?? "").trim();

  if (
    !Number.isSafeInteger(rideId) ||
    rideId <= 0 ||
    !alertResponse ||
    alertResponse.length > 500 ||
    !["acknowledged", "dismissed"].includes(String(status))
  ) {
    throw new HttpError(400, "Invalid alert response");
  }

  const { data, error } = await getSupabaseServerClient()
    .from("safety_alerts")
    .update({
      passenger_response: alertResponse,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("ride_id", rideId)
    .eq("passenger_id", userId)
    .in("status", ["open", "acknowledged"])
    .select("id, status, passenger_response")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Open safety alert not found");
  response.json({ data });
});

export default router;