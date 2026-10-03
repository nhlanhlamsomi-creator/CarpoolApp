import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/Cards";
import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import OfferTripCard from "@/components/OfferTripCard";
import RideCard from "@/components/RideCard";
import { ui } from "@/constants/theme";
import { useApiFetch } from "@/lib/api";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { OfferTrip, Ride } from "@/types/type";

const Home = () => {
  const { user } = useUser();
  const { signOut, userId } = useAuth();

  const {
    setUserLocation,
    setDestinationLocation,
    clearDestinationLocation,
    userAddress,
    userLatitude,
    userLongitude,
  } = useLocationStore();

  const {
    data: recentRides,
    error: recentRidesError,
    loading,
    refetch: refetchRecentRides,
  } = useApiFetch<Ride[]>("/api/rides");
  const {
    data: availableTrips,
    error: availableTripsError,
    loading: availableTripsLoading,
    refetch: refetchAvailableTrips,
  } = useFetch<OfferTrip[]>("/(api)/offer-trip");

  const rides = (Array.isArray(recentRides) ? [...recentRides] : []).sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime(),
  );
  const offerTrips = availableTrips || [];

  useFocusEffect(
    useCallback(() => {
      void refetchRecentRides();
      void refetchAvailableTrips();
    }, [refetchAvailableTrips, refetchRecentRides]),
  );

  // ── Avatar float ──────────────────────────────────────────────────────────
  const avatarBob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarBob, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(avatarBob, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const avatarY = avatarBob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  const handleBookOfferTrip = (trip: OfferTrip) => {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in before booking a ride.");
      return;
    }

    router.push({
      pathname: "/(root)/offer-trip-booking",
      params: { trip: JSON.stringify(trip) },
    });
  };

  const handleRate = (ride: Ride) => {
    if (!ride.ride_id) {
      Alert.alert(
        "Unable to rate trip",
        "We couldn't identify this trip. Refresh your rides and try again.",
      );
      return;
    }

    router.push({
      pathname: "/(root)/rate-driver/[rideId]",
      params: { rideId: String(ride.ride_id) },
    });
  };

  const initial = (user?.firstName ?? "T").charAt(0).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ui.bg }}>
      <FlatList
        data={rides.slice(0, 3)}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            variant={
              ["booked", "scheduled", "accepted", "in_progress"].includes(
                item.status ?? "",
              )
                ? "upcoming"
                : "completed"
            }
            onRate={() => handleRate(item)}
          />
        )}
        keyExtractor={(item, index) =>
          `${item.user_id}-${item.created_at}-${index}`
        }
        className="px-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        ListHeaderComponent={
          <>
            {/* ── Greeting ── */}
            <View className="my-5 flex-row items-center justify-between">
              <View className="flex-1 pr-3 flex-row items-center gap-3">
                <Animated.View
                  style={{ transform: [{ translateY: avatarY }] }}
                  className="h-12 w-12 items-center justify-center rounded-2xl bg-[#1FA574] border border-[#0A3B2E]"
                >
                  <Text className="text-[18px] font-JakartaExtraBold text-[#2B2722]">
                    {initial}
                  </Text>
                </Animated.View>

                <View className="flex-1">
                  <Text className="text-[12px] font-JakartaBold text-[#9A928A] tracking-widest uppercase">
                    Welcome back
                  </Text>
                  <Text
                    className="mt-0.5 text-[22px] font-JakartaExtraBold text-[#2B2722]"
                    numberOfLines={1}
                  >
                    {user?.firstName ?? "there"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  signOut();
                  router.replace("/(auth)/sign-in");
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                activeOpacity={0.8}
                className="h-11 w-11 items-center justify-center rounded-2xl border border-[#E3E7E5] bg-white"
              >
                <Ionicons name="log-out-outline" size={19} color="#4A443D" />
              </TouchableOpacity>
            </View>

            {/* ── Search ── */}
            <Text className="text-[12px] font-JakartaBold text-[#9A928A] tracking-widest uppercase mb-2">
              Where to?
            </Text>

            <GoogleTextInput
              handlePress={handleDestinationPress}
              onClear={clearDestinationLocation}
              biasLat={userLatitude}
              biasLng={userLongitude}
            />

            {/* ── Map ── */}
            <View className="mt-6 overflow-hidden rounded-3xl border border-[#E3E7E5] bg-white">
              <View className="h-[260px]">
                <Map />
              </View>

              <View className="flex-row items-center gap-3 px-4 py-3.5 bg-[#F4F6F5]">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E4EFEA]">
                  <Ionicons name="navigate" size={16} color="#0A3B2E" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10.5px] font-JakartaBold text-[#9A928A] tracking-widest uppercase">
                    Your location
                  </Text>
                  <Text
                    className="mt-0.5 text-[13.5px] font-JakartaSemiBold text-[#2B2722]"
                    numberOfLines={1}
                  >
                    {userAddress ?? "Finding you…"}
                  </Text>
                </View>
                <View className="h-2 w-2 rounded-full bg-[#1FA574]" />
              </View>
            </View>

            {/* ── Available rides heading ── */}
            <View className="mt-7 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-[#1FA574]" />
                <Text className="text-[17px] font-JakartaExtraBold text-[#2B2722]">
                  Available rides
                </Text>
              </View>
              {offerTrips.length > 0 && (
                <View className="rounded-full bg-[#E4EFEA] px-2.5 py-1">
                  <Text className="text-[11px] font-JakartaBold text-[#0A3B2E]">
                    {offerTrips.length}{" "}
                    {offerTrips.length === 1 ? "ride" : "rides"}
                  </Text>
                </View>
              )}
            </View>

            {availableTripsLoading ? (
              <View className="mb-2 items-center rounded-3xl border border-[#E3E7E5] bg-white py-5">
                <ActivityIndicator size="small" color="#1FA574" />
              </View>
            ) : availableTripsError ? (
              <View className="mb-2 rounded-3xl border border-[#F1C8C5] bg-white px-4 py-5">
                <Text className="text-center text-[12.5px] font-JakartaSemiBold text-[#A63B36]">
                  Couldn&apos;t load available rides
                </Text>
                <Text className="mt-1 text-center text-[11px] font-Jakarta text-[#68756F]">
                  {availableTripsError}
                </Text>
              </View>
            ) : offerTrips.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {offerTrips.slice(0, 5).map((trip) => (
                  <OfferTripCard
                    key={trip.id}
                    trip={trip}
                    booking={false}
                    onBook={() => handleBookOfferTrip(trip)}
                    isCheapest={Number(trip.price_per_seat) === Math.min(...offerTrips.map((item) => Number(item.price_per_seat)))}
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="mb-2 rounded-3xl border border-dashed border-[#E4EFEA] bg-white px-4 py-5">
                <Text className="text-center text-[12.5px] font-Jakarta text-[#9A928A]">
                  No rides are available right now.
                </Text>
              </View>
            )}

            {/* ── Recent rides heading ── */}
            <View className="mb-3 mt-7 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-[#1FA574]" />
                <Text className="text-[17px] font-JakartaExtraBold text-[#2B2722]">
                  Recent rides
                </Text>
              </View>

              {rides.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(root)/(tabs)/rides")}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-1"
                >
                  <Text className="text-[13px] font-JakartaBold text-[#0A3B2E]">
                    See all
                  </Text>
                  <Ionicons name="chevron-forward" size={13} color="#0A3B2E" />
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#1FA574" />
              <Text className="mt-3 text-[12.5px] font-Jakarta text-[#9A928A]">
                Loading your rides
              </Text>
            </View>
          ) : recentRidesError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load recent rides"
              message={recentRidesError}
            />
          ) : (
            <EmptyState
              icon="car-outline"
              title="No rides yet"
              message="Search for a destination above and book your first seat."
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Home;
