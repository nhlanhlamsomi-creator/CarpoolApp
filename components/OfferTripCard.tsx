import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { OfferTrip } from "@/types/type";

const formatDeparture = (date: string, time: string) => {
  const parsed = new Date(`${date}T${time}`);

  if (Number.isNaN(parsed.getTime())) {
    return `${date} at ${time.slice(0, 5)}`;
  }

  return `${parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })} at ${parsed.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
};

const OfferTripCard = ({
  trip,
  onBook,
  booking,
}: {
  trip: OfferTrip;
  onBook: () => void;
  booking: boolean;
}) => {
  const driverName = [trip.drivers?.first_name, trip.drivers?.last_name]
    .filter(Boolean)
    .join(" ");
  const seatsLeft = Math.max(0, trip.seats_available - trip.seats_booked);

  return (
    <View className="mb-3 rounded-2xl border border-[#E2E9E5] bg-white p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="mb-2 flex-row items-center gap-2">
            <Ionicons name="navigate-outline" size={16} color="#0E5C3F" />
            <Text
              className="flex-1 text-[15px] font-JakartaBold text-[#101814]"
              numberOfLines={1}
            >
              {trip.leaving_from}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="location-outline" size={16} color="#0E5C3F" />
            <Text
              className="flex-1 text-[15px] font-JakartaBold text-[#101814]"
              numberOfLines={1}
            >
              {trip.going_to}
            </Text>
          </View>
        </View>

        <Text className="text-[16px] font-JakartaExtraBold text-[#0E5C3F]">
          R{Number(trip.price_per_seat).toFixed(2)}
        </Text>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E2E9E5] pt-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={14} color="#68756F" />
          <Text className="text-[11.5px] font-Jakarta text-[#68756F]">
            {formatDeparture(trip.departure_date, trip.departure_time)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="people-outline" size={14} color="#68756F" />
          <Text className="text-[11.5px] font-Jakarta text-[#68756F]">
            {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
          </Text>
        </View>
        {driverName && (
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="person-outline" size={14} color="#68756F" />
            <Text className="text-[11.5px] font-Jakarta text-[#68756F]">
              {driverName}
            </Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={onBook}
        disabled={booking}
        accessibilityRole="button"
        accessibilityLabel={`Book ride from ${trip.leaving_from} to ${trip.going_to}`}
        className={`mt-4 items-center rounded-xl bg-[#0E5C3F] py-3 ${booking ? "opacity-60" : "active:opacity-80"}`}
      >
        <Text className="text-[13px] font-JakartaBold text-white">
          {booking ? "Booking..." : "Book ride"}
        </Text>
      </Pressable>
    </View>
  );
};

export default OfferTripCard;