import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";


const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY!;

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();

  const {
    data: drivers,
    loading,
    error,
  } = useFetch<Driver[]>("/(api)/driver");

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    if (
      Array.isArray(drivers) &&
      userLatitude &&
      userLongitude
    ) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude &&
      destinationLongitude
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((data) => {
        setDrivers(data as MarkerData[]);
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

  if (loading || !userLatitude || !userLongitude) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      initialRegion={region}
      showsUserLocation
      followsUserLocation
      showsCompass={false}
      showsBuildings
      showsTraffic={false}
      showsIndoors
      showsPointsOfInterest={false}
      userInterfaceStyle="light"
      mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
      customMapStyle={Platform.OS === "android" ? customMapStyle : undefined}
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

      {destinationLatitude && destinationLongitude && (
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
};

export default Map;