import { useAuth } from "@clerk/expo";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, View } from "react-native";
import MapView, {
    Circle,
    Marker,
    Polyline,
    PROVIDER_DEFAULT,
    PROVIDER_GOOGLE,
} from "react-native-maps";

import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import {
    calculateDriverTimes,
    calculateRegion,
    fetchRoutePolyline,
    generateMarkersFromData,
} from "@/lib/map";
import { isDriverVisible } from "@/lib/utils";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, Hub, MarkerData } from "@/types/type";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY!;

// ─── Palette (deep violet / black / white) ──────────────────────────────────
const THEME = {
  primary: "#5A189A", // loader, hub pins
  accent: "#9D4EDD", // driver route, hub circles, pulse ring
  route: "#E0575B", // user → destination line
};

// Soft grey map style (Google Maps only, so Android in this setup).
// Apple Maps on iOS can't be restyled, but it stays light with
// userInterfaceStyle="light".
const SOFT_GREY_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#EBEBEB" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8A9490" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F7F4FB" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#E9E2F0" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#D6E4DE" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#EFEFEF" }],
  },
];

export default function Map() {
  const { getToken } = useAuth();
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    setHubPickup,
    selectedHubId,
    rideBooked,
  } = useLocationStore();

  const {
    selectedDriver,
    drivers: storeDrivers,
    setDrivers: setStoreDrivers,
  } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [drivers, setLoadedDrivers] = useState<Driver[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);
  const [driverRouteCoordinates, setDriverRouteCoordinates] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    const loadDrivers = async () => {
      try {
        const token = await getToken();
        const result: { data: { drivers: Driver[]; hubs: Hub[] } } =
          await fetchAPI("/api/map-data", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (isMounted) {
          setLoadedDrivers(result.data.drivers.filter(isDriverVisible));
          setHubs(result.data.hubs);
        }
      } catch (error) {
        console.error("Failed to load map data:", error);
        if (isMounted) {
          setLoadedDrivers([]);
          setHubs([]);
        }
      }
    };

    loadDrivers();

    return () => {
      isMounted = false;
    };
  }, [getToken]);

  useEffect(() => {
    const visibleDrivers = rideBooked
      ? drivers.filter((driver) => Number(driver.id) === selectedDriver)
      : drivers;

    if (
      userLatitude != null &&
      userLongitude != null &&
      visibleDrivers.length > 0
    ) {
      const driverMarkers = generateMarkersFromData({
        data: visibleDrivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(driverMarkers);
    } else {
      setMarkers([]);
    }
  }, [userLatitude, userLongitude, drivers, rideBooked, selectedDriver]);

  useEffect(() => {
    let isCurrent = true;

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
        apiKey: GEOAPIFY_API_KEY,
      }).then((driversWithTimes) => {
        if (isCurrent) {
          setStoreDrivers(driversWithTimes as MarkerData[]);
        }
      }).catch((error: unknown) => {
        console.error("Failed to estimate driver arrival and trip times:", error);
      });
    } else {
      setStoreDrivers([]);
    }

    return () => {
      isCurrent = false;
    };
  }, [
    markers,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
    setStoreDrivers,
  ]);

  // Fetch route from user to destination (red line)
  useEffect(() => {
    if (
      userLatitude != null &&
      userLongitude != null &&
      destinationLatitude != null &&
      destinationLongitude != null
    ) {
      // 1. Immediate straight-line fallback
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
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  // Fetch route from selected driver to user (violet line)
  useEffect(() => {
    if (
      selectedDriver != null &&
      userLatitude != null &&
      userLongitude != null
    ) {
      // Find the selected driver's marker
      const driverMarker = markers.find((m) => Number(m.id) === selectedDriver);

      if (driverMarker) {
        // 1. Immediate straight-line fallback
        const steps = 20;
        const fallback: { latitude: number; longitude: number }[] = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          fallback.push({
            latitude:
              driverMarker.latitude +
              (userLatitude - driverMarker.latitude) * t,
            longitude:
              driverMarker.longitude +
              (userLongitude - driverMarker.longitude) * t,
          });
        }
        setDriverRouteCoordinates(fallback);

        // 2. Try to fetch a real road route from Geoapify
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

  if (userLatitude == null || userLongitude == null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const hasDestination =
    destinationLatitude != null && destinationLongitude != null;
  const visibleHubs = rideBooked
    ? hubs.filter((hub) => hub.id === selectedHubId)
    : hubs;

  return (
    <MapView
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      style={{ flex: 1 }}
      initialRegion={region}
      showsUserLocation
      followsUserLocation
      mapType="standard"
      userInterfaceStyle="light"
      customMapStyle={SOFT_GREY_MAP_STYLE}
    >
      {/* Soft ring around the user's location */}
      <Circle
        center={{ latitude: userLatitude, longitude: userLongitude }}
        radius={180}
        strokeColor="rgba(31,165,116,0.35)"
        strokeWidth={1}
        fillColor="rgba(31,165,116,0.18)"
      />

      {visibleHubs.map((hub) => (
        <React.Fragment key={hub.id}>
          <Circle
            center={{
              latitude: hub.latitude,
              longitude: hub.longitude,
            }}
            radius={hub.radius}
            strokeColor={THEME.accent}
            strokeWidth={2}
            fillColor="rgba(31,165,116,0.12)"
          />
          <Marker
            testID={`hub-marker-${hub.id}`}
            coordinate={{
              latitude: hub.latitude,
              longitude: hub.longitude,
            }}
            title={hub.name}
            pinColor={selectedHubId === hub.id ? THEME.accent : THEME.primary}
            onPress={() =>
              setHubPickup({
                id: hub.id,
                name: hub.name,
                latitude: hub.latitude,
                longitude: hub.longitude,
                address: hub.address,
              })
            }
          />
        </React.Fragment>
      ))}

      {/* Route from user to destination (red) */}
      {hasDestination && routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeWidth={5}
          strokeColor={THEME.route}
        />
      )}

      {/* Route from selected driver to user (violet) */}
      {driverRouteCoordinates && driverRouteCoordinates.length > 0 && (
        <Polyline
          coordinates={driverRouteCoordinates}
          strokeWidth={4}
          strokeColor={THEME.accent}
        />
      )}

      {markers.map((marker) => {
        const isSelected = selectedDriver === Number(marker.id);

        return (
          <Marker
            key={marker.id}
            testID={`driver-marker-${marker.id}`}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={isSelected ? icons.selectedMarker : icons.marker}
              style={{ width: 34, height: 34 }}
              resizeMode="contain"
            />
          </Marker>
        );
      })}

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
