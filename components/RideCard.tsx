import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

const STATUS: Record<string, { bg: string; text: string }> = {
  paid: { bg: "bg-[#E6F2EC]", text: "text-[#0E5C3F]" },
  pending: { bg: "bg-[#FDF4E3]", text: "text-[#8A6100]" },
  failed: { bg: "bg-[#FEF3F3]", text: "text-[#B02A2A]" },
  refunded: { bg: "bg-[#EEF1F0]", text: "text-[#68756F]" },
};

type Props = {
  ride: Ride;
  /** Upcoming trips get contact actions; finished ones get rebook and report. */
  variant?: "upcoming" | "completed";
  onMessage?: () => void;
  onCall?: () => void;
  onCancel?: () => void;
  onRebook?: () => void;
  onReport?: () => void;
};

// ─── Action button ───────────────────────────────────────────────────────────

const Action = ({
  icon,
  label,
  onPress,
  tone = "default",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  tone?: "default" | "primary" | "danger";
}) => {
  const styles =
    tone === "primary"
      ? { box: "bg-[#0E5C3F]", text: "text-white", icon: "#FFFFFF" }
      : tone === "danger"
        ? { box: "bg-[#FEF3F3]", text: "text-[#B02A2A]", icon: "#B02A2A" }
        : { box: "bg-[#F5F8F6]", text: "text-[#4A5450]", icon: "#4A5450" };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3 ${styles.box} ${
        onPress ? "active:opacity-75" : "opacity-40"
      }`}
    >
      <Ionicons name={icon} size={15} color={styles.icon} />
      <Text className={`text-[12.5px] font-JakartaBold ${styles.text}`}>
        {label}
      </Text>
    </Pressable>
  );
};

// ─── Card ────────────────────────────────────────────────────────────────────

const RideCard = ({
  ride,
  variant = "completed",
  onMessage,
  onCall,
  onCancel,
  onRebook,
  onReport,
}: Props) => {
  const status = STATUS[ride.payment_status] ?? STATUS.pending;
  const driverName = ride.driver
    ? `${ride.driver.first_name ?? ""} ${ride.driver.last_name ?? ""}`.trim()
    : "Driver unavailable";

  const upcoming = variant === "upcoming";

  // ride_time is a timestamp, not a number of minutes — the duration lives in
  // duration_minutes. Older rows may have neither.
  const duration = (ride as any).duration_minutes ?? null;
  const whenDate = (ride as any).scheduled_for ?? ride.created_at;

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-[#E2E9E5] bg-white">
      {/* Map preview */}
      <View className="relative">
        <Image
          source={{
            uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
          }}
          className="h-32 w-full bg-[#EEF1F0]"
        />

        {upcoming ? (
          <View className="absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full bg-[#0E5C3F] px-3 py-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-[#6FEFB4]" />
            <Text className="text-[11px] font-JakartaBold text-white">
              Upcoming
            </Text>
          </View>
        ) : null}

        <View className={`absolute right-3 top-3 rounded-full px-3 py-1.5 ${status.bg}`}>
          <Text className={`text-[11px] font-JakartaBold capitalize ${status.text}`}>
            {ride.payment_status}
          </Text>
        </View>
      </View>

      <View className="p-4">
        {/* Route */}
        <View className="flex-row">
          <View className="mr-3 items-center pt-1.5">
            <View className="h-2.5 w-2.5 rounded-full bg-[#1FB574]" />
            <View className="my-1 w-[1.5px] flex-1 bg-[#E2E9E5]" />
            <View className="h-2.5 w-2.5 rounded-[3px] bg-[#0E5C3F]" />
          </View>

          <View className="flex-1">
            <Text
              className="text-[13.5px] font-JakartaSemiBold text-[#101814]"
              numberOfLines={1}
            >
              {ride.origin_address}
            </Text>
            <Text className="mb-3 mt-0.5 text-[11px] font-Jakarta text-[#9BA6A1]">
              Pickup
            </Text>

            <Text
              className="text-[13.5px] font-JakartaSemiBold text-[#101814]"
              numberOfLines={1}
            >
              {ride.destination_address}
            </Text>
            <Text className="mt-0.5 text-[11px] font-Jakarta text-[#9BA6A1]">
              Drop-off
            </Text>
          </View>
        </View>

        {/* Facts strip — duration is what people actually want to know */}
        <View className="mt-4 flex-row items-center justify-around rounded-2xl bg-[#F5F8F6] py-3">
          <View className="items-center">
            <Ionicons name="time-outline" size={15} color="#0E5C3F" />
            <Text className="mt-1 text-[12.5px] font-JakartaBold text-[#101814]">
              {duration != null ? formatTime(duration) : "—"}
            </Text>
            <Text className="text-[10px] font-Jakarta text-[#9BA6A1]">
              Duration
            </Text>
          </View>

          <View className="h-8 w-[1px] bg-[#E2E9E5]" />

          <View className="items-center">
            <Ionicons name="calendar-outline" size={15} color="#0E5C3F" />
            <Text className="mt-1 text-[12.5px] font-JakartaBold text-[#101814]">
              {formatDate(whenDate)}
            </Text>
            <Text className="text-[10px] font-Jakarta text-[#9BA6A1]">
              {upcoming ? "Departs" : "Travelled"}
            </Text>
          </View>

          <View className="h-8 w-[1px] bg-[#E2E9E5]" />

          <View className="items-center">
            <Ionicons name="wallet-outline" size={15} color="#0E5C3F" />
            <Text className="mt-1 text-[12.5px] font-JakartaBold text-[#101814]">
              R{((ride.fare_price ?? 0) / 100).toFixed(2)}
            </Text>
            <Text className="text-[10px] font-Jakarta text-[#9BA6A1]">Fare</Text>
          </View>
        </View>

        {/* Driver */}
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E6F2EC]">
              <Ionicons name="person" size={16} color="#0E5C3F" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-JakartaBold text-[#101814]">
                {driverName}
              </Text>
              <Text className="text-[11px] font-Jakarta text-[#68756F]">
                {ride.driver?.car_seats ?? "—"} seats
              </Text>
            </View>
          </View>

          {!upcoming && !!onReport && (
            <Pressable
              onPress={onReport}
              hitSlop={8}
              accessibilityLabel="Report a problem with this trip"
              className="h-9 w-9 items-center justify-center rounded-full bg-[#F5F8F6] active:opacity-70"
            >
              <Ionicons name="flag-outline" size={15} color="#68756F" />
            </Pressable>
          )}
        </View>

        {/* Actions */}
        <View className="mt-4 flex-row gap-2">
          {upcoming ? (
            <>
              <Action
                icon="chatbubble-ellipses-outline"
                label="Message"
                onPress={onMessage}
                tone="primary"
              />
              <Action icon="call-outline" label="Call" onPress={onCall} />
              <Action
                icon="close-circle-outline"
                label="Cancel"
                onPress={onCancel}
                tone="danger"
              />
            </>
          ) : (
            <>
              <Action
                icon="repeat-outline"
                label="Book again"
                onPress={onRebook}
                tone="primary"
              />
              <Action
                icon="chatbubble-ellipses-outline"
                label="Message"
                onPress={onMessage}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default RideCard;