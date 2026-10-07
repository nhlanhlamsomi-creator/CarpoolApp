import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/requireAuth";
import checkIdRouter from "./routes/checkId";
import driverVehicleRouter from "./routes/driverVehicle";
import healthRouter from "./routes/health";
import messagesRouter from "./routes/messages";
import offerTripsRouter from "./routes/offerTrips";
import paymentsRouter from "./routes/payments";
import ratingsRouter from "./routes/ratings";
import ridesRouter from "./routes/rides";
import sosRouter from "./routes/sos";
import supportRouter from "./routes/support";
import { getSupabaseServerClient } from "./services/supabase";

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const app = express();

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const profileRouter = express.Router();

const writableProfileFields = [
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

const clientAllowedVerificationStatuses = new Set(["not_submitted", "pending"]);

async function loadPassengerRating(clerkId: string) {
  const { data, error } = await getSupabaseServerClient()
    .from("passenger_ratings")
    .select("rating")
    .eq("passenger_clerk_id", clerkId);

  if (error) throw error;

  const ratings = data ?? [];
  return {
    rating:
      ratings.length > 0
        ? ratings.reduce((sum, entry) => sum + Number(entry.rating), 0) /
          ratings.length
        : null,
    rating_count: ratings.length,
  };
}

profileRouter.get("/", async (_request, response) => {
  const clerkId = response.locals.authUserId as string;

  const { data, error } = await getSupabaseServerClient()
    .from("users")
    .select(
      `id, name, email, clerk_id, phone_number, profile_image_url, rating,
       total_trips, verification_percentage, verification_status,
       verification_rejection_reason, verification_submitted_at,
       verification_warnings, government_id_url, government_id_back_url,
       selfie_image_url, id_number, id_verified, id_citizenship,
       date_of_birth, profile_data`,
    )
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (error) throw error;

  const passengerRating = await loadPassengerRating(clerkId);
  response.json({
    data: {
      ...(data ?? {}),
      ...passengerRating,
      rating:
        passengerRating.rating ??
        (data?.rating == null ? null : Number(data.rating)),
      profile_data: data?.profile_data ?? {},
    },
  });
});

profileRouter.get("/summary", async (_request, response) => {
  const clerkId = response.locals.authUserId as string;

  const { data, error } = await getSupabaseServerClient()
    .from("rides")
    .select(
      "status, payment_status, fare_price, destination_address, drivers(first_name, last_name)",
    )
    .eq("user_id", clerkId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rides = data ?? [];
  const relatedDriver = rides[0]?.drivers;
  const latestDriver = Array.isArray(relatedDriver)
    ? relatedDriver[0]
    : relatedDriver;

  response.json({
    data: {
      total_trips: rides.filter(
        (ride) =>
          ride.status !== "cancelled" && ride.payment_status !== "cancelled",
      ).length,
      completed_trips: rides.filter(
        (ride) => ride.status === "completed" || ride.payment_status === "paid",
      ).length,
      cancelled_trips: rides.filter(
        (ride) => ride.payment_status === "cancelled",
      ).length,
      money_spent: rides.reduce(
        (total, ride) => total + Number(ride.fare_price ?? 0),
        0,
      ),
      favorite_driver:
        latestDriver?.first_name && latestDriver?.last_name
          ? `${latestDriver.first_name} ${latestDriver.last_name}`
          : "Not available",
      last_ride: rides[0]?.destination_address ?? "No rides yet",
    },
  });
});

profileRouter.post("/", async (request, response) => {
  const clerkId = response.locals.authUserId as string;
  const body = request.body as Record<string, unknown>;
  const payload: Record<string, unknown> = {};

  for (const field of writableProfileFields) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  if (
    payload.verification_status !== undefined &&
    !clientAllowedVerificationStatuses.has(String(payload.verification_status))
  ) {
    response.status(403).json({
      error: "That verification status can only be set by a reviewer",
    });
    return;
  }

  if (payload.id_verified === true) {
    response.status(403).json({
      error: "Identity verification can only be set by a reviewer",
    });
    return;
  }

  const profileData = body.profile_data;

  if (profileData !== undefined) {
    if (
      !profileData ||
      typeof profileData !== "object" ||
      Array.isArray(profileData)
    ) {
      response.status(400).json({
        error: "Profile preferences must be an object",
      });
      return;
    }

    const supabase = getSupabaseServerClient();
    const { data: existing, error: readError } = await supabase
      .from("users")
      .select("profile_data")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (readError) throw readError;

    if (!existing) {
      response.status(404).json({ error: "Passenger profile not found" });
      return;
    }

    payload.profile_data = {
      ...(existing.profile_data ?? {}),
      ...(profileData as Record<string, unknown>),
    };
  }

  if (Object.keys(payload).length === 0) {
    response.status(400).json({ error: "Nothing to update" });
    return;
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await getSupabaseServerClient()
    .from("users")
    .update(payload)
    .eq("clerk_id", clerkId)
    .select(
      `id, name, email, clerk_id, phone_number, profile_image_url, rating,
       total_trips, verification_percentage, verification_status,
       verification_rejection_reason, verification_submitted_at,
       verification_warnings, government_id_url, government_id_back_url,
       selfie_image_url, id_number, id_verified, id_citizenship,
       date_of_birth, profile_data`,
    )
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    response.status(404).json({ error: "Passenger profile not found" });
    return;
  }

  const passengerRating = await loadPassengerRating(clerkId);
  response.json({
    data: {
      ...data,
      ...passengerRating,
      rating:
        passengerRating.rating ??
        (data.rating == null ? null : Number(data.rating)),
      profile_data: data.profile_data ?? {},
    },
  });
});

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

app.use(express.json({ limit: "32kb" }));

app.use("/api/health", healthRouter);
app.use("/api/check-id", requireAuth, checkIdRouter);
app.use("/api/drivers", requireAuth, driverVehicleRouter);
app.use("/api/messages", requireAuth, messagesRouter);
app.use("/api/offer-trip", offerTripsRouter);
app.use("/api/profile", requireAuth, profileRouter);
app.use("/api/ratings", requireAuth, ratingsRouter);
app.use("/api/rides", requireAuth, ridesRouter);
app.use("/api/sos", requireAuth, sosRouter);
app.use("/api/support", requireAuth, supportRouter);
app.use("/api/payments", requireAuth, paymentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Hop On API listening on port ${port}`);
});
