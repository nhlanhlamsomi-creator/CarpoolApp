import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/Cards";

const Chat = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="my-5 text-2xl font-JakartaExtraBold text-[#101814]">
          Messages
        </Text>

        <View className="flex-1 justify-center">
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No messages yet"
            message="When you book a trip, you can message your driver here about pickup details."
            actionLabel="Find a ride"
            onAction={() => router.push("/(root)/(tabs)/home")}
          />
        </View>

        {/* Safety note — the one thing worth saying on an empty inbox, since
            it sets expectations before the first conversation happens */}
        <View className="mt-4 flex-row gap-2.5 rounded-2xl border border-[#E2E9E5] bg-white p-4">
          <Ionicons name="shield-checkmark-outline" size={16} color="#0E5C3F" />
          <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#68756F]">
            Messages stay inside the app and are kept for your safety. Keep trip
            arrangements here rather than moving to WhatsApp.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chat;