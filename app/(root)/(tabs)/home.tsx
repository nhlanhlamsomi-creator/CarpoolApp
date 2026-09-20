import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { OfferTrip, Ride } from "@/types/type";

const Home = () => {
  const { user } = useUser();
  const { signOut, userId } = useAuth();

  const {
    setUserLocation,
    setDestinationLocation,
    userAddress,
    userLatitude,
    userLongitude,
  } = useLocationStore();

  const {
    data: recentRides,
    loading,
    refetch: refetchRecentRides,
  } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);
  const {
    data: availableTrips,
    loading: availableTripsLoading,
    refetch: refetchAvailableTrips,
  } = useFetch<OfferTrip[]>("/(api)/offer-trip");

  const rides = recentRides || [];
  const offerTrips = availableTrips || [];
  const [bookingTripId, setBookingTripId] = useState<number | null>(null);

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

  const handleBookOfferTrip = async (trip: OfferTrip) => {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in before booking a ride.");
      return;
    }

    setBookingTripId(trip.id);

    try {
      const response = await fetchAPI("/(api)/offer-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip.id, userId }),
      });

      await Promise.all([refetchAvailableTrips(), refetchRecentRides()]);
      Alert.alert(
        "Ride booked",
        `Your seat from ${trip.leaving_from} to ${trip.going_to} is reserved.`,
      );
      return response;
    } catch (error: any) {
      const message = error?.message?.includes("409")
        ? "This ride is no longer available."
        : "Unable to book this ride right now.";
      Alert.alert("Booking failed", message);
    } finally {
      setBookingTripId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      <FlatList
        data={rides.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
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
              <View className="flex-1 pr-3">
                <Text className="text-[13px] font-Jakarta text-[#68756F]">
                  Welcome back
                </Text>
                <Text
                  className="mt-0.5 text-[23px] font-JakartaExtraBold text-[#101814]"
                  numberOfLines={1}
                >
                  {user?.firstName ?? "there"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  signOut();
                  router.replace("/(auth)/sign-in");
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                activeOpacity={0.8}
                className="h-11 w-11 items-center justify-center rounded-2xl border border-[#E2E9E5] bg-white"
              >
                <Ionicons name="log-out-outline" size={20} color="#68756F" />
              </TouchableOpacity>
            </View>

            {/* ── Search ── */}
            <GoogleTextInput
              handlePress={handleDestinationPress}
              biasLat={userLatitude}
              biasLng={userLongitude}
            />

            {/* ── Map ── */}
            <View className="mt-6 overflow-hidden rounded-3xl border border-[#E2E9E5] bg-white">
              <View className="h-[260px]">
                <Map />
              </View>

              <View className="flex-row items-center gap-2.5 px-4 py-3.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E6F2EC]">
                  <Ionicons name="navigate" size={15} color="#0E5C3F" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-Jakarta text-[#9BA6A1]">
                    Your location
                  </Text>
                  <Text
                    className="text-[13px] font-JakartaSemiBold text-[#101814]"
                    numberOfLines={1}
                  >
                    {userAddress ?? "Finding you…"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-2 mt-7 flex-row items-center justify-between">
              <Text className="text-[17px] font-JakartaExtraBold text-[#101814]">
                Available rides
              </Text>
              {offerTrips.length > 0 && (
                <Text className="text-[12px] font-JakartaMedium text-[#68756F]">
                  {offerTrips.length} {offerTrips.length === 1 ? "ride" : "rides"}
                </Text>
              )}
            </View>

            {availableTripsLoading ? (
              <View className="mb-2 items-center rounded-2xl border border-[#E2E9E5] bg-white py-5">
                <ActivityIndicator size="small" color="#0E5C3F" />
              </View>
            ) : offerTrips.length > 0 ? (
              offerTrips.slice(0, 5).map((trip) => (
                <OfferTripCard
                  key={trip.id}
                  trip={trip}
                  booking={bookingTripId === trip.id}
                  onBook={() => handleBookOfferTrip(trip)}
                />
              ))
            ) : (
              <View className="mb-2 rounded-2xl border border-[#E2E9E5] bg-white px-4 py-5">
                <Text className="text-center text-[12.5px] font-Jakarta text-[#68756F]">
                  No rides are available right now.
                </Text>
              </View>
            )}

            <View className="mt-7 mb-2 flex-row items-center justify-between">
              <Text className="text-[17px] font-JakartaExtraBold text-[#101814]">
                Carpool groups
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/carpool-groups")}
                activeOpacity={0.8}
              >
                <Text className="text-[13px] font-JakartaBold text-[#0E5C3F]">
                  View groups
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Recent rides ── */}
            <View className="mb-3 mt-7 flex-row items-center justify-between">
              <Text className="text-[17px] font-JakartaExtraBold text-[#101814]">
                Recent rides
              </Text>

              {rides.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(root)/(tabs)/rides")}
                  activeOpacity={0.7}
                >
                  <Text className="text-[13px] font-JakartaBold text-[#0E5C3F]">
                    See all
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#0E5C3F" />
              <Text className="mt-3 text-[12.5px] font-Jakarta text-[#68756F]">
                Loading your rides
              </Text>
            </View>
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