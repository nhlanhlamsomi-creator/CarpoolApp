import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchAPI } from "@/lib/fetch";

type MethodId = "card" | "cash";

const METHODS: {
  id: MethodId;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "card",
    title: "Card",
    description: "Pay in the app. Your card is charged when you confirm a ride.",
    icon: "card-outline",
  },
  {
    id: "cash",
    title: "Cash",
    description: "Pay the driver directly. Bring the exact fare where you can.",
    icon: "cash-outline",
  },
];

const PaymentMethods = () => {
  const { user } = useUser();

  const [selected, setSelected] = useState<MethodId>("card");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const result = await fetchAPI(
          `/(api)/profile?clerkId=${encodeURIComponent(user.id)}`,
        );
        const stored = result?.data?.profile_data?.payment_method;
        if (stored === "cash" || stored === "card") setSelected(stored);
      } catch (error) {
        console.warn("Could not load payment preference", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const choose = async (id: MethodId) => {
    if (id === selected || saving || !user?.id) return;

    const previous = selected;
    setSelected(id); // optimistic — the tap should feel instant
    setSaving(true);

    try {
      const current = await fetchAPI(
        `/(api)/profile?clerkId=${encodeURIComponent(user.id)}`,
      );
      const existingData = current?.data?.profile_data ?? {};

      await fetchAPI("/(api)/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          profile_data: { ...existingData, payment_method: id },
        }),
      });
    } catch (error) {
      setSelected(previous); // roll back so the UI doesn't lie
      Alert.alert("Couldn't save", "Your payment method wasn't changed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl border border-[#E2E9E5] bg-white active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color="#101814" />
        </Pressable>
        <Text className="text-[19px] font-JakartaExtraBold text-[#101814]">
          Payment method
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E5C3F" />
        </View>
      ) : (
        <ScrollView
          className="px-5"
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-4 text-[13px] font-Jakarta leading-5 text-[#68756F]">
            This is how you&apos;ll pay by default. You can still change it on
            any individual booking.
          </Text>

          {METHODS.map((method) => {
            const active = selected === method.id;

            return (
              <Pressable
                key={method.id}
                onPress={() => choose(method.id)}
                className={`mb-3 flex-row items-center rounded-2xl border-[1.5px] p-4 ${
                  active
                    ? "border-[#0E5C3F] bg-[#E6F2EC]"
                    : "border-[#E2E9E5] bg-white"
                } active:opacity-80`}
              >
                <View
                  className={`h-11 w-11 items-center justify-center rounded-xl ${
                    active ? "bg-[#0E5C3F]" : "bg-[#EEF1F0]"
                  }`}
                >
                  <Ionicons
                    name={method.icon}
                    size={20}
                    color={active ? "#FFFFFF" : "#68756F"}
                  />
                </View>

                <View className="ml-3.5 flex-1">
                  <Text className="text-[15px] font-JakartaBold text-[#101814]">
                    {method.title}
                  </Text>
                  <Text className="mt-1 text-[12px] font-Jakarta leading-4 text-[#68756F]">
                    {method.description}
                  </Text>
                </View>

                <View
                  className={`ml-2 h-5 w-5 items-center justify-center rounded-full border-2 ${
                    active ? "border-[#0E5C3F] bg-[#0E5C3F]" : "border-[#DFE6E2]"
                  }`}
                >
                  {active && <Ionicons name="checkmark" size={11} color="#fff" />}
                </View>
              </Pressable>
            );
          })}

          {/* Card details are Stripe's problem, not ours — saying so is
              reassuring and it's also literally true */}
          <View className="mt-4 flex-row gap-2.5 rounded-2xl border border-[#E2E9E5] bg-white p-4">
            <Ionicons name="lock-closed-outline" size={16} color="#0E5C3F" />
            <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#68756F]">
              Card details are entered and stored by Stripe when you pay. We
              never see or keep your card number.
            </Text>
          </View>

          {saving && (
            <View className="mt-4 flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#0E5C3F" />
              <Text className="text-[12px] font-JakartaMedium text-[#68756F]">
                Saving…
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PaymentMethods;