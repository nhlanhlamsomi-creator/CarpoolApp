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
      {/* Entry point — fades up from the splash, and there's nothing to go
          back to, so the swipe-back gesture is disabled here. */}
      <Stack.Screen
        name="welcome"
        options={{ animation: "fade", gestureEnabled: false }}
      />

      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
};

export default Layout;