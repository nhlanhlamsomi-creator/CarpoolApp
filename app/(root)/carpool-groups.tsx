import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { brand, ui } from "@/constants/theme";
import { findCarpoolGroups, type PassengerLocation } from "@/services/kMeans";

const PASSENGERS: PassengerLocation[] = [
  { id: "p1", latitude: -25.7479, longitude: 28.2293 },
  { id: "p2", latitude: -25.75, longitude: 28.23 },
  { id: "p3", latitude: -25.76, longitude: 28.24 },
  { id: "p4", latitude: -25.77, longitude: 28.25 },
  { id: "p5", latitude: -25.771, longitude: 28.251 },
  { id: "p6", latitude: -25.742, longitude: 28.2205 },
];

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
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.cream }}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Title */}
        <View className="mt-6">
          <Text className="text-[12px] font-JakartaBold text-[#746A7E] tracking-widest uppercase">
            All clusters
          </Text>
          <Text className="mt-1 text-[24px] font-JakartaExtraBold text-[#21152F]">
            Carpool groups
          </Text>
        </View>

        {/* Summary pill */}
        <View className="mt-4 flex-row items-center gap-3 rounded-3xl border border-[#E9E2F0] bg-white p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F0E6FA]">
            <Text className="text-[15px] font-JakartaExtraBold text-[#5A189A]">
              {groups.length}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-JakartaSemiBold text-[#21152F]">
              {groups.length} cluster{groups.length === 1 ? "" : "s"} found
            </Text>
            <Text className="mt-0.5 text-[11.5px] font-Jakarta text-[#746A7E]">
              Capacity {vehicleCapacity} · pickup within 5 km
            </Text>
          </View>
        </View>

        {/* Vertical rows — badge on the left, details on the right */}
        {groups.map((group, index) => (
          <View
            key={`${group.clusterId}-${index}`}
            style={{
              marginTop: 16,
              flexDirection: "row",
              gap: 14,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: PALETTE.line,
              backgroundColor: "#FFFFFF",
              padding: 16,
              shadowColor: PALETTE.charcoal,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.05,
              shadowRadius: 14,
              elevation: 3,
            }}
          >
            {/* Left — square cluster badge */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: PALETTE.accentSoft,
                borderWidth: 1.5,
                borderColor: PALETTE.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Jakarta-ExtraBold",
                  color: PALETTE.accentDeep,
                  lineHeight: 26,
                }}
              >
                {index + 1}
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Jakarta-Bold",
                  color: PALETTE.accentDeep,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Cluster
              </Text>
            </View>

            {/* Right — details stacked vertically */}
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Jakarta-ExtraBold",
                    color: PALETTE.charcoal,
                  }}
                >
                  Cluster {index + 1}
                </Text>

                <View style={{ marginTop: 8, gap: 4 }}>
                  <Row label="Passengers" value={`${group.passengerCount}`} />
                  <Row
                    label="Pickup area"
                    value={`${group.pickupAreaRadiusKm.toFixed(1)} km radius`}
                  />
                  <Row
                    label="Centroid"
                    value={`${group.centroid.latitude.toFixed(
                      4,
                    )}, ${group.centroid.longitude.toFixed(4)}`}
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                style={{
                  marginTop: 12,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: PALETTE.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: PALETTE.accentDeep,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.28,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    color: PALETTE.charcoal,
                    fontSize: 13.5,
                    fontFamily: "Jakarta-Bold",
                    letterSpacing: 0.2,
                  }}
                >
                  View on map
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Empty state */}
        {groups.length === 0 && (
          <View
            style={{
              marginTop: 24,
              borderRadius: 24,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: PALETTE.accentSoft,
              backgroundColor: PALETTE.sand,
              padding: 24,
              alignItems: "center",
            }}
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F0E6FA]">
              <Text className="text-[20px]">🚗</Text>
            </View>
            <Text className="mt-3 text-[15px] font-JakartaBold text-[#21152F]">
              No passengers available
            </Text>
            <Text className="mt-1 text-center text-[12.5px] font-Jakarta text-[#746A7E]">
              Add valid latitude and longitude values to generate carpool
              groups.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text
        className="text-[11px] font-JakartaBold text-[#746A7E] tracking-widest uppercase"
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="flex-1 text-right text-[13px] font-JakartaSemiBold text-[#21152F]"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
