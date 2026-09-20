import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
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
import { fetchAPI, useFetch } from "@/lib/fetch";
import { findCarpoolGroups, type PassengerLocation } from "@/services/kMeans";
import { useLocationStore } from "@/store";
import { OfferTrip, Ride } from "@/types/type";

const { width } = Dimensions.get("window");

// ─── Palette ─────────────────────────────────────────────────────────────────
const WARM = {
  cream:    "#FBF7F0",
  sand:     "#F4EDE1",
  gold:     "#F5B93C",
  goldDeep: "#E0A11E",
  goldSoft: "#FCEBC4",
  charcoal: "#2B2722",
  graphite: "#4A443D",
  muted:    "#9A928A",
  line:     "#E7DECF",
};

// 3-column square grid sizing inside px-5 (20 each side) + 10 gaps
const H_PADDING = 20;
const GAP = 10;
const SQ = (width - H_PADDING * 2 - GAP * 2) / 3;

const PREVIEW_LIMIT = 3;

// Demo passenger seed — matches CarpoolGroupsScreen so both screens agree
const PASSENGERS: PassengerLocation[] = [
  { id: "p1", latitude: -25.7479, longitude: 28.2293 },
  { id: "p2", latitude: -25.75,   longitude: 28.23   },
  { id: "p3", latitude: -25.76,   longitude: 28.24   },
  { id: "p4", latitude: -25.77,   longitude: 28.25   },
  { id: "p5", latitude: -25.771,  longitude: 28.251  },
  { id: "p6", latitude: -25.742,  longitude: 28.2205 },
];

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

  // ── Carpool clusters ──────────────────────────────────────────────────────
  const [vehicleCapacity] = useState(4);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const groups = useMemo(
    () =>
      findCarpoolGroups(PASSENGERS, vehicleCapacity, {
        k: 3,
        maxIterations: 25,
        maxPickupDistanceKm: 5,
      }),
    [vehicleCapacity],
  );

  const previewGroups = groups.slice(0, PREVIEW_LIMIT);
  const selectedGroup =
    selectedIndex !== null ? previewGroups[selectedIndex] : null;

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
      ])
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

  const initial = (user?.firstName ?? "T").charAt(0).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WARM.cream }}>
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
              <View className="flex-1 pr-3 flex-row items-center gap-3">
                <Animated.View
                  style={{ transform: [{ translateY: avatarY }] }}
                  className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F5B93C] border border-[#E0A11E]"
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
                className="h-11 w-11 items-center justify-center rounded-2xl border border-[#E7DECF] bg-[#F4EDE1]"
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
              biasLat={userLatitude}
              biasLng={userLongitude}
            />

            {/* ── Map ── */}
            <View className="mt-6 overflow-hidden rounded-3xl border border-[#E7DECF] bg-white">
              <View className="h-[260px]">
                <Map />
              </View>

              <View className="flex-row items-center gap-3 px-4 py-3.5 bg-[#FBF7F0]">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#FCEBC4]">
                  <Ionicons name="navigate" size={16} color="#E0A11E" />
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
                <View className="h-2 w-2 rounded-full bg-[#F5B93C]" />
              </View>
            </View>

            {/* ── Available rides heading ── */}
            <View className="mt-7 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-[#F5B93C]" />
                <Text className="text-[17px] font-JakartaExtraBold text-[#2B2722]">
                  Available rides
                </Text>
              </View>
              {offerTrips.length > 0 && (
                <View className="rounded-full bg-[#FCEBC4] px-2.5 py-1">
                  <Text className="text-[11px] font-JakartaBold text-[#E0A11E]">
                    {offerTrips.length} {offerTrips.length === 1 ? "ride" : "rides"}
                  </Text>
                </View>
              )}
            </View>

            {availableTripsLoading ? (
              <View className="mb-2 items-center rounded-3xl border border-[#E7DECF] bg-white py-5">
                <ActivityIndicator size="small" color="#F5B93C" />
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
              <View className="mb-2 rounded-3xl border border-dashed border-[#FCEBC4] bg-[#F4EDE1] px-4 py-5">
                <Text className="text-center text-[12.5px] font-Jakarta text-[#9A928A]">
                  No rides are available right now.
                </Text>
              </View>
            )}

            {/* ── Carpool groups heading + always-visible View all ── */}
            <View className="mt-7 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-[#F5B93C]" />
                <Text className="text-[17px] font-JakartaExtraBold text-[#2B2722]">
                  Carpool groups
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/(root)/carpool-groups")}
                className="flex-row items-center gap-1"
              >
                <Text className="text-[13px] font-JakartaBold text-[#E0A11E]">
                  View all
                </Text>
                <Ionicons name="chevron-forward" size={13} color="#E0A11E" />
              </TouchableOpacity>
            </View>

            {previewGroups.length > 0 ? (
              <>
                {/* 3 cluster squares */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: GAP,
                  }}
                >
                  {previewGroups.map((group, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                      <TouchableOpacity
                        key={`${group.clusterId}-${index}`}
                        activeOpacity={0.85}
                        onPress={() =>
                          setSelectedIndex(isSelected ? null : index)
                        }
                        style={{
                          width: SQ,
                          height: SQ,
                          borderRadius: 20,
                          backgroundColor: "#FFFFFF",
                          borderWidth: 2,
                          borderColor: isSelected ? WARM.gold : WARM.line,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          justifyContent: "space-between",
                          shadowColor: isSelected
                            ? WARM.goldDeep
                            : WARM.charcoal,
                          shadowOffset: {
                            width: 0,
                            height: isSelected ? 8 : 4,
                          },
                          shadowOpacity: isSelected ? 0.25 : 0.06,
                          shadowRadius: isSelected ? 14 : 10,
                          elevation: isSelected ? 8 : 2,
                        }}
                      >
                        <View
                          style={{
                            height: 26,
                            width: 26,
                            borderRadius: 9,
                            backgroundColor: isSelected
                              ? WARM.gold
                              : WARM.goldSoft,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: "Jakarta-ExtraBold",
                              color: isSelected
                                ? WARM.charcoal
                                : WARM.goldDeep,
                            }}
                          >
                            {index + 1}
                          </Text>
                        </View>

                        <View>
                          <Text
                            style={{
                              fontSize: 22,
                              fontFamily: "Jakarta-ExtraBold",
                              color: WARM.charcoal,
                              lineHeight: 24,
                            }}
                          >
                            {group.passengerCount}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Jakarta-SemiBold",
                              color: WARM.muted,
                              marginTop: 2,
                              textTransform: "uppercase",
                              letterSpacing: 0.6,
                            }}
                          >
                            {group.passengerCount === 1 ? "Rider" : "Riders"}
                          </Text>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <View
                            style={{
                              height: 5,
                              width: 5,
                              borderRadius: 3,
                              backgroundColor: isSelected
                                ? WARM.gold
                                : WARM.muted,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Jakarta-Medium",
                              color: WARM.graphite,
                            }}
                            numberOfLines={1}
                          >
                            {group.pickupAreaRadiusKm.toFixed(1)} km
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Detail popup for the selected cluster */}
                {selectedGroup && (
                  <View
                    style={{
                      marginTop: 14,
                      borderRadius: 22,
                      borderWidth: 1.5,
                      borderColor: WARM.gold,
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      shadowColor: WARM.goldDeep,
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.12,
                      shadowRadius: 18,
                      elevation: 5,
                    }}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#F5B93C]">
                        <Text className="text-[13px] font-JakartaExtraBold text-[#2B2722]">
                          {selectedIndex! + 1}
                        </Text>
                      </View>
                      <Text className="text-[16px] font-JakartaExtraBold text-[#2B2722]">
                        Cluster {selectedIndex! + 1}
                      </Text>
                    </View>

                    <View className="mt-4 gap-3">
                      <HomeDetailRow
                        label="Passengers"
                        value={`${selectedGroup.passengerCount}`}
                      />
                      <HomeDetailRow
                        label="Pickup area"
                        value={`${selectedGroup.pickupAreaRadiusKm.toFixed(
                          1,
                        )} km radius`}
                      />
                      <HomeDetailRow
                        label="Centroid"
                        value={`${selectedGroup.centroid.latitude.toFixed(
                          4,
                        )}, ${selectedGroup.centroid.longitude.toFixed(4)}`}
                      />
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View className="rounded-3xl border border-dashed border-[#FCEBC4] bg-[#F4EDE1] p-5 items-center">
                <Text className="text-[13px] font-JakartaSemiBold text-[#2B2722]">
                  No carpool groups yet
                </Text>
                <Text className="mt-1 text-[11.5px] font-Jakarta text-[#9A928A] text-center">
                  We&apos;ll group nearby riders once more people search.
                </Text>
              </View>
            )}

            {/* ── Recent rides heading ── */}
            <View className="mb-3 mt-7 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-[#F5B93C]" />
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
                  <Text className="text-[13px] font-JakartaBold text-[#E0A11E]">
                    See all
                  </Text>
                  <Ionicons name="chevron-forward" size={13} color="#E0A11E" />
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#F5B93C" />
              <Text className="mt-3 text-[12.5px] font-Jakarta text-[#9A928A]">
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

// ─── Local detail row helper ────────────────────────────────────────────────
function HomeDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-[12px] font-JakartaBold text-[#9A928A] tracking-widest uppercase">
        {label}
      </Text>
      <Text
        className="flex-1 text-right text-[13.5px] font-JakartaSemiBold text-[#2B2722]"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}