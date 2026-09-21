import { Image, Text, View } from "react-native";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

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

const RideCard = ({ ride }: { ride: Ride }) => {
  // Null-safe driver access — the API can return a ride before a driver is
  // attached, and `ride.driver` is optional on the Ride type.
  const driver = ride.driver;
  const driverName = driver
    ? `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim()
    : "";
  const carSeats = driver?.car_seats ?? "—";
  const paid = ride.payment_status === "paid";

  return (
    <View
      style={{
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: WARM.line,
        shadowColor: WARM.charcoal,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 12,
          flex: 1,
        }}
      >
        {/* ── Map thumbnail + route ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            style={{
              width: 80,
              height: 90,
              borderRadius: 14,
              backgroundColor: WARM.sand,
            }}
          />

          <View
            style={{
              flexDirection: "column",
              marginHorizontal: 16,
              rowGap: 16,
              flex: 1,
            }}
          >
            {/* Origin */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 8,
              }}
            >
              <View
                style={{
                  height: 22,
                  width: 22,
                  borderRadius: 8,
                  backgroundColor: WARM.goldSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={icons.to}
                  style={{ width: 14, height: 14 }}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontFamily: "Jakarta-Medium",
                  color: WARM.charcoal,
                }}
                numberOfLines={1}
              >
                {ride.origin_address}
              </Text>
            </View>

            {/* Destination */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 8,
              }}
            >
              <View
                style={{
                  height: 22,
                  width: 22,
                  borderRadius: 8,
                  backgroundColor: WARM.cream,
                  borderWidth: 1,
                  borderColor: WARM.line,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={icons.point}
                  style={{ width: 14, height: 14 }}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontFamily: "Jakarta-Medium",
                  color: WARM.charcoal,
                }}
                numberOfLines={1}
              >
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Facts panel ── */}
        <View
          style={{
            marginTop: 16,
            width: "100%",
            backgroundColor: WARM.cream,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: WARM.line,
            padding: 14,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {/* Date & Time */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-Medium",
                color: WARM.muted,
              }}
            >
              Date &amp; Time
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-Bold",
                color: WARM.charcoal,
                flexShrink: 1,
                textAlign: "right",
              }}
              numberOfLines={1}
            >
              {formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
            </Text>
          </View>

          {/* Driver */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-Medium",
                color: WARM.muted,
              }}
            >
              Driver
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-Bold",
                color: WARM.charcoal,
              }}
              numberOfLines={1}
            >
              {driverName || "Not assigned yet"}
            </Text>
          </View>

          {/* Car Seats */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-Medium",
                color: WARM.muted,
              }}
            >
              Car Seats
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-Bold",
                color: WARM.charcoal,
              }}
            >
              {carSeats}
            </Text>
          </View>

          {/* Payment Status */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Jakarta-Medium",
                color: WARM.muted,
              }}
            >
              Payment Status
            </Text>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: paid ? WARM.goldSoft : "#FEF3F3",
                borderWidth: 1,
                borderColor: paid ? WARM.gold : "#F5D5D5",
              }}
            >
              <Text
                style={{
                  fontSize: 12.5,
                  fontFamily: "Jakarta-Bold",
                  color: paid ? WARM.goldDeep : "#B02A2A",
                  textTransform: "capitalize",
                }}
              >
                {ride.payment_status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RideCard;