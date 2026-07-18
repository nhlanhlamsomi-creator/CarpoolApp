import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Map from "@/components/Map";
import { icons } from "@/constants";

const RideLayout = ({
  title,
  snapPoints,
  children,
}: {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <GestureHandlerRootView className="flex-1 bg-neutral-50">
      <View className="flex-1 bg-primary-500">
        <View className="relative h-72 rounded-b-[42px] bg-primary-500 px-5 pb-6 pt-16 shadow-lg shadow-primary-500/20">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white/95 rounded-2xl items-center justify-center shadow-sm shadow-black/10"
          >
            <Image
              source={icons.backArrow}
              resizeMode="contain"
              className="w-6 h-6"
            />
          </TouchableOpacity>

          <Text className="mt-4 text-2xl font-JakartaBold text-white">
            {title || "Go Back"}
          </Text>
        </View>

        <Map />
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["42%", "84%"]}
          index={0}
          backgroundStyle={{ backgroundColor: "#F8FAFC" }}
          handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
        >
          {title === "Choose a Rider" ? (
            <BottomSheetView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              style={{
                flex: 1,
                padding: 20,
              }}
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
