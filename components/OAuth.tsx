import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";

const OAuth = ({ showDivider = false }: { showDivider?: boolean }) => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await googleOAuth(startOAuthFlow);

      if (result.success) {
        router.replace("/(root)/(tabs)/home");
        return;
      }

      Alert.alert("Error", result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* The auth screens already draw their own divider, so this is opt-in */}
      {showDivider && (
        <View className="my-4 flex-row items-center gap-2.5">
          <View className="h-[1px] flex-1 bg-[#E2E9E5]" />
          <Text className="text-[11.5px] font-JakartaMedium text-[#9BA6A1]">
            or continue with
          </Text>
          <View className="h-[1px] flex-1 bg-[#E2E9E5]" />
        </View>
      )}

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={loading}
        activeOpacity={0.82}
        accessibilityRole="button"
        className={`h-[52px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-[#E2E9E5] bg-white ${
          loading ? "opacity-60" : ""
        }`}
      >
        <Image source={icons.google} resizeMode="contain" className="h-5 w-5" />
        <Text className="text-[15px] font-JakartaSemiBold text-[#101814]">
          {loading ? "Connecting…" : "Continue with Google"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OAuth;