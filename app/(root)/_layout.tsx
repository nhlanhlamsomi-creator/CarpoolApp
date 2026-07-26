import { Stack } from "expo-router";

// Matches the splash and the screen headers, so transitions never flash white
const GREEN_DEEP = "#06231A";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        contentStyle: { backgroundColor: GREEN_DEEP },
      }}
    >
      {/* ── Tabs ── */}
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />

      {/* ── Booking flow ── */}
      <Stack.Screen name="find-ride" />
      <Stack.Screen name="confirm-ride" />
      <Stack.Screen
        name="book-ride"
        // Payment is a commitment step, so a stray back-swipe shouldn't
        // drop out of it mid-flow
        options={{ gestureEnabled: false }}
      />

      {/* ── Profile ── */}
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="change-password" />

      {/* Legal is reference material rather than a step forward, so it slides
          up like a document being pulled out */}
      <Stack.Screen
        name="legal"
        options={{ animation: "slide_from_bottom", presentation: "modal" }}
      />
    </Stack>
  );
};

export default Layout;