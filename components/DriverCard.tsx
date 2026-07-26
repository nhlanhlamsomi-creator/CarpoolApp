import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { formatTime } from "@/lib/utils";
import { DriverCardProps } from "@/types/type";

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  const isSelected = selected === item.id;
  const rating = Number(item.rating ?? 0);

  return (
    <TouchableOpacity
      onPress={setSelected}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={`mb-3 flex-row items-center rounded-3xl border-[1.5px] p-3.5 ${
        isSelected
          ? "border-[#0E5C3F] bg-[#E6F2EC]"
          : "border-[#E2E9E5] bg-white"
      }`}
    >
      {/* Avatar + verified tick */}
      <View className="relative">
        <Image
          source={{ uri: item.profile_image_url }}
          className="h-14 w-14 rounded-2xl bg-[#EEF1F0]"
        />
        <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#1FB574]">
          <Ionicons name="checkmark" size={11} color="#fff" />
        </View>
      </View>

      {/* Details */}
      <View className="mx-3 flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="flex-shrink text-[15px] font-JakartaBold text-[#101814]"
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View className="flex-row items-center gap-0.5 rounded-full bg-[#F5F8F6] px-2 py-0.5">
            <Ionicons name="star" size={11} color="#E3A008" />
            <Text className="text-[11px] font-JakartaBold text-[#4A5450]">
              {rating > 0 ? rating.toFixed(1) : "New"}
            </Text>
          </View>
        </View>

        {/* Meta chips — spaced, not pipe-separated */}
        <View className="mt-2 flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color="#68756F" />
            <Text className="text-xs font-JakartaMedium text-[#68756F]">
              {formatTime(item.time!)}
            </Text>
          </View>

          <View className="h-3 w-[1px] bg-[#E2E9E5]" />

          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={13} color="#68756F" />
            <Text className="text-xs font-JakartaMedium text-[#68756F]">
              {item.car_seats} seats
            </Text>
          </View>
        </View>
      </View>

      {/* Price + car */}
      <View className="items-end">
        <Text className="text-[17px] font-JakartaExtraBold text-[#0E5C3F]">
          R{item.price}
        </Text>
        <Image
          source={{ uri: item.car_image_url }}
          className="mt-1 h-9 w-14"
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default DriverCard;