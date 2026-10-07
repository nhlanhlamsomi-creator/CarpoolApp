import { Router } from "express";
import { HttpError } from "../middleware/errorHandler";
import { getSupabaseServerClient } from "../services/supabase";

const router = Router();

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

  const { data: vehicle, error } = await getSupabaseServerClient()
    .from("driver_vehicles")
    .select("make, model, year, colour, plate, seats")
    .eq("driver_id", driverId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  response.json({
    data: {
      vehicle: {
        make: asNullableString(vehicle?.make),
        model: asNullableString(vehicle?.model),
        year: asNullableString(vehicle?.year),
        colour: asNullableString(vehicle?.colour),
        plate: asNullableString(vehicle?.plate),
        seats: asNullableNumber(vehicle?.seats),
      },
    },
  });
});

export default router;
