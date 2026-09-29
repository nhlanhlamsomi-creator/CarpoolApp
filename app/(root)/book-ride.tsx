import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Payment from "@/components/Payment";
import { brand, ui } from "@/constants/theme";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore } from "@/store";

// ─── Palette ─────────────────────────────────────────────────────────────────
const PALETTE = {
  cream: ui.bg,
  sand: ui.surface,
  accent: brand.accent,
  accentDeep: brand.dark,
  accentSoft: brand.tint,
  charcoal: ui.ink,
  graphite: ui.muted,
  muted: ui.muted,
  line: ui.border,
};

const BookRide = () => {
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { drivers, selectedDriver } = useDriverStore();

  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];

  const driverName =
    driverDetails?.title ||
    `${driverDetails?.first_name ?? ""} ${driverDetails?.last_name ?? ""}`.trim() ||
    "Your driver";

  // ── Animations ─────────────────────────────────────────────────────────────
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  const driverCardFade = useRef(new Animated.Value(0)).current;
  const driverCardSlide = useRef(new Animated.Value(20)).current;

  const routeCardFade = useRef(new Animated.Value(0)).current;
  const routeCardSlide = useRef(new Animated.Value(24)).current;

  const badgePulse = useRef(new Animated.Value(1)).current;
  const fareGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 68,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(driverCardFade, {
        toValue: 1,
        duration: 460,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(driverCardSlide, {
        toValue: 0,
        tension: 62,
        friction: 11,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(routeCardFade, {
        toValue: 1,
        duration: 480,
        delay: 240,
        useNativeDriver: true,
      }),
      Animated.spring(routeCardSlide, {
        toValue: 0,
        tension: 62,
        friction: 11,
        delay: 240,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fareGlow, {
          toValue: 1.03,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(fareGlow, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.lyft"
      urlScheme="myapp"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.cream }}>
        <StatusBar barStyle="dark-content" backgroundColor={PALETTE.cream} />

        {/* Header */}
        <Animated.View
          style={{
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            style={{
              height: 42,
              width: 42,
              borderRadius: 14,
              backgroundColor: PALETTE.sand,
              borderWidth: 1,
              borderColor: PALETTE.line,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={20} color={PALETTE.charcoal} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Jakarta-Bold",
                color: PALETTE.muted,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Step 3 of 3
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 22,
                fontFamily: "Jakarta-ExtraBold",
                color: PALETTE.charcoal,
                letterSpacing: -0.5,
              }}
            >
              Confirm booking
            </Text>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        >
          {/* Driver card */}
          <Animated.View
            style={{
              opacity: driverCardFade,
              transform: [{ translateY: driverCardSlide }],
              alignItems: "center",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: PALETTE.line,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 24,
              shadowColor: PALETTE.charcoal,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.06,
              shadowRadius: 22,
              elevation: 5,
            }}
          >
            {/* Avatar + verified badge */}
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: driverDetails?.profile_image_url }}
                style={{
                  height: 96,
                  width: 96,
                  borderRadius: 48,
                  backgroundColor: PALETTE.sand,
                }}
              />

              <Animated.View
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  height: 28,
                  width: 28,
                  borderRadius: 14,
                  borderWidth: 3,
                  borderColor: "#FFFFFF",
                  backgroundColor: PALETTE.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: badgePulse }],
                  shadowColor: PALETTE.accentDeep,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons name="checkmark" size={13} color={PALETTE.charcoal} />
              </Animated.View>
            </View>

            <Text
              style={{
                marginTop: 16,
                fontSize: 19,
                fontFamily: "Jakarta-ExtraBold",
                color: PALETTE.charcoal,
                letterSpacing: -0.3,
              }}
            >
              {driverName}
            </Text>

            {/* Rating + seats */}
            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 999,
                  backgroundColor: PALETTE.accentSoft,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Ionicons name="star" size={12} color={PALETTE.accentDeep} />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Jakarta-Bold",
                    color: PALETTE.charcoal,
                  }}
                >
                  {driverDetails?.rating ?? "4.9"}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 999,
                  backgroundColor: PALETTE.cream,
                  borderWidth: 1,
                  borderColor: PALETTE.line,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Ionicons
                  name="people-outline"
                  size={12}
                  color={PALETTE.graphite}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Jakarta-Bold",
                    color: PALETTE.graphite,
                  }}
                >
                  {driverDetails?.car_seats ?? 0} seats
                </Text>
              </View>
            </View>

            {/* ── CAR DETAILS ── */}
            <View
              style={{
                marginTop: 16,
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                borderRadius: 20,
                backgroundColor: PALETTE.cream,
                borderWidth: 1,
                borderColor: PALETTE.line,
                padding: 14,
              }}
            >
              {/* Car image */}
              <View
                style={{
                  height: 56,
                  width: 56,
                  borderRadius: 16,
                  backgroundColor: PALETTE.sand,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {driverDetails?.car_image_url ? (
                  <Image
                    source={{ uri: driverDetails.car_image_url }}
                    style={{ height: "100%", width: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="car-sport"
                    size={26}
                    color={PALETTE.accentDeep}
                  />
                )}
              </View>

              {/* Model + plate */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Jakarta-Bold",
                    color: PALETTE.charcoal,
                  }}
                  numberOfLines={1}
                >
                  {driverDetails?.car_model ??
                    driverDetails?.car_type ??
                    "Vehicle"}
                </Text>

                <View
                  style={{
                    marginTop: 6,
                    alignSelf: "flex-start",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: PALETTE.line,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontFamily: "Jakarta-ExtraBold",
                      color: PALETTE.charcoal,
                      letterSpacing: 1.5,
                    }}
                  >
                    {driverDetails?.license_plate ??
                      driverDetails?.car_number ??
                      "— — —"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Fare breakdown */}
            <View
              style={{
                marginTop: 20,
                width: "100%",
                borderRadius: 20,
                backgroundColor: PALETTE.cream,
                borderWidth: 1,
                borderColor: PALETTE.line,
                padding: 16,
              }}
            >
              <View
                style={{
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Jakarta-Medium",
                    color: PALETTE.graphite,
                  }}
                >
                  Pickup in
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Jakarta-Bold",
                    color: PALETTE.charcoal,
                  }}
                >
                  {formatTime(driverDetails?.time ?? 0)}
                </Text>
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: PALETTE.line,
                  marginBottom: 12,
                }}
              />

              <Animated.View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transform: [{ scale: fareGlow }],
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Jakarta-Bold",
                    color: PALETTE.graphite,
                  }}
                >
                  Total fare
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: "Jakarta-ExtraBold",
                    color: PALETTE.accentDeep,
                    letterSpacing: -0.5,
                  }}
                >
                  R{driverDetails?.price ?? "0.00"}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Route card */}
          <Animated.View
            style={{
              opacity: routeCardFade,
              transform: [{ translateY: routeCardSlide }],
              marginTop: 16,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: PALETTE.line,
              backgroundColor: "#FFFFFF",
              padding: 20,
              shadowColor: PALETTE.charcoal,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.06,
              shadowRadius: 22,
              elevation: 5,
            }}
          >
            <Text
              style={{
                marginBottom: 16,
                fontSize: 11,
                fontFamily: "Jakarta-Bold",
                color: PALETTE.muted,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Your route
            </Text>

            <View style={{ flexDirection: "row" }}>
              <View
                style={{ marginRight: 12, alignItems: "center", paddingTop: 6 }}
              >
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor: PALETTE.accent,
                  }}
                />
                <View
                  style={{
                    width: 1.5,
                    flex: 1,
                    marginVertical: 6,
                    backgroundColor: PALETTE.line,
                  }}
                />
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 3,
                    backgroundColor: PALETTE.charcoal,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Jakarta-Bold",
                    color: PALETTE.muted,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  Pickup
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    marginBottom: 20,
                    fontSize: 14,
                    fontFamily: "Jakarta-SemiBold",
                    color: PALETTE.charcoal,
                  }}
                >
                  {userAddress ?? "—"}
                </Text>

                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Jakarta-Bold",
                    color: PALETTE.muted,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  Drop-off
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 14,
                    fontFamily: "Jakarta-SemiBold",
                    color: PALETTE.charcoal,
                  }}
                >
                  {destinationAddress ?? "—"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Stripe Payment — this is what shows the "Confirm Ride" button */}
          <Payment
            fullName={user?.fullName!}
            email={user?.emailAddresses[0].emailAddress!}
            amount={driverDetails?.price!}
            driverId={driverDetails?.id}
            rideTime={driverDetails?.trip_time ?? driverDetails?.time!}
          />
        </ScrollView>
      </SafeAreaView>
    </StripeProvider>
  );
};

export default BookRide;
