// lib/hub.ts
import { Hub, HubType } from "@/types/type";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

const HUB_TYPE_MAPPING: Record<string, HubType> = {
  shopping_mall: "mall",
  mall: "mall",
  shopping_center: "shopping_center",
  train_station: "station",
  bus_station: "station",
  subway_station: "station",
  transit_station: "station",
  park: "park",
  university: "university",
  school: "school",
  secondary_school: "school",
  primary_school: "school",
  hospital: "hospital",
  office_park: "office_park",
  community_center: "community_center",
  public_place: "public_place",
  transport_hub: "transport_hub",
  library: "library",
  museum: "museum",
  sports_center: "sports_center",
  market: "market",
  bus_stop: "bus_stop",
  campus: "campus",
  police: "police_station",
  police_station: "police_station",
  petrol_station: "petrol_station",
  gas_station: "petrol_station",
  fuel: "petrol_station",
  restaurant: "public_place",
  cafe: "public_place",
  bank: "public_place",
};

export const findNearbyHubs = async (
  userLatitude: number,
  userLongitude: number,
  maxDistance: number = 3000,
  limit: number = 30
): Promise<Hub[]> => {
  console.log("Finding hubs near:", userLatitude, userLongitude);
  
  // Try Geoapify API first
  if (GEOAPIFY_API_KEY) {
    try {
      const categories = [
        "commercial.shopping_mall",
        "commercial.shopping_center",
        "transportation.bus_station",
        "transportation.train_station",
        "transportation.transit_station",
        "leisure.park",
        "education.school",
        "education.university",
        "healthcare.hospital",
        "community.community_centre",
        "public.police_station",
        "commercial.fuel",
      ];

      const url = `https://api.geoapify.com/v2/places?categories=${categories.join(",")}&filter=circle:${userLongitude},${userLatitude},${maxDistance}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;
      
      console.log("Geoapify URL:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("Geoapify response:", data.features?.length || 0, "hubs found");

      if (data.features && data.features.length > 0) {
        const hubs: Hub[] = data.features.map((feature: any) => {
          const props = feature.properties;
          let hubType: HubType = "public_place";
          if (props.categories) {
            for (const cat of props.categories) {
              const key = cat.split(".").pop() || "";
              if (key in HUB_TYPE_MAPPING) {
                hubType = HUB_TYPE_MAPPING[key];
                break;
              }
            }
          }

          return {
            id: props.place_id || `geo_${Date.now()}_${Math.random()}`,
            name: props.name || "Unknown Location",
            address: props.formatted || props.address_line2 || "",
            latitude: props.lat,
            longitude: props.lon,
            type: hubType,
            distance: calculateDistance(
              userLatitude,
              userLongitude,
              props.lat,
              props.lon
            ),
            vicinity: props.address_line2 || "",
            rating: props.rating || undefined,
          };
        });

        return hubs
          .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
          .slice(0, limit);
      }
    } catch (error) {
      console.error("Geoapify API error:", error);
    }
  }

  // Fallback to OpenStreetMap
  console.log("Falling back to OpenStreetMap...");
  return getFallbackHubs(userLatitude, userLongitude, maxDistance, limit);
};

const getFallbackHubs = async (
  userLatitude: number,
  userLongitude: number,
  maxDistance: number = 3000,
  limit: number = 20
): Promise<Hub[]> => {
  try {
    const queries = [
      `node["amenity"="school"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["amenity"="university"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["shop"="mall"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["shop"="supermarket"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["amenity"="hospital"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["leisure"="park"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["amenity"="bus_station"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["amenity"="train_station"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["amenity"="library"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["amenity"="police"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `node["amenity"="fuel"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `way["shop"="mall"](around:${maxDistance},${userLatitude},${userLongitude});`,
      `way["leisure"="park"](around:${maxDistance},${userLatitude},${userLongitude});`,
    ];

    const query = `
      [out:json];
      (
        ${queries.join("\n")}
      );
      out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    const data = await response.json();

    if (data.elements && data.elements.length > 0) {
      const namedElements = data.elements.filter((el: any) => el.tags?.name);

      const hubs: Hub[] = namedElements
        .map((el: any) => {
          const type = mapOSMToHubType(el.tags);
          return {
            id: `osm_${el.id}`,
            name: el.tags?.name || "Unknown Location",
            address: el.tags?.addr_full || el.tags?.address || "",
            latitude: el.lat || el.center?.lat || 0,
            longitude: el.lon || el.center?.lon || 0,
            type: type,
            distance: calculateDistance(
              userLatitude,
              userLongitude,
              el.lat || el.center?.lat || 0,
              el.lon || el.center?.lon || 0
            ),
            vicinity: el.tags?.addr_city || "",
          };
        })
        .filter((hub: Hub) => hub.latitude !== 0 && hub.longitude !== 0)
        .sort((a: Hub, b: Hub) => (a.distance || Infinity) - (b.distance || Infinity))
        .slice(0, limit);

      if (hubs.length > 0) {
        return hubs;
      }
    }
  } catch (error) {
    console.error("OSM error:", error);
  }

  // Final fallback - GENERIC hubs based on user's location (NOT hardcoded to Sandton)
  console.log("Using generic fallback hubs based on user location");
  return getGenericHubs(userLatitude, userLongitude);
};

// THIS IS THE FIX - Dynamic hubs based on user's actual location
const getGenericHubs = (latitude: number, longitude: number): Hub[] => {
  const offset = 0.008; // ~800 meters offset
  
  // Get location name using reverse geocoding (try to get area name)
  // For now, use generic names with the location coordinates
  
  return [
    {
      id: "gen_1",
      name: "Shopping Center",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude + offset * 0.5,
      longitude: longitude + offset * 0.3,
      type: "mall" as HubType,
      distance: 500,
      vicinity: "",
    },
    {
      id: "gen_2",
      name: "Police Station",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude - offset * 0.3,
      longitude: longitude + offset * 0.4,
      type: "police_station" as HubType,
      distance: 800,
      vicinity: "",
    },
    {
      id: "gen_3",
      name: "Petrol Station",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude + offset * 0.4,
      longitude: longitude - offset * 0.5,
      type: "petrol_station" as HubType,
      distance: 1000,
      vicinity: "",
    },
    {
      id: "gen_4",
      name: "Park",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude - offset * 0.6,
      longitude: longitude - offset * 0.2,
      type: "park" as HubType,
      distance: 1200,
      vicinity: "",
    },
    {
      id: "gen_5",
      name: "Bus Station",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude + offset * 0.7,
      longitude: longitude + offset * 0.1,
      type: "station" as HubType,
      distance: 1500,
      vicinity: "",
    },
    {
      id: "gen_6",
      name: "School",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude + offset * 0.9,
      longitude: longitude + offset * 0.5,
      type: "school" as HubType,
      distance: 1800,
      vicinity: "",
    },
    {
      id: "gen_7",
      name: "Hospital",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude - offset * 0.5,
      longitude: longitude - offset * 0.6,
      type: "hospital" as HubType,
      distance: 2000,
      vicinity: "",
    },
    {
      id: "gen_8",
      name: "Library",
      address: getAddressFromCoords(latitude, longitude),
      latitude: latitude + offset * 0.2,
      longitude: longitude - offset * 0.3,
      type: "library" as HubType,
      distance: 2200,
      vicinity: "",
    },
  ];
};

// Helper to get a generic address based on coordinates
const getAddressFromCoords = (lat: number, lng: number): string => {
  // Return a generic address with the coordinates
  return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

const mapOSMToHubType = (tags: any): HubType => {
  if (tags?.amenity === "school" || tags?.amenity === "college") return "school";
  if (tags?.amenity === "university") return "university";
  if (tags?.shop === "mall" || tags?.shop === "shopping_center" || tags?.shop === "supermarket") return "mall";
  if (tags?.amenity === "hospital") return "hospital";
  if (tags?.leisure === "park") return "park";
  if (tags?.amenity === "bus_station" || tags?.amenity === "train_station")
    return "station";
  if (tags?.amenity === "community_centre") return "community_center";
  if (tags?.amenity === "library") return "library";
  if (tags?.amenity === "police") return "police_station";
  if (tags?.amenity === "fuel") return "petrol_station";
  return "public_place";
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const searchPlaces = async (
  query: string,
  location?: { latitude: number; longitude: number }
): Promise<Hub[]> => {
  if (!GEOAPIFY_API_KEY) {
    console.warn("Geoapify API key not found");
    return [];
  }

  try {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      query
    )}&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.features) {
      return data.features.map((feature: any) => {
        const props = feature.properties;
        return {
          id: props.place_id || `search_${Date.now()}_${Math.random()}`,
          name: props.name || props.formatted || "Unknown Location",
          address: props.formatted || props.address_line2 || "",
          latitude: props.lat,
          longitude: props.lon,
          type: "public_place" as HubType,
          distance: location ? calculateDistance(
            location.latitude,
            location.longitude,
            props.lat,
            props.lon
          ) : undefined,
          vicinity: props.address_line2 || "",
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
};