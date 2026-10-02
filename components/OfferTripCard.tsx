import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { brand, ui } from "@/constants/theme";
import { OfferTrip } from "@/types/type";

const THEME = {
  card: ui.surface,
  border: ui.border,
  line: ui.border,
  pill: brand.tint,
  pillSoft: ui.bg,
  accent: brand.accent,
  ink: ui.ink,
  muted: ui.muted,
  onAccent: "#FFFFFF",
  action: brand.dark,
};

// Optional fields your backend may or may not provide yet.
type TripExtras = OfferTrip & {
  arrival_time?: string | null;
  drivers?: OfferTrip["drivers"] & { rating?: number | null };
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatDuration = (start: string, end?: string | null) => {
  if (!end) return null;
  let difference = toMinutes(end) - toMinutes(start);
  if (Number.isNaN(difference)) return null;
  if (difference < 0) difference += 24 * 60;
  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`.trim();
};

const formatTripDate = (date: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const OfferTripCard = ({
  trip: rawTrip,
  onBook,
  booking,
  isCheapest = false,
}: {
  trip: OfferTrip;
  onBook: () => void;
  booking: boolean;
  isCheapest?: boolean;
}) => {
  const trip = rawTrip as TripExtras;
  const firstName = trip.drivers?.first_name ?? "";
  const lastInitial = trip.drivers?.last_name?.[0]
    ? ` ${trip.drivers.last_name[0]}.`
    : "";
  const displayName = `${firstName}${lastInitial}`.trim() || "Driver";
  const initial = (firstName[0] ?? displayName[0] ?? "?").toUpperCase();
  const rating = trip.drivers?.rating;
  const seatsLeft = Math.max(0, trip.seats_available - trip.seats_booked);
  const departTime = trip.departure_time.slice(0, 5);
  const arriveTime = trip.arrival_time?.slice(0, 5) ?? null;
  const duration = formatDuration(departTime, arriveTime);

  return (
    <View
      style={{
        width: 310,
        height: 218,
        marginRight: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.card,
        padding: 16,
        justifyContent: "space-between",
      }}
    >
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              height: 36,
              width: 36,
              borderRadius: 18,
              backgroundColor: THEME.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Jakarta-Bold",
                color: THEME.onAccent,
              }}
            >
              {initial}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-ExtraBold",
                color: THEME.ink,
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {typeof rating === "number" && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                <Ionicons name="star" size={12} color={THEME.accent} />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Jakarta",
                    color: THEME.muted,
                  }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {isCheapest && (
            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: THEME.pill,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Jakarta-Bold",
                  color: THEME.ink,
                }}
              >
                Cheapest
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            marginTop: 22,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 21,
                fontFamily: "Jakarta-ExtraBold",
                color: THEME.ink,
              }}
            >
              {departTime}
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
              numberOfLines={1}
            >
              {trip.leaving_from}
            </Text>
          </View>

          <View style={{ width: 64, alignItems: "center", paddingTop: 4 }}>
            <Ionicons name="car-outline" size={18} color={THEME.muted} />
            {duration && (
              <Text
                style={{
                  marginTop: 3,
                  fontSize: 10,
                  fontFamily: "Jakarta",
                  color: THEME.muted,
                }}
              >
                {duration}
              </Text>
            )}
            <Text
              style={{
                marginTop: 3,
                fontSize: 9,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
              numberOfLines={1}
            >
              {formatTripDate(trip.departure_date)}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 21,
                fontFamily: "Jakarta-ExtraBold",
                color: THEME.ink,
              }}
            >
              {arriveTime ?? "--:--"}
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                fontFamily: "Jakarta",
                color: THEME.muted,
                textAlign: "right",
              }}
              numberOfLines={1}
            >
              {trip.going_to}
            </Text>
          </View>
        </View>
      </View>

      <View>
        <View
          style={{ height: 1, marginBottom: 10, backgroundColor: THEME.line }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 21,
                fontFamily: "Jakarta-ExtraBold",
                color: THEME.ink,
              }}
            >
              R{Number(trip.price_per_seat).toFixed(2)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
            >
              per passenger
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: THEME.pillSoft,
            }}
          >
            <Text
              style={{ fontSize: 10, fontFamily: "Jakarta", color: THEME.ink }}
            >
              {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
            </Text>
          </View>
          <Pressable
            onPress={onBook}
            disabled={booking || seatsLeft === 0}
            accessibilityRole="button"
            accessibilityLabel={`Book ride from ${trip.leaving_from} to ${trip.going_to}`}
            style={{
              minWidth: 88,
              height: 34,
              paddingHorizontal: 10,
              borderRadius: 17,
              backgroundColor: THEME.action,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              opacity: booking || seatsLeft === 0 ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Jakarta-Bold",
                color: THEME.onAccent,
              }}
            >
              {booking ? "Booking" : seatsLeft === 0 ? "Full" : "Book ride"}
            </Text>
            {!booking && seatsLeft > 0 && (
              <Ionicons
                name="arrow-forward"
                size={12}
                color={THEME.onAccent}
              />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default OfferTripCard;