import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { findCarpoolGroups, type PassengerLocation } from "@/services/kMeans";

const PASSENGERS: PassengerLocation[] = [
  { id: "p1", latitude: -25.7479, longitude: 28.2293 },
  { id: "p2", latitude: -25.75, longitude: 28.23 },
  { id: "p3", latitude: -25.76, longitude: 28.24 },
  { id: "p4", latitude: -25.77, longitude: 28.25 },
  { id: "p5", latitude: -25.771, longitude: 28.251 },
  { id: "p6", latitude: -25.742, longitude: 28.2205 },
];

const GREEN_DEEP = "#06231A";
const GREEN_PRIMARY = "#0E5C3F";
const GREEN_MID = "#12724F";
const GREEN_LIME = "#1FB574";
const GREEN_SOFT = "#6FEFB4";
const OFF_WHITE = "#E6F2EC";

export default function CarpoolGroupsScreen() {
  const [vehicleCapacity] = useState(4);

  const groups = useMemo(
    () =>
      findCarpoolGroups(PASSENGERS, vehicleCapacity, {
        k: 3,
        maxIterations: 25,
        maxPickupDistanceKm: 5,
      }),
    [vehicleCapacity],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-[24px] font-JakartaExtraBold text-[#101814]">
            Carpool groups
          </Text>
        </View>

        <View className="mt-5 rounded-3xl border border-[#E2E9E5] bg-white p-4">
          <Text className="text-[13px] font-Jakarta text-[#68756F]">
            Vehicle capacity: {vehicleCapacity} passengers
          </Text>
          <Text className="mt-1 text-[13px] font-Jakarta text-[#68756F]">
            Pickup limit: 5 km
          </Text>
        </View>

        {groups.map((group, index) => (
          <View
            key={`${group.clusterId}-${index}`}
            className="mt-5 rounded-3xl border border-[#E2E9E5] bg-white p-4"
          >
            <Text className="text-[18px] font-JakartaExtraBold text-[#101814]">
              Cluster {index + 1}
            </Text>

            <Text className="mt-2 text-[14px] font-Jakarta text-[#1C2C27]">
              {group.passengerCount} passengers
            </Text>

            <Text className="mt-1 text-[13px] font-Jakarta text-[#68756F]">
              Pickup area: {group.pickupAreaRadiusKm.toFixed(1)} km radius
            </Text>

            <Text className="mt-1 text-[12px] font-Jakarta text-[#68756F]">
              Centroid: {group.centroid.latitude.toFixed(4)}, {group.centroid.longitude.toFixed(4)}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                backgroundColor: GREEN_PRIMARY,
                borderRadius: 16,
                marginTop: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontFamily: "Jakarta-Bold", textAlign: "center" }}>
                View on Map
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {groups.length === 0 && (
          <View className="mt-6 items-center rounded-3xl border border-dashed border-[#CDE3D9] bg-[#F2F8F4] p-6">
            <Text className="text-[15px] font-JakartaSemiBold text-[#101814]">
              No passengers available
            </Text>
            <Text className="mt-1 text-[12px] font-Jakarta text-[#68756F]">
              Add valid latitude and longitude values to generate carpool groups.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
