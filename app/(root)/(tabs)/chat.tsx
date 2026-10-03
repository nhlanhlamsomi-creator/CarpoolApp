import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/Cards";
import { brand, ui } from "@/constants/theme";
import { useApiFetch } from "@/lib/api";
import type { Ride } from "@/types/type";

const WARM = {
  cream: ui.bg,
  sand: ui.surface,
  accent: brand.accent,
  accentDeep: brand.dark,
  accentSoft: brand.tint,
  charcoal: ui.ink,
  muted: ui.muted,
  line: ui.border,
};

const Chat = () => {
  const {
    data,
    error,
    loading,
    refetch,
  } = useApiFetch<Ride[]>("/api/rides");

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const threads = useMemo(() => {
    const rides = Array.isArray(data) ? data : [];
    return rides.filter(
      (ride) =>
        ride.driver &&
        ["accepted", "in_progress", "completed", "booked"].includes(
          ride.status ?? "booked",
        ),
    );
  }, [data]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WARM.cream }}>
      <FlatList
        data={threads}
        keyExtractor={(item, index) => `${item.ride_id ?? index}`}
        className="px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        renderItem={({ item }) => {
          const driverName = item.driver
            ? `${item.driver.first_name ?? ""} ${item.driver.last_name ?? ""}`.trim()
            : "Driver";
          const active = ["accepted", "in_progress"].includes(
            item.status ?? "",
          );

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(root)/chat/[rideId]",
                  params: { rideId: String(item.ride_id) },
                })
              }
              style={{
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: WARM.line,
                backgroundColor: "#FFFFFF",
                padding: 16,
                shadowColor: WARM.charcoal,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
                elevation: 2,
              }}
            >
              {item.driver?.profile_image_url ? (
                <Image
                  source={{ uri: item.driver.profile_image_url }}
                  style={{
                    height: 48,
                    width: 48,
                    borderRadius: 24,
                    backgroundColor: WARM.sand,
                  }}
                />
              ) : (
                <View
                  style={{
                    height: 48,
                    width: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 24,
                    backgroundColor: WARM.accentSoft,
                  }}
                >
                  <Ionicons name="person" size={20} color={WARM.accentDeep} />
                </View>
              )}

              <View style={{ marginLeft: 12, flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14.5,
                      fontFamily: "Jakarta-Bold",
                      color: WARM.charcoal,
                    }}
                    numberOfLines={1}
                  >
                    {driverName}
                  </Text>
                  {active && (
                    <View
                      style={{
                        height: 8,
                        width: 8,
                        borderRadius: 4,
                        backgroundColor: WARM.accent,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 12,
                    fontFamily: "Jakarta",
                    color: WARM.muted,
                  }}
                  numberOfLines={1}
                >
                  {item.destination_address}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={WARM.muted} />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <View style={{ marginVertical: 20 }}>
            <Text className="text-[24px] font-JakartaExtraBold text-[#21152F]">
              Messages
            </Text>
            {error ? (
              <Text
                style={{
                  marginTop: 8,
                  color: "#B42318",
                  fontFamily: "Jakarta",
                }}
              >
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={WARM.accent} />
            </View>
          ) : error ? (
            <Pressable
              onPress={() => void refetch()}
              style={{
                alignItems: "center",
                paddingVertical: 24,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="refresh" size={18} color={WARM.accentDeep} />
              <Text style={{ color: WARM.accentDeep, fontFamily: "Jakarta-Bold" }}>
                Tap to try again
              </Text>
            </Pressable>
          ) : (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="No conversations yet"
              message="Book a trip and you can message your driver here about pickup details."
              actionLabel="Find a ride"
              onAction={() => router.push("/(root)/(tabs)/home")}
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Chat;
