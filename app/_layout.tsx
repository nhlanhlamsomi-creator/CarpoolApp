import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { LogBox, View } from "react-native";
import "react-native-reanimated";
import "../global.css";

import AnimatedSplash from "@/components/AnimatedSplash";
import { tokenCache } from "@/lib/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
// The catch matters: in Expo Go and after a Fast Refresh there may be no native
// splash registered, and the rejected promise surfaces as a red-box error.
SplashScreen.preventAutoHideAsync().catch(() => {});

const rawPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const publishableKey = rawPublishableKey.trim();
const hasValidClerkKey = /^pk_(test|live)_[A-Za-z0-9]+$/.test(publishableKey);

if (!publishableKey) {
  console.warn(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. The app will render a safe fallback until the value is configured.",
  );
} else if (!hasValidClerkKey) {
  console.warn(
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not a valid Clerk publishable key. The app will skip Clerk until the real key is configured.",
  );
}

LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // Tracks whether the animated splash has played out and faded away
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (loaded) {
      // Hand off from the native splash to ours. Both use the same green
      // background, so there's no visible seam.
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const content = hasValidClerkKey ? (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(root)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  ) : (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }} />
  );

  return (
    <View style={{ flex: 1 }}>
      {content}

      {/* Sits above everything, including Clerk's own loading gap, then lifts */}
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </View>
  );
}