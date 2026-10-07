import { Router } from "express";
import { HttpError } from "../middleware/errorHandler";
import { getSupabaseServerClient } from "../services/supabase";

const router = Router();

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asNullableString(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNullableNumber(value: unknown): number | null {
  const number = Number(value);
  return value != null && Number.isFinite(number) ? number : null;
}

router.get("/:driverId/vehicle", async (request, response) => {
  const driverId = Number(request.params.driverId);
  if (!Number.isSafeInteger(driverId) || driverId <= 0) {
    throw new HttpError(400, "Invalid driver id");
  }

  const supabase = getSupabaseServerClient();
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("clerk_id, email, vehicle_details")
    .eq("id", driverId)
    .maybeSingle();

  if (driverError) throw driverError;
  if (!driver) throw new HttpError(404, "Driver not found");

  let profile: { profile_data: unknown } | null = null;
  if (typeof driver.clerk_id === "string" && driver.clerk_id.trim()) {
    const { data, error } = await supabase
      .from("users")
      .select("profile_data")
      .eq("clerk_id", driver.clerk_id)
      .maybeSingle();

    if (error) throw error;
    profile = data;
  }

  if (!profile && typeof driver.email === "string" && driver.email.trim()) {
    const { data, error } = await supabase
      .from("users")
      .select("profile_data")
      .eq("email", driver.email)
      .maybeSingle();

    if (error) throw error;
    profile = data;
  }

  const profileData = asRecord(profile?.profile_data);
  const profileVehicle = asRecord(profileData?.vehicle);
  const driverVehicleDetails = asRecord(driver.vehicle_details);
  const vehicle = {
    ...driverVehicleDetails,
    ...asRecord(driverVehicleDetails?.vehicle),
    ...profileVehicle,
  };

  response.json({
    data: {
      vehicle: {
        make: asNullableString(vehicle.make ?? vehicle.manufacturer),
        model: asNullableString(vehicle.model ?? vehicle.car_model),
        year: asNullableString(vehicle.year),
        colour: asNullableString(vehicle.colour ?? vehicle.color),
        plate: asNullableString(
          vehicle.plate ?? vehicle.license_plate ?? vehicle.car_number,
        ),
        seats: asNullableNumber(vehicle.seats ?? vehicle.car_seats),
      },
    },
  });
});

export default router;
