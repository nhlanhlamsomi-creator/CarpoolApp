import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/Cards";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { brand, ui } from "@/constants/theme";
import { useDriverStore } from "@/store";

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

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const insets = useSafeAreaInsets();

  const listData = Array.isArray(drivers) ? drivers : [];
  const hasSelection = selectedDriver != null;

  // ── Animations ─────────────────────────────────────────────────────────────
  // Footer slide-in when a driver is picked
  const footerFade = useRef(new Animated.Value(0)).current;
  const footerSlide = useRef(new Animated.Value(16)).current;

  // CTA press feedback
  const ctaScale = useRef(new Animated.Value(1)).current;

  // Small status pulse dot in the header
  const statusPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Status pulse loop — a gentle "searching nearby" beat
    Animated.loop(
      Animated.sequence([
        Animated.timing(statusPulse, {
          toValue: 1.6,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(statusPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Fade the footer CTA in whenever a selection is made (or clears)
  useEffect(() => {
    Animated.parallel([
      Animated.timing(footerFade, {
        toValue: hasSelection ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(footerSlide, {
        toValue: hasSelection ? 0 : 16,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hasSelection]);

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

  return (
    <RideLayout
      title="Choose a driver"
      subtitle={
        listData.length > 0
          ? `${listData.length} available nearby`
          : "Searching nearby"
      }
      snapPoints={["65%", "88%"]}
      mode="list"
    >
      {/* ── Status strip — reads as a live "searching" indicator ── */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 4,
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: PALETTE.cream,
          borderWidth: 1,
          borderColor: PALETTE.line,
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 10,
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
              backgroundColor:
                listData.length > 0 ? PALETTE.accent : PALETTE.muted,
              opacity: 0.3,
              transform: [{ scale: statusPulse }],
            }}
          />
          <View
            style={{
              height: 8,
              width: 8,
              borderRadius: 4,
              backgroundColor:
                listData.length > 0 ? PALETTE.accent : PALETTE.muted,
            }}
          />
        </View>

        <Text
          style={{
            flex: 1,
            fontSize: 12,
            fontFamily: "Jakarta-SemiBold",
            color: PALETTE.graphite,
          }}
          numberOfLines={1}
        >
          {listData.length > 0
            ? "Live · drivers are moving"
            : "Live · looking for nearby drivers"}
        </Text>

        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: PALETTE.accentSoft,
          }}
        >
          <Text
            style={{
              fontSize: 10.5,
              fontFamily: "Jakarta-Bold",
              color: PALETTE.accentDeep,
              letterSpacing: 1,
            }}
          >
            {listData.length > 0 ? `${listData.length}` : "—"}
          </Text>
        </View>
      </View>

      <BottomSheetFlatList
        data={listData}
        keyExtractor={(item: any, index: number) => `${item.id ?? index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: insets.bottom + 32,
        }}
        renderItem={({ item }: any) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No drivers on this route yet"
            message="Nobody is heading your way right now. Try a nearby pickup point or check again shortly."
            actionLabel="Change locations"
            onAction={() => router.back()}
          />
        }
        ListFooterComponent={
          listData.length > 0 ? (
            <Animated.View
              style={{
                marginTop: 22,
                opacity: hasSelection ? footerFade : 1,
                transform: [
                  { translateY: hasSelection ? footerSlide : 0 },
                  { scale: ctaScale },
                ],
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(root)/book-ride")}
                onPressIn={hasSelection ? onCtaPressIn : undefined}
                onPressOut={hasSelection ? onCtaPressOut : undefined}
                disabled={!hasSelection}
                activeOpacity={1}
                style={{
                  height: 58,
                  borderRadius: 20,
                  backgroundColor: hasSelection ? PALETTE.accent : PALETTE.sand,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderWidth: 1,
                  borderColor: hasSelection ? PALETTE.accentDeep : PALETTE.line,
                  shadowColor: PALETTE.accentDeep,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: hasSelection ? 0.35 : 0,
                  shadowRadius: 18,
                  elevation: hasSelection ? 8 : 0,
                }}
              >
                <Text
                  style={{
                    color: hasSelection ? PALETTE.charcoal : PALETTE.muted,
                    fontSize: 16,
                    fontFamily: "Jakarta-Bold",
                    letterSpacing: 0.2,
                  }}
                >
                  {hasSelection ? "Continue to booking" : "Select a driver"}
                </Text>
                {hasSelection && (
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
                      color={PALETTE.charcoal}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ) : null
        }
      />
    </RideLayout>
  );
};

export default ConfirmRide;
