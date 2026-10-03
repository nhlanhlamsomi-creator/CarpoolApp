import { Router, type Response } from "express";
import { HttpError } from "../middleware/errorHandler";
import { getSupabaseServerClient } from "../services/supabase";

const router = Router();

function userIdFrom(response: Response): string {
  return response.locals.authUserId as string;
}

function parseRideId(value: string): number {
  const rideId = Number(value);
  if (!Number.isSafeInteger(rideId) || rideId <= 0) {
    throw new HttpError(400, "Invalid trip id");
  }
  return rideId;
}

async function loadThreadContext(rideId: number, clerkId: string) {
  const supabase = getSupabaseServerClient();
  const { data: ride, error: rideError } = await supabase
    .from("rides")
    .select("ride_id, status, user_id, driver_id")
    .eq("ride_id", rideId)
    .maybeSingle();

  if (rideError) throw rideError;
  if (!ride) throw new HttpError(404, "Trip not found");
  if (ride.driver_id == null) {
    throw new HttpError(409, "A driver has not been assigned to this trip yet");
  }

  const [passengerResult, driverResult] = await Promise.all([
    supabase
      .from("users")
      .select("name, profile_image_url")
      .eq("clerk_id", ride.user_id)
      .maybeSingle(),
    supabase
      .from("drivers")
      .select("clerk_id, first_name, last_name, profile_image_url")
      .eq("id", ride.driver_id)
      .maybeSingle(),
  ]);

  if (passengerResult.error) throw passengerResult.error;
  if (driverResult.error) throw driverResult.error;

  const passenger = passengerResult.data;
  const driver = driverResult.data;
  const isPassenger = ride.user_id === clerkId;
  const isDriver = driver?.clerk_id === clerkId;

  if (!isPassenger && !isDriver) {
    throw new HttpError(403, "You are not a participant in this trip");
  }
  if (!driver) throw new HttpError(404, "Driver not found");

  const other = isPassenger
    ? {
        name:
          `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim() ||
          "Driver",
        image: driver.profile_image_url ?? null,
        role: "driver" as const,
      }
    : {
        name: passenger?.name ?? "Passenger",
        image: passenger?.profile_image_url ?? null,
        role: "passenger" as const,
      };

  return { ride, other, supabase };
}

router.get("/:rideId", async (request, response) => {
  const rideId = parseRideId(request.params.rideId);
  const { ride, other, supabase } = await loadThreadContext(
    rideId,
    userIdFrom(response),
  );

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, sender_clerk_id, body, created_at")
    .eq("ride_id", rideId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(500);

  if (error) throw error;

  const clerkId = userIdFrom(response);
  response.json({
    data: {
      ride_id: ride.ride_id,
      status: ride.status ?? "booked",
      other,
      messages: (messages ?? []).map((message) => ({
        id: message.id,
        body: message.body,
        created_at: message.created_at,
        mine: message.sender_clerk_id === clerkId,
      })),
    },
  });
});

router.post("/:rideId", async (request, response) => {
  const rideId = parseRideId(request.params.rideId);
  const text = request.body?.body;

  if (typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "Write a message before sending");
  }

  const body = text.trim();
  if (body.length > 2000) {
    throw new HttpError(400, "Message is too long");
  }

  const clerkId = userIdFrom(response);
  const { ride, supabase } = await loadThreadContext(rideId, clerkId);
  if (ride.status === "cancelled") {
    throw new HttpError(409, "This trip was cancelled, so its chat is closed");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ ride_id: rideId, sender_clerk_id: clerkId, body })
    .select("id, sender_clerk_id, body, created_at")
    .single();

  if (error) throw error;

  response.status(201).json({
    data: {
      id: data.id,
      body: data.body,
      created_at: data.created_at,
      mine: data.sender_clerk_id === clerkId,
    },
  });
});

export default router;
