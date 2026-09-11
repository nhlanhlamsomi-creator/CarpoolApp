import { Ride } from "@/types/type";

export const isDriverVisible = (
  driver?: Partial<{
    status: string | null;
    verified: boolean | null;
    is_online: boolean | null;
    driver_verification_status: string | null;
  }>,
): boolean => {
  if (!driver) {
    return false;
  }

  const status = String(driver.status ?? "").trim().toLowerCase();
  const verificationStatus = String(
    driver.driver_verification_status ?? "",
  ).trim().toLowerCase();
  const isOnline = driver.is_online === true || driver.verified === true;

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
    (status === "live" && (driver.verified === true || driver.is_online === true))
  );
};

export const sortRides = (rides: Ride[]): Ride[] => {
  return [...rides].sort((a, b) => {
    const dateA = new Date(a.created_at ?? a.ride_time ?? 0).getTime();
    const dateB = new Date(b.created_at ?? b.ride_time ?? 0).getTime();
    return dateB - dateA;
  });
};

export function formatTime(value: number | string): string {
  if (typeof value === "number") {
    const formattedMinutes = Math.round(value) || 0;

    if (formattedMinutes < 60) {
      return `${formattedMinutes} min`;
    }

    const hours = Math.floor(formattedMinutes / 60);
    const remainingMinutes = formattedMinutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Invalid time";
    }

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return "";
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day < 10 ? "0" + day : day} ${month} ${year}`;
}
