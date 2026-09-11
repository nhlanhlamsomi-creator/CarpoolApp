
import { getSupabaseServerClient } from "@/lib/supabase-server";

const fallbackDrivers = [
  {
    id: 101,
    first_name: "Sipho",
    last_name: "Mahlangu",
    profile_image_url: "",
    car_image_url: "",
    car_seats: 4,
    rating: 4.8,
  },
  {
    id: 102,
    first_name: "Aisha",
    last_name: "Peters",
    profile_image_url: "",
    car_image_url: "",
    car_seats: 3,
    rating: 4.6,
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    const supabase = getSupabaseServerClient();

    if (email) {
      const { data, error } = await supabase
        .from("drivers")
        .select(
          "id, full_name, email, phone_number, profile_image_url, status, verified, driver_license_url, government_id_url, vehicle_details, bank_details"
        )
        .eq("email", email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return Response.json({ data: data ?? null });
    }

    const { data, error } = await supabase
      .from("drivers")
      .select(
        "id, first_name, last_name, profile_image_url, car_image_url, car_seats, rating, status, verified, is_online, driver_verification_status"
      );

    if (error) {
      throw error;
    }

    const visibleDrivers = Array.isArray(data)
      ? data.filter((driver: any) => {
          const status = String(driver?.status ?? "").trim().toLowerCase();
          const verificationStatus = String(
            driver?.driver_verification_status ?? "",
          ).trim().toLowerCase();
          const isOnline = driver?.is_online === true || driver?.verified === true;

          const liveStatuses = new Set(["approved", "live", "active", "online"]);
          const liveVerificationStatuses = new Set([
            "approved",
            "live",
            "active",
            "online",
          ]);

          const statusMatches = liveStatuses.has(status) || status === "";
          const verificationMatches = liveVerificationStatuses.has(verificationStatus);

          return (
            (statusMatches && (isOnline || verificationMatches || status === "online")) ||
            verificationMatches ||
            (status === "live" && (driver?.verified === true || driver?.is_online === true))
          );
        })
      : [];

    return Response.json({
      data: visibleDrivers,
    });
  } catch (error: any) {
    console.error("Error fetching drivers:", error);

    const code = error?.code || error?.cause?.code;
    if (code === "ETIMEDOUT" || code === "ECONNREFUSED") {
      return Response.json({ data: [] });
    }

    return Response.json({ data: [] });
  }
}
