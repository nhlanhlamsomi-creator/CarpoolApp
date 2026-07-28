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
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
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
              className="mb-3 flex-row items-center rounded-2xl border border-[#E2E9E5] bg-white p-4 active:opacity-80"
            >
              {item.driver?.profile_image_url ? (
                <Image
                  source={{ uri: item.driver.profile_image_url }}
                  className="h-12 w-12 rounded-full bg-[#EEF1F0]"
                />
              ) : (
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E6F2EC]">
                  <Ionicons name="person" size={20} color="#0E5C3F" />
                </View>
              )}

              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="text-[14.5px] font-JakartaBold text-[#101814]"
                    numberOfLines={1}
                  >
                    {driverName}
                  </Text>
                  {active && (
                    <View className="h-2 w-2 rounded-full bg-[#1FB574]" />
                  )}
                </View>
                <Text
                  className="mt-0.5 text-[12px] font-Jakarta text-[#68756F]"
                  numberOfLines={1}
                >
                  {item.destination_address}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9BA6A1" />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <Text className="my-5 text-2xl font-JakartaExtraBold text-[#101814]">
            Messages
          </Text>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#0E5C3F" />
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