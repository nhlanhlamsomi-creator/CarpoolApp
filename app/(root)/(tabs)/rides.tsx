import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/Cards";
import RideCard from "@/components/RideCard";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/type";

const SUPPORT_EMAIL = "support@lyftcarpool.co.za";

type Tab = "upcoming" | "history";

const Rides = () => {
  const { user } = useUser();
  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const [tab, setTab] = useState<Tab>("upcoming");

  const fetchState = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);
  const { data: recentRides, loading, error } = fetchState;

  // The template's useFetch exposes refetch; guard in case yours doesn't.
  const refetch = (fetchState as any).refetch as
    | (() => Promise<void> | void)
    | undefined;

  const [refreshing, setRefreshing] = useState(false);

  // Without this the list keeps whatever it loaded when the tab first mounted,
  // so a trip booked seconds ago never appears until the app restarts.
  useFocusEffect(
    useCallback(() => {
      refetch?.();
    }, [refetch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch?.();
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
    const status = (ride as any).status;

    if (status) {
      return ["booked", "scheduled", "accepted", "in_progress"].includes(status);
    }

    const scheduled = (ride as any).scheduled_for;
    if (scheduled) return new Date(scheduled).getTime() > Date.now();

    return false;
  };

  const upcoming = useMemo(() => rides.filter(isUpcoming), [rides]);
  const history = useMemo(() => rides.filter((r) => !isUpcoming(r)), [rides]);
  const visible = tab === "upcoming" ? upcoming : history;

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleMessage = (ride: Ride) => {
    router.push({
      pathname: "/(root)/(tabs)/chat",
      params: { rideId: String((ride as any).ride_id ?? ride.created_at) },
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
              const res = await fetch("/(api)/ride/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ride_id: (ride as any).ride_id, user_id: user?.id }),
              });

              const json = await res.json();

              if (!res.ok) {
                console.error("Cancel failed:", json);
                Alert.alert("Cancel failed", json?.error || "Unable to cancel trip");
                return;
              }

              Alert.alert("Cancelled", "Your trip has been cancelled.");
              // Refresh list
              await refetch?.();
            } catch (e) {
              console.error("Error calling cancel endpoint:", e);
              Alert.alert("Cancel failed", "Unable to cancel trip");
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
      { text: "Driver behaviour", onPress: () => emailReport(ride, "Driver behaviour") },
      { text: "Fare or payment", onPress: () => emailReport(ride, "Fare or payment") },
      { text: "Safety concern", onPress: () => emailReport(ride, "Safety concern") },
      { text: "Cancel", style: "cancel" },
    ]);
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
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
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
            tintColor="#0E5C3F"
            colors={["#0E5C3F"]}
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
            onReport={() => handleReport(item)}
          />
        )}
        ListHeaderComponent={
          <>
            <Text className="my-5 text-2xl font-JakartaExtraBold text-[#101814]">
              My trips
            </Text>

            {/* Tabs, with counts so the split is obvious before you tap */}
            <View className="mb-5 flex-row rounded-2xl bg-[#EEF1F0] p-1">
              {(
                [
                  { key: "upcoming", label: "Upcoming", count: upcoming.length },
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
                          ? "font-JakartaBold text-[#0E5C3F]"
                          : "font-JakartaMedium text-[#68756F]"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {item.count > 0 && (
                      <View
                        className={`rounded-full px-1.5 py-0.5 ${
                          active ? "bg-[#E6F2EC]" : "bg-[#DFE6E2]"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-JakartaBold ${
                            active ? "text-[#0E5C3F]" : "text-[#68756F]"
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
              <ActivityIndicator size="large" color="#0E5C3F" />
              <Text className="mt-3 text-[12.5px] font-Jakarta text-[#68756F]">
                Loading your trips
              </Text>
            </View>
          ) : error ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load your trips"
              message="Check your connection and pull down to try again."
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
            <View className="mt-2 flex-row gap-2.5 rounded-2xl border border-[#E2E9E5] bg-white p-4">
              <Ionicons name="information-circle-outline" size={16} color="#0E5C3F" />
              <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#68756F]">
                Past trips can&apos;t be deleted. We keep them as payment records,
                and they&apos;re what we rely on if you ever report a problem.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default Rides;