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
import { Driver, MarkerData } from "@/types/type";

const GEOAPIFY_API_KEY =
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY!;

export default function Map() {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver, setDrivers: setStoreDrivers } =
    useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [drivers, setLoadedDrivers] = useState<Driver[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);

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

  // Fetch route from Geoapify whenever origin/destination changes
  useEffect(() => {
    if (
      userLatitude != null &&
      userLongitude != null &&
      destinationLatitude != null &&
      destinationLongitude != null
    ) {
      // 1. Immediate straight-line fallback (always visible)
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

      // 2. Try to fetch a real road route from Geoapify
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
          color="#0286FF"
        />
      </View>
    );
  }

  const hasDestination =
    destinationLatitude != null && destinationLongitude != null;

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