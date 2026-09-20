import { useUser } from "@clerk/clerk-expo";
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
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";

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

// PASSENGER APP — the Chat tab: one conversation per trip that has a driver
// attached. Reuses the rides endpoint, so no new API is needed for the list.

const Chat = () => {
  const { user } = useUser();

  const state = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);
  const { data, loading } = state;
  const refetch = (state as any).refetch as (() => void) | undefined;

  useFocusEffect(
    useCallback(() => {
      refetch?.();
    }, [refetch]),
  );

  const threads = useMemo(() => {
    const rides = Array.isArray(data) ? data : [];
    // Chat exists once a driver is attached and the trip isn't cancelled.
    // Completed trips stay listed — lost-property conversations are real.
    return rides.filter((r: any) =>
      ["accepted", "in_progress", "completed", "booked"].includes(
        r.status ?? "booked",
      ),
    );
  }, [data]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WARM.cream }}>
      <FlatList
        data={threads}
        keyExtractor={(item: any, i) => `${item.ride_id ?? i}`}
        className="px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        renderItem={({ item }: any) => {
          const driverName = item.driver
            ? `${item.driver.first_name ?? ""} ${item.driver.last_name ?? ""}`.trim()
            : "Driver";
          const active = ["accepted", "in_progress"].includes(item.status);

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
                    backgroundColor: WARM.goldSoft,
                  }}
                >
                  <Ionicons name="person" size={20} color={WARM.goldDeep} />
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
                        backgroundColor: WARM.gold,
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

              <Ionicons
                name="chevron-forward"
                size={18}
                color={WARM.muted}
              />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <Text
            style={{
              marginVertical: 20,
              fontSize: 24,
              fontFamily: "Jakarta-ExtraBold",
              color: WARM.charcoal,
            }}
          >
            Messages
          </Text>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={WARM.gold} />
            </View>
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