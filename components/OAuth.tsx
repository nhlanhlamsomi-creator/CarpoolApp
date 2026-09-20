import { useOAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";

// Warm palette — matches the welcome + sign-up screens
const WARM = {
  cream:    "#FBF7F0",
  sand:     "#F4EDE1",
  line:     "#E7DECF",
  gold:     "#F5B93C",
  goldDeep: "#E0A11E",
  charcoal: "#2B2722",
  graphite: "#4A443D",
  muted:    "#9A928A",
};

const OAuth = ({ showDivider = false }: { showDivider?: boolean }) => {
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startApple }  = useOAuth({ strategy: "oauth_apple"  });

  const [loading, setLoading] = useState<null | "google" | "apple">(null);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading("google");
    try {
      const result = await googleOAuth(startGoogle);

      if (result.success) {
        router.replace("/(root)/(tabs)/home");
        return;
      }

      Alert.alert("Error", result.message);
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    if (loading) return;
    setLoading("apple");
    try {
      const { createdSessionId, setActive } = await startApple();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(root)/(tabs)/home");
        return;
      }

      Alert.alert("Error", "Apple sign-in was cancelled.");
    } catch (err: any) {
      // Swallow user-dismissed sheets so we don't shout at them
      if (err?.code === "SIGN_IN_CANCELLED" || err?.code === "-5") return;
      Alert.alert("Error", "Apple sign-in failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View>
      {/* The auth screens already draw their own divider, so this is opt-in */}
      {showDivider && (
        <View className="my-4 flex-row items-center gap-2.5">
          <View className="h-[1px] flex-1 bg-[#E7DECF]" />
          <Text className="text-[11.5px] font-JakartaMedium text-[#9A928A]">
            or continue with
          </Text>
          <View className="h-[1px] flex-1 bg-[#E7DECF]" />
        </View>
      )}

      <View className="gap-3">
        {/* Google */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={!!loading}
          activeOpacity={0.82}
          accessibilityRole="button"
          className={`h-[52px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-[#E7DECF] bg-[#FBF7F0] ${
            loading && loading !== "google" ? "opacity-60" : ""
          }`}
        >
          <Image source={icons.google} resizeMode="contain" className="h-5 w-5" />
          <Text className="text-[15px] font-JakartaSemiBold text-[#2B2722]">
            {loading === "google" ? "Connecting…" : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity
          onPress={handleAppleSignIn}
          disabled={!!loading}
          activeOpacity={0.82}
          accessibilityRole="button"
          className={`h-[52px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-[#E7DECF] bg-[#FBF7F0] ${
            loading && loading !== "apple" ? "opacity-60" : ""
          }`}
        >
          <Ionicons name="logo-apple" size={20} color={WARM.charcoal} />
          <Text className="text-[15px] font-JakartaSemiBold text-[#2B2722]">
            {loading === "apple" ? "Connecting…" : "Continue with Apple"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OAuth;