import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Platform,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/Cards";
import RideCard from "@/components/RideCard";
import { apiRequest, useApiFetch } from "@/lib/api";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/type";

const SUPPORT_EMAIL = "support@lyftcarpool.co.za";

type Tab = "upcoming" | "history";

const Rides = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const [tab, setTab] = useState<Tab>("upcoming");
  const [safetyAlerts, setSafetyAlerts] = useState<Record<string, any>>({});

  const {
    data: recentRides,
    loading,
    error,
    refetch,
  } = useApiFetch<Ride[]>("/api/rides");

  const [refreshing, setRefreshing] = useState(false);

  // Without this the list keeps whatever it loaded when the tab first mounted,
  // so a trip booked seconds ago never appears until the app restarts.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const rides = useMemo(
    () => (Array.isArray(recentRides) ? recentRides : []),
    [recentRides],
  );

  // "Upcoming" is a state, not a date calculation. The status column decides
  // it; scheduled_for is only a fallback for rows created before that existed.
  const isUpcoming = (ride: Ride) => {
    const status = ride.status;

    if (status) {
      return [
        "booked",
        "scheduled",
        "accepted",
        "confirmed",
        "in_progress",
      ].includes(status);
    }

    const scheduled = ride.scheduled_for;
    if (scheduled) return new Date(scheduled).getTime() > Date.now();

    return false;
  };

  const upcoming = useMemo(
    () =>
      rides
        .filter(isUpcoming)
        .sort((left, right) => {
          const leftTime = new Date(
            left.scheduled_for ?? left.ride_time,
          ).getTime();
          const rightTime = new Date(
            right.scheduled_for ?? right.ride_time,
          ).getTime();
          return leftTime - rightTime;
        }),
    [rides],
  );
  const history = useMemo(
    () =>
      rides
        .filter((ride) => !isUpcoming(ride))
        .sort(
          (left, right) =>
            new Date(right.created_at).getTime() -
            new Date(left.created_at).getTime(),
        ),
    [rides],
  );
  const visible = tab === "upcoming" ? upcoming : history;

  const activeRides = useMemo(
    () =>
      upcoming.filter((ride) =>
        ["accepted", "in_progress"].includes((ride as any).status),
      ),
    [upcoming],
  );

  const pollSafetyAlerts = useCallback(async () => {
    if (!user?.id || activeRides.length === 0) return;
    const results = await Promise.all(
      activeRides.map(async (ride) => {
        const rideId = String(ride.ride_id);
        const response = await fetch(
          `/(api)/safety/${rideId}?passenger_id=${encodeURIComponent(user.id)}`,
        );
        if (!response.ok) return [rideId, null] as const;
        const json = await response.json();
        return [rideId, json.data] as const;
      }),
    );
    setSafetyAlerts(Object.fromEntries(results.filter(([, alert]) => alert)));
  }, [activeRides, user?.id]);

  useEffect(() => {
    pollSafetyAlerts();
    const interval = setInterval(pollSafetyAlerts, 15000);
    return () => clearInterval(interval);
  }, [pollSafetyAlerts]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleMessage = (ride: Ride) => {
    router.push({
      pathname: "/(root)/(tabs)/chat",
      params: { rideId: String(ride.ride_id ?? ride.created_at) },
    });
  };

  const handleCall = (ride: Ride) => {
    const phone = (ride.driver as any)?.phone_number;

    if (!phone) {
      Alert.alert(
        "No number available",
        "This driver hasn't shared a phone number. Send them a message instead.",
      );
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const handleCancel = (ride: Ride) => {
    const rideId = Number(ride.ride_id);
    if (!Number.isSafeInteger(rideId) || rideId <= 0) {
      Alert.alert("Cancel failed", "This trip is missing a valid ride ID.");
      return;
    }

    Alert.alert(
      "Cancel this trip?",
      "Cancelling close to departure may incur a fee, and your seat is released to someone else.",
      [
        { text: "Keep my seat", style: "cancel" },
        {
          text: "Cancel trip",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              await apiRequest(
                `/api/rides/${rideId}/cancel`,
                { method: "POST" },
                token,
              );
              Alert.alert("Cancelled", "Your trip has been cancelled.");
              await refetch();
            } catch (error) {
              console.error("Error cancelling ride:", error);
              Alert.alert(
                "Cancel failed",
                error instanceof Error ? error.message : "Unable to cancel trip",
              );
            }
          },
        },
      ],
    );
  };

  // Rebook is the most useful action here — most trips are commutes, so the
  // same route gets booked over and over.
  const handleRebook = (ride: Ride) => {
    setUserLocation({
      latitude: Number(ride.origin_latitude),
      longitude: Number(ride.origin_longitude),
      address: ride.origin_address,
    });
    setDestinationLocation({
      latitude: Number(ride.destination_latitude),
      longitude: Number(ride.destination_longitude),
      address: ride.destination_address,
    });
    router.push("/(root)/confirm-ride");
  };

  const handleReport = (ride: Ride) => {
    Alert.alert("Report a problem", "What went wrong?", [
      {
        text: "Driver behaviour",
        onPress: () => emailReport(ride, "Driver behaviour"),
      },
      {
        text: "Fare or payment",
        onPress: () => emailReport(ride, "Fare or payment"),
      },
      {
        text: "Safety concern",
        onPress: () => emailReport(ride, "Safety concern"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleRate = (ride: Ride) => {
    if (!ride.ride_id) {
      Alert.alert(
        "Unable to rate trip",
        "We couldn't identify this trip. Refresh your trips and try again.",
      );
      return;
    }

    router.push({
      pathname: "/(root)/rate-driver/[rideId]",
      params: { rideId: String(ride.ride_id) },
    });
  };

  const handleManualSOS = (ride: Ride) => {
    Alert.alert(
      "Send SOS?",
      "This records an urgent safety incident and shares your current location if permission is available.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: async () => {
            try {
              let location: { latitude: number; longitude: number } | null =
                null;
              try {
                const permission =
                  await Location.requestForegroundPermissionsAsync();
                if (permission.granted) {
                  const recentLocation =
                    await Location.getLastKnownPositionAsync({
                      maxAge: 60000,
                      requiredAccuracy: 1500,
                    });
                  const position =
                    recentLocation ??
                    (await Location.getCurrentPositionAsync({
                      accuracy: Location.Accuracy.Balanced,
                    }));
                  location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  };
                }
              } catch (locationError) {
                console.warn("Unable to get location for SOS:", locationError);
              }

              const response = await fetch("/(api)/safety/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ride_id: (ride as any).ride_id,
                  passenger_id: user?.id,
                  latitude: location?.latitude ?? null,
                  longitude: location?.longitude ?? null,
                }),
              });
              if (!response.ok) throw new Error("SOS request failed");

              void pollSafetyAlerts();
              let emergencyContact: { name: string; phone: string } | null =
                null;
              try {
                const profileResponse = await fetch(
                  `/(api)/profile?clerkId=${encodeURIComponent(user?.id ?? "")}`,
                );
                if (profileResponse.ok) {
                  const profileJson = await profileResponse.json();
                  const rawContact =
                    profileJson.data?.profile_data?.emergency_contact;
                  const parsedContact =
                    typeof rawContact === "string"
                      ? JSON.parse(rawContact)
                      : rawContact;
                  if (parsedContact?.phone) {
                    emergencyContact = {
                      name: parsedContact.name || "emergency contact",
                      phone: String(parsedContact.phone),
                    };
                  }
                }
              } catch (contactError) {
                console.warn("Unable to load emergency contact:", contactError);
              }

              const message = location
                ? `I need help during my carpool ride. My location is https://maps.google.com/?q=${location.latitude},${location.longitude}`
                : "I need help during my carpool ride. My current location is unavailable.";
              const smsUrl = emergencyContact
                ? Platform.OS === "ios"
                  ? `sms:${encodeURIComponent(emergencyContact.phone)}&body=${encodeURIComponent(message)}`
                  : `sms:${encodeURIComponent(emergencyContact.phone)}?body=${encodeURIComponent(message)}`
                : null;

              Alert.alert(
                "SOS recorded",
                "The incident was saved, but nobody was contacted automatically. Call 112 or open a text to your saved contact below. Texts must be sent by you.",
                [
                  {
                    text: "Call 112",
                    onPress: () => {
                      void Linking.openURL("tel:112").catch(() =>
                        Alert.alert(
                          "Call unavailable",
                          "Please dial 112 from your phone.",
                        ),
                      );
                    },
                  },
                  ...(smsUrl
                    ? [
                        {
                          text: `Text ${emergencyContact?.name}`,
                          onPress: () => {
                            void Linking.openURL(smsUrl).catch(() =>
                              Alert.alert(
                                "Messaging unavailable",
                                "Please contact your emergency contact directly.",
                              ),
                            );
                          },
                        },
                      ]
                    : []),
                  { text: "Done", style: "cancel" },
                ],
              );
            } catch {
              Alert.alert(
                "SOS failed",
                "The safety incident could not be saved. If you are in immediate danger, call 112.",
                [
                  {
                    text: "Call 112",
                    onPress: () => void Linking.openURL("tel:112"),
                  },
                  { text: "Close", style: "cancel" },
                ],
              );
            }
          },
        },
      ],
    );
  };

  const handleSafetyResponse = async (
    ride: Ride,
    response: string,
    status: "acknowledged" | "dismissed",
  ) => {
    const rideId = String((ride as any).ride_id);
    await fetch(`/(api)/safety/${rideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passenger_id: user?.id, response, status }),
    });
    setSafetyAlerts((current) => ({ ...current, [rideId]: null }));
  };

  const emailReport = (ride: Ride, reason: string) => {
    const body = [
      `Reason: ${reason}`,
      "",
      "Describe what happened:",
      "",
      "",
      "---",
      `Trip: ${ride.origin_address} to ${ride.destination_address}`,
      `Date: ${ride.created_at}`,
      `Driver: ${ride.driver?.first_name ?? "Unknown"} ${ride.driver?.last_name ?? ""}`,
    ].join("\n");

    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `Trip report — ${reason}`,
      )}&body=${encodeURIComponent(body)}`,
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-[#F7F4FB]">
      <FlatList
        data={visible}
        keyExtractor={(item, index) =>
          `${(item as any).ride_id ?? item.created_at}-${index}`
        }
        className="px-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5A189A"
            colors={["#5A189A"]}
          />
        }
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            variant={tab === "upcoming" ? "upcoming" : "completed"}
            onMessage={() => handleMessage(item)}
            onCall={() => handleCall(item)}
            onCancel={() => handleCancel(item)}
            onRebook={() => handleRebook(item)}
            onRate={() => handleRate(item)}
            onReport={() => handleReport(item)}
            safetyAlert={safetyAlerts[String(item.ride_id)] ?? null}
            onSafetyResponse={(response, status) =>
              handleSafetyResponse(item, response, status)
            }
            onManualSOS={
              ["accepted", "in_progress"].includes(item.status ?? "")
                ? () => handleManualSOS(item)
                : undefined
            }
          />
        )}
        ListHeaderComponent={
          <>
            <View className="my-5">
              <Text className="text-[24px] font-JakartaExtraBold text-[#21152F]">
                My trips
              </Text>
            </View>

            {/* Tabs, with counts so the split is obvious before you tap */}
            <View className="mb-5 flex-row rounded-2xl bg-[#F0E6FA] p-1">
              {(
                [
                  {
                    key: "upcoming",
                    label: "Upcoming",
                    count: upcoming.length,
                  },
                  { key: "history", label: "History", count: history.length },
                ] as const
              ).map((item) => {
                const active = tab === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setTab(item.key)}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 ${
                      active ? "bg-white" : ""
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        active
                          ? "font-JakartaBold text-[#5A189A]"
                          : "font-JakartaMedium text-[#746A7E]"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {item.count > 0 && (
                      <View
                        className={`rounded-full px-1.5 py-0.5 ${
                          active ? "bg-[#F0E6FA]" : "bg-[#E9E2F0]"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-JakartaBold ${
                            active ? "text-[#5A189A]" : "text-[#746A7E]"
                          }`}
                        >
                          {item.count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#5A189A" />
              <Text className="mt-3 text-[12.5px] font-Jakarta text-[#746A7E]">
                Loading your trips
              </Text>
            </View>
          ) : error ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load your trips"
              message={error}
              actionLabel="Retry"
              onAction={() => void refetch()}
            />
          ) : tab === "upcoming" ? (
            <EmptyState
              icon="calendar-outline"
              title="Nothing booked"
              message="You have no upcoming trips. Search for a destination to book a seat."
              actionLabel="Find a ride"
              onAction={() => router.push("/(root)/(tabs)/home")}
            />
          ) : (
            <EmptyState
              icon="time-outline"
              title="No past trips"
              message="Once you've travelled, your trips appear here so you can rebook them in one tap."
            />
          )
        }
        ListFooterComponent={
          tab === "history" && history.length > 0 ? (
            <View className="mt-2 flex-row gap-2.5 rounded-2xl border border-[#E9E2F0] bg-white p-4">
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#5A189A"
              />
              <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#746A7E]">
                Past trips can&apos;t be deleted. We keep them as payment
                records, and they&apos;re what we rely on if you ever report a
                problem.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default Rides;
