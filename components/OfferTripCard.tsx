import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { OfferTrip } from "@/types/type";

// ─── Palette (dark green / black / white) ────────────────────────────────────
const THEME = {
  primary: "#0A3B2E", // book button, price text
  primaryDeep: "#14523F", // button border
  accent: "#1FA574", // icon tint, price chip border
  tint: "#E4EFEA", // pale green surfaces
  surface: "#F4F6F5", // secondary icon box
  ink: "#101814", // primary text
  graphite: "#7A8580", // secondary text
  muted: "#7A8580", // captions and meta icons
  line: "#E3E7E5", // borders and dividers
  onPrimary: "#FFFFFF", // text/icons on primary fill
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
        borderColor: THEME.line,
        backgroundColor: "#FFFFFF",
        padding: 16,
        shadowColor: THEME.ink,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
      }}
    >
      {/* ── Header: from/to + price ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          {/* From */}
          <View
            style={{
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                height: 26,
                width: 26,
                borderRadius: 9,
                backgroundColor: THEME.tint,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="navigate-outline"
                size={14}
                color={THEME.primary}
              />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: "Jakarta-Bold",
                color: THEME.ink,
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
                backgroundColor: THEME.surface,
                borderWidth: 1,
                borderColor: THEME.line,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={THEME.graphite}
              />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: "Jakarta-Bold",
                color: THEME.ink,
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
            backgroundColor: THEME.tint,
            borderWidth: 1,
            borderColor: THEME.accent,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Jakarta-ExtraBold",
              color: THEME.primary,
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
          borderTopColor: THEME.line,
          flexDirection: "row",
          flexWrap: "wrap",
          columnGap: 16,
          rowGap: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={THEME.muted} />
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: "Jakarta",
              color: THEME.graphite,
            }}
          >
            {formatDeparture(trip.departure_date, trip.departure_time)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="people-outline" size={14} color={THEME.muted} />
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: "Jakarta",
              color: THEME.graphite,
            }}
          >
            {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
          </Text>
        </View>

        {driverName && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="person-outline" size={14} color={THEME.muted} />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: "Jakarta",
                color: THEME.graphite,
              }}
            >
              {driverName}
            </Text>
          </View>
        )}
      </View>

      {/* ── Book ride button ── */}
      <Pressable
        onPress={onBook}
        disabled={booking}
        accessibilityRole="button"
        accessibilityLabel={`Book ride from ${trip.leaving_from} to ${trip.going_to}`}
        style={{
          marginTop: 16,
          height: 48,
          borderRadius: 16,
          backgroundColor: booking ? THEME.tint : THEME.primary,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderWidth: 1.5,
          borderColor: booking ? THEME.accent : THEME.primaryDeep,
          shadowColor: THEME.primary,
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
            color: booking ? THEME.primary : THEME.onPrimary,
            letterSpacing: 0.2,
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
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-forward" size={13} color={THEME.onPrimary} />
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default OfferTripCard;
