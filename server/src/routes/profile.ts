import { Router, type Response } from "express";
import { HttpError } from "../middleware/errorHandler";
import { getSupabaseServerClient } from "../services/supabase";

const router = Router();

const PROFILE_COLUMNS = `id, name, email, clerk_id, phone_number,
  profile_image_url, rating, total_trips, verification_percentage,
  verification_status, verification_rejection_reason,
  verification_submitted_at, verification_warnings, government_id_url,
  government_id_back_url, selfie_image_url, id_number, id_verified,
  id_citizenship, date_of_birth, profile_data`;

const WRITABLE_PROFILE_FIELDS = [
  "name",
  "email",
  "phone_number",
  "profile_image_url",
  "government_id_url",
  "government_id_back_url",
  "selfie_image_url",
  "id_number",
  "id_verified",
  "id_citizenship",
  "date_of_birth",
  "verification_status",
  "verification_submitted_at",
  "verification_warnings",
] as const;

const CLIENT_ALLOWED_STATUSES = new Set(["not_submitted", "pending"]);

function userIdFrom(response: Response): string {
  return response.locals.authUserId as string;
}

router.get("/", async (_request, response) => {
  const userId = userIdFrom(response);
  const { data, error } = await getSupabaseServerClient()
    .from("users")
    .select(PROFILE_COLUMNS)
    .eq("clerk_id", userId)
    .maybeSingle();

  if (error) throw error;
  response.json({
    data: data ? { ...data, profile_data: data.profile_data ?? {} } : null,
  });
});

router.get("/summary", async (_request, response) => {
  const userId = userIdFrom(response);
  const { data: rides, error } = await getSupabaseServerClient()
    .from("rides")
    .select(
      "status, payment_status, fare_price, destination_address, drivers(first_name, last_name)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const trips = rides ?? [];
  const firstDriver = trips[0]?.drivers;
  const latestDriver = Array.isArray(firstDriver)
    ? firstDriver[0]
    : firstDriver;
  response.json({
    data: {
      total_trips: trips.filter(
        (ride) =>
          ride.status !== "cancelled" && ride.payment_status !== "cancelled",
      ).length,
      completed_trips: trips.filter(
        (ride) =>
          ride.status === "completed" || ride.payment_status === "paid",
      ).length,
      cancelled_trips: trips.filter(
        (ride) => ride.payment_status === "cancelled",
      ).length,
      money_spent: trips.reduce(
        (sum, ride) => sum + Number(ride.fare_price ?? 0),
        0,
      ),
      favorite_driver:
        latestDriver?.first_name && latestDriver?.last_name
          ? `${latestDriver.first_name} ${latestDriver.last_name}`
          : "Not available",
      last_ride: trips[0]?.destination_address ?? "No rides yet",
    },
  });
});

router.post("/", async (request, response) => {
  const userId = userIdFrom(response);
  const body = request.body as Record<string, unknown>;
  const profileData = body.profile_data;
  const payload: Record<string, unknown> = {};

  for (const field of WRITABLE_PROFILE_FIELDS) {
    if (body[field] !== undefined) payload[field] = body[field];
  }

  if (
    payload.verification_status !== undefined &&
    !CLIENT_ALLOWED_STATUSES.has(String(payload.verification_status))
  ) {
    throw new HttpError(
      403,
      "That verification status can only be set by a reviewer",
    );
  }
  if (payload.id_verified === true) {
    throw new HttpError(403, "Identity verification can only be set by a reviewer");
  }

  if (profileData !== undefined) {
    if (
      !profileData ||
      typeof profileData !== "object" ||
      Array.isArray(profileData)
    ) {
      throw new HttpError(400, "Profile preferences must be an object");
    }

    const supabase = getSupabaseServerClient();
    const { data: existing, error: readError } = await supabase
      .from("users")
      .select("profile_data")
      .eq("clerk_id", userId)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) throw new HttpError(404, "Passenger profile not found");

    payload.profile_data = {
      ...(existing.profile_data ?? {}),
      ...(profileData as Record<string, unknown>),
    };
  }

  if (Object.keys(payload).length === 0) {
    throw new HttpError(400, "Nothing to update");
  }

  payload.updated_at = new Date().toISOString();
  const { data, error } = await getSupabaseServerClient()
    .from("users")
    .update(payload)
    .eq("clerk_id", userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Passenger profile not found");
  response.json({ data: { ...data, profile_data: data.profile_data ?? {} } });
});

export default router;
