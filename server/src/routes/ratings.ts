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

async function loadPassengerRide(rideId: number, passengerId: string) {
  const { data: ride, error } = await getSupabaseServerClient()
    .from("rides")
    .select(
      "ride_id, user_id, driver_id, status, origin_address, destination_address, created_at",
    )
    .eq("ride_id", rideId)
    .eq("user_id", passengerId)
    .maybeSingle();

  if (error) throw error;
  if (!ride) throw new HttpError(404, "Trip not found");
  return ride;
}

router.get("/:rideId", async (request, response) => {
  const rideId = parseRideId(request.params.rideId);
  const ride = await loadPassengerRide(rideId, userIdFrom(response));
  const supabase = getSupabaseServerClient();
  const [driverResult, ratingResult] = await Promise.all([
    supabase
      .from("drivers")
      .select("id, first_name, last_name, profile_image_url, rating")
      .eq("id", ride.driver_id)
      .maybeSingle(),
    supabase
      .from("driver_ratings")
      .select("rating, feedback")
      .eq("ride_id", ride.ride_id)
      .eq("passenger_clerk_id", ride.user_id)
      .maybeSingle(),
  ]);

  if (driverResult.error) throw driverResult.error;
  if (ratingResult.error) throw ratingResult.error;
  if (!driverResult.data) throw new HttpError(404, "Driver not found");

  response.json({
    data: {
      ride: {
        ride_id: ride.ride_id,
        status: ride.status ?? "",
        origin_address: ride.origin_address,
        destination_address: ride.destination_address,
        created_at: ride.created_at,
      },
      driver: {
        first_name: driverResult.data.first_name ?? "",
        last_name: driverResult.data.last_name ?? "",
        profile_image_url: driverResult.data.profile_image_url ?? null,
        rating:
          driverResult.data.rating == null
            ? null
            : Number(driverResult.data.rating),
      },
      existingRating: ratingResult.data
        ? {
            rating: Number(ratingResult.data.rating),
            feedback: ratingResult.data.feedback ?? null,
          }
        : null,
    },
  });
});

router.post("/:rideId", async (request, response) => {
  const rideId = parseRideId(request.params.rideId);
  const passengerId = userIdFrom(response);
  const ride = await loadPassengerRide(rideId, passengerId);
  const rating = request.body?.rating;
  const feedback =
    request.body?.feedback == null ? "" : request.body.feedback;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, "Choose a whole-star rating from 1 to 5");
  }
  if (typeof feedback !== "string" || feedback.length > 500) {
    throw new HttpError(400, "Feedback must be 500 characters or fewer");
  }
  if (ride.status !== "completed") {
    throw new HttpError(400, "Only completed trips can be rated");
  }

  const { data: driver, error: driverError } = await getSupabaseServerClient()
    .from("drivers")
    .select("id")
    .eq("id", ride.driver_id)
    .maybeSingle();
  if (driverError) throw driverError;
  if (!driver) throw new HttpError(404, "Driver not found");

  const { data, error } = await getSupabaseServerClient().rpc(
    "record_driver_rating",
    {
      p_ride_id: ride.ride_id,
      p_passenger_clerk_id: passengerId,
      p_driver_id: ride.driver_id,
      p_rating: rating,
      p_feedback: feedback.trim() || null,
    },
  );

  if (error?.code === "23505") {
    throw new HttpError(409, "You have already rated this trip");
  }
  if (error) throw error;

  const aggregate = Array.isArray(data) ? data[0] : data;
  response.status(201).json({
    data: {
      success: true,
      rating,
      average_rating: Number(aggregate?.rating ?? rating),
      rating_count: Number(aggregate?.rating_count ?? 1),
    },
  });
});

export default router;
