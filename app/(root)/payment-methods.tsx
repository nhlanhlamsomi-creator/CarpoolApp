import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const methods = [
  { name: "Visa •••• 1234", icon: "card" },
  { name: "Mastercard", icon: "card" },
  { name: "Cash", icon: "cash" },
  { name: "Apple Pay", icon: "logo-apple" },
  { name: "Google Pay", icon: "logo-google" },
];

const PaymentMethods = () => {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="my-5 text-2xl font-JakartaBold text-neutral-900">
          Payment Methods
        </Text>
        <View className="gap-3">
          {methods.map((method) => (
            <Pressable
              key={method.name}
              className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm shadow-neutral-200"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                  <Ionicons name={method.icon as any} size={18} color="#111827" />
                </View>
                <Text className="text-sm font-JakartaSemiBold text-neutral-900">
                  {method.name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentMethods;
