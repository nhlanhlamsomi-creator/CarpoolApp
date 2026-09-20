import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { OfferTrip } from "@/types/type";

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
    <View
      style={{
        marginBottom: 12,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: WARM.line,
        backgroundColor: "#FFFFFF",
        padding: 16,
        shadowColor: WARM.charcoal,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
      }}
    >
      {/* ── Header: from/to + price ── */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          {/* From */}
          <View style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                height: 26,
                width: 26,
                borderRadius: 9,
                backgroundColor: WARM.goldSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="navigate-outline" size={14} color={WARM.goldDeep} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: "Jakarta-Bold",
                color: WARM.charcoal,
              }}
              numberOfLines={1}
            >
              {trip.leaving_from}
            </Text>
          </View>

          {/* To */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                height: 26,
                width: 26,
                borderRadius: 9,
                backgroundColor: WARM.cream,
                borderWidth: 1,
                borderColor: WARM.line,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="location-outline" size={14} color={WARM.graphite} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: "Jakarta-Bold",
                color: WARM.charcoal,
              }}
              numberOfLines={1}
            >
              {trip.going_to}
            </Text>
          </View>
        </View>

        {/* Price chip */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: WARM.goldSoft,
            borderWidth: 1,
            borderColor: WARM.gold,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Jakarta-ExtraBold",
              color: WARM.goldDeep,
              letterSpacing: -0.2,
            }}
          >
            R{Number(trip.price_per_seat).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* ── Meta row: date · seats · driver ── */}
      <View
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: WARM.line,
          flexDirection: "row",
          flexWrap: "wrap",
          columnGap: 16,
          rowGap: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={WARM.muted} />
          <Text style={{ fontSize: 11.5, fontFamily: "Jakarta", color: WARM.graphite }}>
            {formatDeparture(trip.departure_date, trip.departure_time)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="people-outline" size={14} color={WARM.muted} />
          <Text style={{ fontSize: 11.5, fontFamily: "Jakarta", color: WARM.graphite }}>
            {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
          </Text>
        </View>

        {driverName && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="person-outline" size={14} color={WARM.muted} />
            <Text style={{ fontSize: 11.5, fontFamily: "Jakarta", color: WARM.graphite }}>
              {driverName}
            </Text>
          </View>
        )}
      </View>

      {/* ── Book ride button — GOLD ── */}
      <Pressable
        onPress={onBook}
        disabled={booking}
        accessibilityRole="button"
        accessibilityLabel={`Book ride from ${trip.leaving_from} to ${trip.going_to}`}
        style={{
          marginTop: 16,
          height: 48,
          borderRadius: 16,
          backgroundColor: booking ? WARM.goldSoft : WARM.gold,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderWidth: 1.5,
          borderColor: booking ? WARM.gold : WARM.goldDeep,
          shadowColor: WARM.goldDeep,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: booking ? 0.1 : 0.3,
          shadowRadius: 14,
          elevation: booking ? 2 : 6,
          opacity: booking ? 0.65 : 1,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Jakarta-Bold",
            color: WARM.charcoal,
            letterSpacing: 0.2,
            opacity: booking ? 0.65 : 1,
          }}
        >
          {booking ? "Booking…" : "Book ride"}
        </Text>

        {!booking && (
          <View
            style={{
              height: 22,
              width: 22,
              borderRadius: 11,
              backgroundColor: "rgba(255,255,255,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-forward" size={13} color={WARM.charcoal} />
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default OfferTripCard;