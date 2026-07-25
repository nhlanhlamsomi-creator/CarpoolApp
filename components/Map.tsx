import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MapView, {
    Marker,
    PROVIDER_DEFAULT,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { icons } from "@/constants";
import {
    calculateDriverTimes,
    calculateRegion,
    generateMarkersFromData,
} from "@/lib/map";
import { getSupabaseClient } from "@/lib/supabase";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY!;

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

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ flex: 1 }}
      initialRegion={region}
      showsUserLocation
      followsUserLocation
      mapType="standard"
      userInterfaceStyle="light"
    >
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

      {destinationLatitude != null &&
        destinationLongitude != null && (
          <>
            <Marker
              coordinate={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              title="Destination"
              image={icons.pin}
            />

            <MapViewDirections
              origin={{
                latitude: userLatitude,
                longitude: userLongitude,
              }}
              destination={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              apikey={GOOGLE_API_KEY}
              strokeWidth={5}
              strokeColor="#0286FF"
            />
          </>
        )}
    </MapView>
  );
}