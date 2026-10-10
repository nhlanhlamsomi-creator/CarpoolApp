import { Router } from "express";
import { getSupabaseServerClient } from "../services/supabase";

const router = Router();

const visibleDriverStatuses = new Set(["approved", "live", "active", "online"]);

function isDriverVisible(driver: {
  status?: string | null;
  verified?: boolean | null;
  is_online?: boolean | null;
  driver_verification_status?: string | null;
}) {
  const status = String(driver.status ?? "").trim().toLowerCase();
  const verificationStatus = String(
    driver.driver_verification_status ?? "",
  )
    .trim()
    .toLowerCase();
  const isOnline = driver.is_online === true || driver.verified === true;
  const statusMatches = visibleDriverStatuses.has(status) || status === "";
  const verificationMatches = visibleDriverStatuses.has(verificationStatus);

  return (
    (statusMatches && (isOnline || verificationMatches || status === "online")) ||
    verificationMatches ||
    (status === "live" && (driver.verified === true || driver.is_online === true))
  );
}

router.get("/", async (_request, response) => {
  const supabase = getSupabaseServerClient();
  const [driversResult, hubsResult] = await Promise.all([
    supabase
      .from("drivers")
      .select(
        "id, first_name, last_name, profile_image_url, car_image_url, car_seats, rating, status, verified, is_online, driver_verification_status, latitude, longitude",
      ),
    supabase
      .from("hubs")
      .select("id, name, address, latitude, longitude, radius, status")
      .eq("status", "active"),
  ]);

  if (driversResult.error) throw driversResult.error;
  if (hubsResult.error) throw hubsResult.error;

  response.json({
    data: {
      drivers: (driversResult.data ?? []).filter(isDriverVisible),
      hubs: hubsResult.data ?? [],
    },
  });
});

export default router;
