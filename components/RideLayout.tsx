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
    <GestureHandlerRootView className="flex-1 bg-white">
      <View className="flex-1">

        {/* Full-screen Map */}
        <Map />

        {/* Floating Header */}
        <View className="absolute top-14 left-5 right-5 flex-row items-center z-50">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-md"
          >
            <Image
              source={icons.backArrow}
              resizeMode="contain"
              className="w-6 h-6"
            />
          </TouchableOpacity>

          <View className="ml-4 bg-white rounded-full px-4 py-2 shadow-md">
            <Text className="text-lg font-JakartaBold text-neutral-900">
              {title}
            </Text>
          </View>
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints ?? ["42%", "84%"]}
          index={0}
          backgroundStyle={{
            backgroundColor: "#F8FAFC",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
          handleIndicatorStyle={{
            backgroundColor: "#CBD5E1",
            width: 70,
          }}
        >
          {title === "Choose a Rider" ? (
            <BottomSheetView
              style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 30,
              }}
            >
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 40,
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