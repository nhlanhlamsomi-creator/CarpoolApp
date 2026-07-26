import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Map from "@/components/Map";

type Props = {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
  /**
   * How the sheet holds its content:
   *  - "scroll" (default) — wraps children in BottomSheetScrollView
   *  - "view"             — fixed height, no scrolling
   *  - "list"             — renders children raw, so the screen can supply its
   *                         own BottomSheetFlatList. Use this whenever the
   *                         content is a list, or React Native warns about
   *                         VirtualizedLists nested in a ScrollView.
   */
  mode?: "scroll" | "view" | "list";
  /** @deprecated use `mode` instead. Kept so old call sites still work. */
  scrollable?: boolean;
  subtitle?: string;
};

const RideLayout = ({
  title,
  snapPoints,
  children,
  mode,
  scrollable,
  subtitle,
}: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  // Backwards compatible: honour `scrollable` if it was passed, otherwise the
  // old title-string behaviour.
  const resolvedMode: "scroll" | "view" | "list" =
    mode ??
    (scrollable === false || title === "Choose a Rider" ? "view" : "scroll");

  const padding = {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: insets.bottom + 32,
  };

  return (
    <GestureHandlerRootView className="flex-1 bg-[#06231A]">
      <View className="flex-1">
        {/* Full-screen map */}
        <Map />

        {/* Floating header — sits below the notch on every device */}
        <View
          className="absolute left-5 right-5 z-50 flex-row items-center"
          style={{ top: insets.top + 8 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/20"
          >
            <Ionicons name="chevron-back" size={21} color="#101814" />
          </TouchableOpacity>

          <View className="ml-3 flex-shrink rounded-2xl bg-white px-4 py-2.5 shadow-lg shadow-black/20">
            <Text
              className="text-[15px] font-JakartaBold text-[#101814]"
              numberOfLines={1}
            >
              {title}
            </Text>
            {!!subtitle && (
              <Text className="mt-0.5 text-[11.5px] font-Jakarta text-[#68756F]">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Bottom sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints ?? ["42%", "84%"]}
          index={0}
          enablePanDownToClose={false}
          backgroundStyle={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
          handleIndicatorStyle={{
            backgroundColor: "#DFE6E2",
            width: 44,
            height: 4,
          }}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {resolvedMode === "list" ? (
            // Raw — the screen provides its own BottomSheetFlatList
            children
          ) : resolvedMode === "view" ? (
            <BottomSheetView style={{ flex: 1, ...padding }}>
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              contentContainerStyle={padding}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;