import { fetchRoutePolyline } from "@/lib/map";

export interface RouteSummary {
  clusterId: number;
  routePoints: { latitude: number; longitude: number }[];
  distanceKm: number;
  estimatedMinutes: number;
}

export async function calculateRouteForCluster({
  clusterId,
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
  apiKey,
}: {
  clusterId: number;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  apiKey: string;
}): Promise<RouteSummary> {
  const routePoints =
    (await fetchRoutePolyline({
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
      apiKey,
    })) ?? [
      { latitude: originLatitude, longitude: originLongitude },
      { latitude: destinationLatitude, longitude: destinationLongitude },
    ];

  const distanceKm = routePoints.reduce((sum, point, index) => {
    if (index === 0) {
      return sum;
    }

    const previous = routePoints[index - 1];
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const deltaLat = toRadians(point.latitude - previous.latitude);
    const deltaLng = toRadians(point.longitude - previous.longitude);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(toRadians(previous.latitude)) *
        Math.cos(toRadians(point.latitude)) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return sum + 6371 * c;
  }, 0);

  return {
    clusterId,
    routePoints,
    distanceKm: Number(distanceKm.toFixed(1)),
    estimatedMinutes: Math.max(5, Math.round((distanceKm || 1) / 30 * 60)),
  };
}
