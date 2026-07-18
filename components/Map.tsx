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

  const { selectedDriver, setDrivers } =
    useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const mockDrivers: Driver[] = [
    {
      id: 1,
      driver_id: 1,
      first_name: "James",
      last_name: "Wilson",
      profile_image_url: "",
      car_image_url: "",
      car_seats: 4,
      rating: "4.9",
    },
    {
      id: 2,
      driver_id: 2,
      first_name: "David",
      last_name: "Brown",
      profile_image_url: "",
      car_image_url: "",
      car_seats: 4,
      rating: "4.8",
    },
    {
      id: 3,
      driver_id: 3,
      first_name: "Michael",
      last_name: "Johnson",
      profile_image_url: "",
      car_image_url: "",
      car_seats: 6,
      rating: "4.7",
    },
    {
      id: 4,
      driver_id: 4,
      first_name: "Sarah",
      last_name: "Smith",
      profile_image_url: "",
      car_image_url: "",
      car_seats: 4,
      rating: "4.6",
    },
    {
      id: 5,
      driver_id: 5,
      first_name: "John",
      last_name: "Mokoena",
      profile_image_url: "",
      car_image_url: "",
      car_seats: 4,
      rating: "4.8",
    },
  ];

  useEffect(() => {
    if (
      userLatitude != null &&
      userLongitude != null
    ) {
      const driverMarkers =
        generateMarkersFromData({
          data: mockDrivers,
          userLatitude,
          userLongitude,
        });

      setMarkers(driverMarkers);
    }
  }, [userLatitude, userLongitude]);

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
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [
    markers,
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