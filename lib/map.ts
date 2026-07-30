import { Driver, MarkerData } from "@/types/type";

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver, index) => {
    const offsets = [
      { lat: 0.005, lng: 0.003 },
      { lat: -0.004, lng: 0.004 },
      { lat: 0.006, lng: -0.005 },
      { lat: -0.003, lng: -0.004 },
      { lat: 0.008, lng: 0.006 },
      { lat: -0.006, lng: 0.002 },
      { lat: 0.002, lng: -0.008 },
    ];

    const offset = offsets[index % offsets.length];

    return {
      ...driver,
      latitude: userLatitude + offset.lat,
      longitude: userLongitude + offset.lng,
      title: `${driver.first_name} ${driver.last_name}`,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  // Default Johannesburg
  if (userLatitude == null || userLongitude == null) {
    return {
      latitude: -26.2041,
      longitude: 28.0473,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  // Only user location
  if (destinationLatitude == null || destinationLongitude == null) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  return {
    latitude: (userLatitude + destinationLatitude) / 2,
    longitude: (userLongitude + destinationLongitude) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.02),
  };
};

export const calculateDriverTimes = async ({
  markers,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  // Mock values so Google Directions API isn't required
  return markers.map((marker, index) => ({
    ...marker,
    time: 3 + index * 2,
    price: (45 + index * 10).toFixed(2),
  }));
};

/**
 * Fetch a route from the Geoapify Routing API.
 * Returns an array of {latitude, longitude} coordinates following the road,
 * or null if the request failed / no route was found.
 *
 * Geoapify returns a MultiLineString geometry with coordinates as
 * "lng lat" strings. We flatten all line segments into a single path.
 */
export async function fetchRoutePolyline({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
  apiKey,
}: {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  apiKey: string;
}): Promise<{ latitude: number; longitude: number }[] | null> {
  // Geoapify Routing API v1
  const url = `https://api.geoapify.com/v1/routing?waypoints=${originLatitude},${originLongitude}|${destinationLatitude},${destinationLongitude}&mode=drive&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.features?.length) {
      console.warn("Geoapify routing error: no features in response", data);
      return null;
    }

    const geometry = data.features[0].geometry;
    if (!geometry?.coordinates?.length) {
      console.warn("Geoapify routing: no coordinates in geometry");
      return null;
    }

    const coords: { latitude: number; longitude: number }[] = [];

    // Handle both LineString and MultiLineString
    const segments = geometry.type === "MultiLineString"
      ? geometry.coordinates
      : [geometry.coordinates];

    for (const segment of segments) {
      for (const point of segment) {
        // Geoapify returns coordinates as "lng lat" strings
        if (typeof point === "string") {
          const parts = (point as string).split(" ");
          if (parts.length >= 2) {
            coords.push({
              longitude: parseFloat(parts[0]),
              latitude: parseFloat(parts[1]),
            });
          }
        } else if (Array.isArray(point) && point.length >= 2) {
          // Standard GeoJSON [lng, lat] array
          coords.push({
            longitude: point[0],
            latitude: point[1],
          });
        }
      }
    }

    if (coords.length === 0) {
      console.warn("Geoapify routing: no valid coordinates parsed");
      return null;
    }

    return coords;
  } catch (error) {
    console.error("Geoapify routing fetch failed:", error);
    return null;
  }
}
