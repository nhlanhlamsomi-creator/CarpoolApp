// components/Map.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";

import { icons } from "@/constants";
import {
  calculateDriverTimes,
  calculateRegion,
  fetchRoutePolyline,
  generateMarkersFromData,
} from "@/lib/map";
import { getSupabaseClient } from "@/lib/supabase";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData, Hub, HubType } from "@/types/type";
import { findNearbyHubs } from "@/lib/lib/hub";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY!;

// Hub type configurations for map markers - FIXED ICON NAMES
const TYPE_ICONS: Record<HubType, string> = {
  mall: "storefront",
  station: "train",
  park: "leaf",
  public_place: "location",
  transport_hub: "bus",
  university: "school",
  school: "school",
  hospital: "medical",
  office_park: "business",
  shopping_center: "cart",
  community_center: "people",
  campus: "school",
  library: "book",
  museum: "ribbon",
  sports_center: "basketball",
  market: "pricetag",
  bus_stop: "bus",
  police_station: "shield",
  petrol_station: "flame", // <-- FIXED: use "flame" instead of "gas-station"
};

const TYPE_COLORS: Record<HubType, string> = {
  mall: "#F7A13B",
  station: "#00155F",
  park: "#34D399",
  public_place: "#8B5CF6",
  transport_hub: "#EC4899",
  university: "#6366F1",
  school: "#F59E0B",
  hospital: "#EF4444",
  office_park: "#6B7280",
  shopping_center: "#10B981",
  community_center: "#3B82F6",
  campus: "#6366F1",
  library: "#8B5CF6",
  museum: "#EC4899",
  sports_center: "#F59E0B",
  market: "#F7A13B",
  bus_stop: "#00155F",
  police_station: "#1E3A5F",
  petrol_station: "#DC2626",
};

export default function Map() {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver, drivers: storeDrivers, setDrivers: setStoreDrivers } =
    useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [drivers, setLoadedDrivers] = useState<Driver[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);
  const [driverRouteCoordinates, setDriverRouteCoordinates] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);
  const [nearbyHubs, setNearbyHubs] = useState<Hub[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDrivers = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("drivers")
          .select(
            "id, first_name, last_name, profile_image_url, car_image_url, car_seats, rating"
          )
          .eq("status", "approved")
          .eq("verified", true);

        if (!isMounted) return;

        if (error) {
          throw error;
        }

        setLoadedDrivers((Array.isArray(data) ? data : []) as Driver[]);
      } catch (error) {
        console.error("Failed to load drivers:", error);
        if (isMounted) {
          setLoadedDrivers([]);
        }
      }
    };

    loadDrivers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load nearby hubs for display on map
  useEffect(() => {
    if (userLatitude != null && userLongitude != null) {
      findNearbyHubs(userLatitude, userLongitude, 3000, 20).then((hubs) => {
        setNearbyHubs(hubs);
      });
    }
  }, [userLatitude, userLongitude]);

  useEffect(() => {
    if (
      userLatitude != null &&
      userLongitude != null &&
      drivers.length > 0
    ) {
      const driverMarkers =
        generateMarkersFromData({
          data: drivers,
          userLatitude,
          userLongitude,
        });

      setMarkers(driverMarkers);
    } else {
      setMarkers([]);
    }
  }, [userLatitude, userLongitude, drivers]);

  useEffect(() => {
    if (
      markers.length &&
      destinationLatitude != null &&
      destinationLongitude != null
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((driversWithTimes) => {
        setStoreDrivers(driversWithTimes as MarkerData[]);
      });
    } else {
      setStoreDrivers([]);
    }
  }, [
    markers,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
    setStoreDrivers,
  ]);

  // Fetch route from user to destination (blue line)
  useEffect(() => {
    if (
      userLatitude != null &&
      userLongitude != null &&
      destinationLatitude != null &&
      destinationLongitude != null
    ) {
      const steps = 20;
      const fallback: { latitude: number; longitude: number }[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        fallback.push({
          latitude: userLatitude + (destinationLatitude - userLatitude) * t,
          longitude: userLongitude + (destinationLongitude - userLongitude) * t,
        });
      }
      setRouteCoordinates(fallback);

      fetchRoutePolyline({
        originLatitude: userLatitude,
        originLongitude: userLongitude,
        destinationLatitude,
        destinationLongitude,
        apiKey: GEOAPIFY_API_KEY,
      }).then((coords) => {
        if (coords && coords.length > 0) {
          setRouteCoordinates(coords);
        }
      });
    } else {
      setRouteCoordinates(null);
    }
  }, [
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  ]);

  // Fetch route from selected driver to user (green line)
  useEffect(() => {
    if (
      selectedDriver != null &&
      userLatitude != null &&
      userLongitude != null
    ) {
      const driverMarker = markers.find(
        (m) => Number(m.id) === selectedDriver
      );

      if (driverMarker) {
        const steps = 20;
        const fallback: { latitude: number; longitude: number }[] = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          fallback.push({
            latitude: driverMarker.latitude + (userLatitude - driverMarker.latitude) * t,
            longitude: driverMarker.longitude + (userLongitude - driverMarker.longitude) * t,
          });
        }
        setDriverRouteCoordinates(fallback);

        fetchRoutePolyline({
          originLatitude: driverMarker.latitude,
          originLongitude: driverMarker.longitude,
          destinationLatitude: userLatitude,
          destinationLongitude: userLongitude,
          apiKey: GEOAPIFY_API_KEY,
        }).then((coords) => {
          if (coords && coords.length > 0) {
            setDriverRouteCoordinates(coords);
          }
        });
      } else {
        setDriverRouteCoordinates(null);
      }
    } else {
      setDriverRouteCoordinates(null);
    }
  }, [selectedDriver, userLatitude, userLongitude, markers]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  if (
    userLatitude == null ||
    userLongitude == null
  ) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator
          size="large"
          color="#0E5C3F"
        />
      </View>
    );
  }

  const hasDestination =
    destinationLatitude != null && destinationLongitude != null;

  const HubMarker = ({ hub }: { hub: Hub }) => {
    const iconName = TYPE_ICONS[hub.type] || "location";
    const color = TYPE_COLORS[hub.type] || "#6B7280";

    return (
      <Marker
        coordinate={{
          latitude: hub.latitude,
          longitude: hub.longitude,
        }}
        title={hub.name}
        description={`${hub.address || hub.vicinity || ""}`}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: color,
            borderWidth: 2,
            borderColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: color,
            shadowOpacity: 0.3,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Ionicons name={iconName as any} size={14} color="#FFFFFF" />
        </View>
      </Marker>
    );
  };

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={region}
      showsUserLocation
      followsUserLocation
      mapType="standard"
      userInterfaceStyle="light"
    >
      {hasDestination && routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeWidth={5}
          strokeColor="#0286FF"
        />
      )}

      {driverRouteCoordinates && driverRouteCoordinates.length > 0 && (
        <Polyline
          coordinates={driverRouteCoordinates}
          strokeWidth={4}
          strokeColor="#1FB574"
        />
      )}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === Number(marker.id)
              ? icons.selectedMarker
              : icons.marker
          }
        />
      ))}

      {nearbyHubs.map((hub) => (
        <HubMarker key={hub.id} hub={hub} />
      ))}

      {hasDestination && (
        <Marker
          coordinate={{
            latitude: destinationLatitude,
            longitude: destinationLongitude,
          }}
          title="Destination"
          image={icons.pin}
        />
      )}
    </MapView>
  );
}