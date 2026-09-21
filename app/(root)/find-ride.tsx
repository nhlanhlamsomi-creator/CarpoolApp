import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import { useLocationStore } from "@/store";

// ─── Palette ─────────────────────────────────────────────────────────────────
const WARM = {
  cream:    "#FBF7F0",
  sand:     "#F4EDE1",
  gold:     "#F5B93C",
  goldDeep: "#E0A11E",
  goldSoft: "#FCEBC4",
  charcoal: "#2B2722",
  graphite: "#4A443D",
  muted:    "#9A928A",
  line:     "#E7DECF",
};

const formatDate = (d: Date) => {
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const FindRide = () => {
  const {
    userAddress,
    userLatitude,
    userLongitude,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  // ── GoogleTextInput expects `number | undefined`, store has `number | null`
  const biasLat = userLatitude ?? undefined;
  const biasLng = userLongitude ?? undefined;

  const [timeSlot, setTimeSlot] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const ready = Boolean(userAddress && destinationAddress);

  // ── Animations ─────────────────────────────────────────────────────────────
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  const cardFade  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(24)).current;

  const pickupPulse  = useRef(new Animated.Value(1)).current;
  const dropoffPulse = useRef(new Animated.Value(1)).current;

  const scheduleAnim = useRef(new Animated.Value(0)).current;
  const ctaScale     = useRef(new Animated.Value(1)).current;
  const toggleScale  = useRef(new Animated.Value(1)).current;
  const swapRotate   = useRef(new Animated.Value(0)).current;

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
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 460,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 62,
        friction: 11,
        delay: 120,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pickupPulse, {
          toValue: 1.6,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pickupPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(dropoffPulse, {
          toValue: 1.5,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dropoffPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(scheduleAnim, {
      toValue: timeSlot === "later" ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [timeSlot]);

  const scheduleHeight = scheduleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 84],
  });
  const scheduleOpacity = scheduleAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  // ── Picker handlers ────────────────────────────────────────────────────────
  const onDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event?.type === "dismissed") return;
    if (selected) {
      const next = new Date(scheduledDate);
      next.setFullYear(selected.getFullYear());
      next.setMonth(selected.getMonth());
      next.setDate(selected.getDate());
      setScheduledDate(next);
    }
  };

  const onTimeChange = (event: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (event?.type === "dismissed") return;
    if (selected) {
      const next = new Date(scheduledDate);
      next.setHours(selected.getHours());
      next.setMinutes(selected.getMinutes());
      setScheduledDate(next);
    }
  };

  const swap = () => {
    if (
      userAddress == null ||
      destinationAddress == null ||
      userLatitude == null ||
      userLongitude == null ||
      destinationLatitude == null ||
      destinationLongitude == null
    ) {
      return;
    }

    Animated.sequence([
      Animated.timing(swapRotate, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(swapRotate, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const pickup = {
      latitude: userLatitude,
      longitude: userLongitude,
      address: userAddress,
    };

    setUserLocation({
      latitude: destinationLatitude,
      longitude: destinationLongitude,
      address: destinationAddress,
    });
    setDestinationLocation(pickup);
  };

  const swapSpin = swapRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const onCtaPressIn = () =>
    Animated.spring(ctaScale, {
      toValue: 0.97,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();

  const onCtaPressOut = () =>
    Animated.spring(ctaScale, {
      toValue: 1,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();

  const onTogglePressIn = () =>
    Animated.spring(toggleScale, {
      toValue: 0.96,
      tension: 140,
      friction: 8,
      useNativeDriver: true,
    }).start();

  const onTogglePressOut = () =>
    Animated.spring(toggleScale, {
      toValue: 1,
      tension: 140,
      friction: 8,
      useNativeDriver: true,
    }).start();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WARM.cream }}>
      <StatusBar barStyle="dark-content" backgroundColor={WARM.cream} />

      {/* ── Header ── */}
      <Animated.View
        style={{
          opacity: headerFade,
          transform: [{ translateY: headerSlide }],
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{
            height: 42,
            width: 42,
            borderRadius: 14,
            backgroundColor: WARM.sand,
            borderWidth: 1,
            borderColor: WARM.line,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={20} color={WARM.charcoal} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Jakarta-Bold",
                color: WARM.goldDeep,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Step 1 of 3
            </Text>
            <View
              style={{ flexDirection: "row", gap: 3, marginLeft: 2 }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    height: 3,
                    width: i === 0 ? 14 : 8,
                    borderRadius: 2,
                    backgroundColor: i === 0 ? WARM.gold : WARM.line,
                  }}
                />
              ))}
            </View>
          </View>
          <Text
            style={{
              marginTop: 3,
              fontSize: 22,
              fontFamily: "Jakarta-ExtraBold",
              color: WARM.charcoal,
              letterSpacing: -0.5,
            }}
          >
            Find your ride
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        {/* ── Booking card ── */}
        <Animated.View
          style={{
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
            backgroundColor: "#FFFFFF",
            borderRadius: 28,
            borderWidth: 1,
            borderColor: WARM.line,
            padding: 20,
            shadowColor: WARM.charcoal,
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.07,
            shadowRadius: 28,
            elevation: 6,
          }}
        >
          {/* Pickup */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 9,
              }}
            >
              <View
                style={{
                  height: 12,
                  width: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Animated.View
                  style={{
                    position: "absolute",
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: WARM.gold,
                    opacity: 0.35,
                    transform: [{ scale: pickupPulse }],
                  }}
                />
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor: WARM.gold,
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Jakarta-Bold",
                  color: WARM.muted,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                }}
              >
                Pickup
              </Text>
            </View>

            <GoogleTextInput
              initialLocation={userAddress ?? "Your current location"}
              biasLat={biasLat}
              biasLng={biasLng}
              handlePress={(location) => setUserLocation(location)}
            />
          </View>

          {/* Swap */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
            }}
          >
            <View
              style={{
                marginLeft: 5,
                height: 36,
                width: 1.5,
                backgroundColor: WARM.line,
                borderStyle: "dashed",
              }}
            />
            <Animated.View
              style={{
                marginLeft: "auto",
                transform: [{ rotate: swapSpin }],
              }}
            >
              <TouchableOpacity
                onPress={swap}
                disabled={!ready}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Swap pickup and drop-off locations"
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: WARM.gold,
                  backgroundColor: WARM.cream,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: ready ? 1 : 0.4,
                  shadowColor: WARM.goldDeep,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Ionicons name="swap-vertical" size={17} color={WARM.goldDeep} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Drop-off */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 9,
              }}
            >
              <View
                style={{
                  height: 12,
                  width: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Animated.View
                  style={{
                    position: "absolute",
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: WARM.charcoal,
                    opacity: 0.25,
                    transform: [{ scale: dropoffPulse }],
                  }}
                />
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 3,
                    backgroundColor: WARM.charcoal,
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Jakarta-Bold",
                  color: WARM.muted,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                }}
              >
                Drop-off
              </Text>
            </View>

            <GoogleTextInput
              initialLocation={destinationAddress ?? "Where are you going?"}
              biasLat={biasLat}
              biasLng={biasLng}
              handlePress={(location) => setDestinationLocation(location)}
            />
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: WARM.line,
              marginTop: 18,
              marginBottom: 16,
            }}
          />

          {/* When — Now / Schedule */}
          <View>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Jakarta-Bold",
                color: WARM.muted,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                marginBottom: 9,
              }}
            >
              When
            </Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { key: "now" as const,   label: "Now",      icon: "flash-outline" as const },
                { key: "later" as const, label: "Schedule", icon: "time-outline"  as const },
              ].map((opt) => {
                const active = timeSlot === opt.key;
                return (
                  <Animated.View
                    key={opt.key}
                    style={{
                      flex: 1,
                      transform: [{ scale: active ? toggleScale : 1 }],
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setTimeSlot(opt.key)}
                      onPressIn={onTogglePressIn}
                      onPressOut={onTogglePressOut}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={{
                        height: 46,
                        borderRadius: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        backgroundColor: active ? WARM.goldSoft : WARM.cream,
                        borderWidth: 1.5,
                        borderColor: active ? WARM.gold : WARM.line,
                        shadowColor: active ? WARM.goldDeep : "transparent",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: active ? 0.2 : 0,
                        shadowRadius: 10,
                        elevation: active ? 3 : 0,
                      }}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={15}
                        color={active ? WARM.goldDeep : WARM.muted}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "Jakarta-SemiBold",
                          color: active ? WARM.charcoal : WARM.graphite,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            {/* Animated schedule panel */}
            <Animated.View
              style={{
                height: scheduleHeight,
                opacity: scheduleOpacity,
                overflow: "hidden",
              }}
            >
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                {/* Date chip */}
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Pickup date, ${formatDate(scheduledDate)}`}
                  style={{
                    flex: 1,
                    height: 54,
                    borderRadius: 14,
                    backgroundColor: WARM.cream,
                    borderWidth: 1.5,
                    borderColor: WARM.line,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      height: 30,
                      width: 30,
                      borderRadius: 10,
                      backgroundColor: WARM.goldSoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={15}
                      color={WARM.goldDeep}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 9.5,
                        fontFamily: "Jakarta-Bold",
                        color: WARM.muted,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Date
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Jakarta-SemiBold",
                        color: WARM.charcoal,
                        marginTop: 1,
                      }}
                      numberOfLines={1}
                    >
                      {formatDate(scheduledDate)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={WARM.muted}
                  />
                </TouchableOpacity>

                {/* Time chip */}
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Pickup time, ${formatTime(scheduledDate)}`}
                  style={{
                    flex: 1,
                    height: 54,
                    borderRadius: 14,
                    backgroundColor: WARM.cream,
                    borderWidth: 1.5,
                    borderColor: WARM.line,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      height: 30,
                      width: 30,
                      borderRadius: 10,
                      backgroundColor: WARM.goldSoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={15}
                      color={WARM.goldDeep}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 9.5,
                        fontFamily: "Jakarta-Bold",
                        color: WARM.muted,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Time
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Jakarta-SemiBold",
                        color: WARM.charcoal,
                        marginTop: 1,
                      }}
                      numberOfLines={1}
                    >
                      {formatTime(scheduledDate)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={WARM.muted}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* CTA */}
          <Animated.View
            style={{
              marginTop: 20,
              transform: [{ scale: ctaScale }],
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(root)/confirm-ride")}
              onPressIn={ready ? onCtaPressIn : undefined}
              onPressOut={ready ? onCtaPressOut : undefined}
              disabled={!ready}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel={ready ? "Find drivers" : "Set both locations to continue"}
              accessibilityState={{ disabled: !ready }}
              style={{
                height: 58,
                borderRadius: 20,
                backgroundColor: ready ? WARM.gold : WARM.goldSoft,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                borderWidth: 1.5,
                borderColor: ready ? WARM.goldDeep : WARM.gold,
                shadowColor: WARM.goldDeep,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: ready ? 0.35 : 0.1,
                shadowRadius: 18,
                elevation: ready ? 8 : 2,
                opacity: ready ? 1 : 0.6,
              }}
            >
              <Text
                style={{
                  color: WARM.charcoal,
                  fontSize: 16,
                  fontFamily: "Jakarta-Bold",
                  letterSpacing: 0.2,
                  opacity: ready ? 1 : 0.65,
                }}
              >
                {ready ? "Find drivers" : "Set both locations"}
              </Text>
              {ready && (
                <View
                  style={{
                    height: 26,
                    width: 26,
                    borderRadius: 13,
                    backgroundColor: "rgba(255,255,255,0.55)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={WARM.charcoal}
                  />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── Helper hint ── */}
        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingHorizontal: 12,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={WARM.muted}
          />
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Jakarta-Medium",
              color: WARM.muted,
              textAlign: "center",
            }}
          >
            Set both locations to find drivers on your route
          </Text>
        </View>
      </ScrollView>

      {/* ═══ ANDROID PICKERS ═══ */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* ═══ iOS PICKERS ═══ */}
      {Platform.OS === "ios" && (
        <>
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(43,39,34,0.35)",
                justifyContent: "flex-end",
              }}
              onPress={() => setShowDatePicker(false)}
            >
              <Pressable
                style={{
                  backgroundColor: "#FFFFFF",
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 28,
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <View
                  style={{
                    alignSelf: "center",
                    height: 4,
                    width: 42,
                    borderRadius: 2,
                    backgroundColor: WARM.line,
                    marginBottom: 14,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Jakarta-ExtraBold",
                      color: WARM.charcoal,
                    }}
                  >
                    Pick a date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    activeOpacity={0.75}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: WARM.gold,
                      borderWidth: 1,
                      borderColor: WARM.goldDeep,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Jakarta-Bold",
                        color: WARM.charcoal,
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={scheduledDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={onDateChange}
                  themeVariant="light"
                />
              </Pressable>
            </Pressable>
          </Modal>

          <Modal
            visible={showTimePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(43,39,34,0.35)",
                justifyContent: "flex-end",
              }}
              onPress={() => setShowTimePicker(false)}
            >
              <Pressable
                style={{
                  backgroundColor: "#FFFFFF",
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 28,
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <View
                  style={{
                    alignSelf: "center",
                    height: 4,
                    width: 42,
                    borderRadius: 2,
                    backgroundColor: WARM.line,
                    marginBottom: 14,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Jakarta-ExtraBold",
                      color: WARM.charcoal,
                    }}
                  >
                    Pick a time
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(false)}
                    activeOpacity={0.75}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: WARM.gold,
                      borderWidth: 1,
                      borderColor: WARM.goldDeep,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Jakarta-Bold",
                        color: WARM.charcoal,
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={scheduledDate}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                  themeVariant="light"
                />
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

export default FindRide;