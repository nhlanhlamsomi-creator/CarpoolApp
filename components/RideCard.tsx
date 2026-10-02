import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

// ─── Palette (dark green / black / white) ────────────────────────────────────
const THEME = {
  primary: "#0A3B2E", // main fill: buttons, badges, pickup dot
  primaryDeep: "#14523F", // borders on primary
  accent: "#1FA574", // icon tint
  mint: "#5FD3A6", // dot on dark surfaces
  tint: "#E4EFEA", // pale green surfaces
  surface: "#F4F6F5", // facts strip, secondary buttons
  ink: "#101814", // primary text
  graphite: "#7A8580", // secondary button text
  muted: "#7A8580", // captions
  line: "#E3E7E5", // borders and dividers
  onPrimary: "#FFFFFF", // text/icons on primary fill
};

// Status → pill colours
const STATUS: Record<string, { bg: string; text: string }> = {
  paid: { bg: "#E4EFEA", text: "#0A3B2E" },
  pending: { bg: "#E4EFEA", text: "#0A3B2E" },
  failed: { bg: "#FEF3F3", text: "#B02A2A" },
  refunded: { bg: "#E3E7E5", text: "#7A8580" },
  cancelled: { bg: "#FEF3F3", text: "#B02A2A" },
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
  safetyAlert?: {
    reason: string;
    trigger_source: "MANUAL" | "AUTOMATED";
    severity: string;
  } | null;
  onSafetyResponse?: (
    response: string,
    status: "acknowledged" | "dismissed",
  ) => void;
  onManualSOS?: () => void;
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
  // primary → dark green fill, white text
  // danger  → soft red fill, red text
  // default → light grey fill, graphite text
  const styles =
    tone === "primary"
      ? {
          bg: THEME.primary,
          border: THEME.primaryDeep,
          text: THEME.onPrimary,
          icon: THEME.onPrimary,
        }
      : tone === "danger"
        ? {
            bg: "#FEF3F3",
            border: "#FEF3F3",
            text: "#B02A2A",
            icon: "#B02A2A",
          }
        : {
            bg: THEME.surface,
            border: THEME.line,
            text: THEME.graphite,
            icon: THEME.graphite,
          };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: styles.bg,
        borderWidth: 1,
        borderColor: styles.border,
        opacity: onPress ? 1 : 0.4,
      }}
    >
      <Ionicons name={icon} size={15} color={styles.icon} />
      <Text
        style={{
          fontSize: 12.5,
          fontFamily: "Jakarta-Bold",
          color: styles.text,
        }}
      >
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
  safetyAlert,
  onSafetyResponse,
  onManualSOS,
}: Props) => {
  const statusKey = ride.status === "cancelled" ? "cancelled" : ride.payment_status;
  const status = STATUS[statusKey] ?? STATUS.pending;
  const driverName = ride.driver
    ? `${ride.driver.first_name ?? ""} ${ride.driver.last_name ?? ""}`.trim() ||
      "Driver unavailable"
    : "Driver unavailable";
  const carSeats = Number.isFinite(Number(ride.driver?.car_seats))
    ? Number(ride.driver?.car_seats)
    : null;

  const upcoming = variant === "upcoming";
  const dateLabel =
    ride.status === "cancelled"
      ? "Cancelled"
      : upcoming
        ? "Departs"
        : "Travelled";

  const duration = ride.duration_minutes ?? null;
  const whenDate = ride.scheduled_for ?? ride.created_at;

  return (
    <View
      style={{
        marginBottom: 16,
        overflow: "hidden",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: THEME.line,
        backgroundColor: "#FFFFFF",
        shadowColor: THEME.ink,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 3,
      }}
    >
      {/* ── Map preview ── */}
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
          }}
          style={{
            height: 128,
            width: "100%",
            backgroundColor: THEME.tint,
          }}
        />

        {upcoming ? (
          <View
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              backgroundColor: THEME.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: THEME.primaryDeep,
              shadowColor: THEME.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                height: 6,
                width: 6,
                borderRadius: 3,
                backgroundColor: THEME.mint,
              }}
            />
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Jakarta-Bold",
                color: THEME.onPrimary,
              }}
            >
              Upcoming
            </Text>
          </View>
        ) : null}

        <View
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: status.bg,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Jakarta-Bold",
              color: status.text,
              textTransform: "capitalize",
            }}
          >
            {statusKey}
          </Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {/* ── Route ── */}
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              marginRight: 12,
              alignItems: "center",
              paddingTop: 6,
            }}
          >
            <View
              style={{
                height: 10,
                width: 10,
                borderRadius: 5,
                backgroundColor: THEME.primary,
              }}
            />
            <View
              style={{
                width: 1.5,
                flex: 1,
                marginVertical: 4,
                backgroundColor: THEME.line,
              }}
            />
            <View
              style={{
                height: 10,
                width: 10,
                borderRadius: 3,
                backgroundColor: THEME.ink,
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13.5,
                fontFamily: "Jakarta-SemiBold",
                color: THEME.ink,
              }}
              numberOfLines={1}
            >
              {ride.origin_address}
            </Text>
            <Text
              style={{
                marginTop: 2,
                marginBottom: 12,
                fontSize: 11,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
            >
              Pickup
            </Text>

            <Text
              style={{
                fontSize: 13.5,
                fontFamily: "Jakarta-SemiBold",
                color: THEME.ink,
              }}
              numberOfLines={1}
            >
              {ride.destination_address}
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 11,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
            >
              Drop-off
            </Text>
          </View>
        </View>

        {/* ── Facts strip ── */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            borderRadius: 18,
            backgroundColor: THEME.surface,
            borderWidth: 1,
            borderColor: THEME.line,
            paddingVertical: 12,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Ionicons name="time-outline" size={15} color={THEME.accent} />
            <Text
              style={{
                marginTop: 4,
                fontSize: 12.5,
                fontFamily: "Jakarta-Bold",
                color: THEME.ink,
              }}
            >
              {duration != null ? formatTime(duration) : "—"}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
            >
              Duration
            </Text>
          </View>

          <View
            style={{
              height: 32,
              width: 1,
              backgroundColor: THEME.line,
            }}
          />

          <View style={{ alignItems: "center" }}>
            <Ionicons name="calendar-outline" size={15} color={THEME.accent} />
            <Text
              style={{
                marginTop: 4,
                fontSize: 12.5,
                fontFamily: "Jakarta-Bold",
                color: THEME.ink,
              }}
            >
              {formatDate(whenDate)}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
            >
              {dateLabel}
            </Text>
          </View>

          <View
            style={{
              height: 32,
              width: 1,
              backgroundColor: THEME.line,
            }}
          />

          <View style={{ alignItems: "center" }}>
            <Ionicons name="wallet-outline" size={15} color={THEME.accent} />
            <Text
              style={{
                marginTop: 4,
                fontSize: 12.5,
                fontFamily: "Jakarta-Bold",
                color: THEME.ink,
              }}
            >
              R{(Number(ride.fare_price ?? 0) / 100).toFixed(2)}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Jakarta",
                color: THEME.muted,
              }}
            >
              Fare
            </Text>
          </View>
        </View>

        {/* ── Driver ── */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                height: 36,
                width: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: THEME.tint,
              }}
            >
              <Ionicons name="person" size={16} color={THEME.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Jakarta-Bold",
                  color: THEME.ink,
                }}
              >
                {driverName}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Jakarta",
                  color: THEME.muted,
                }}
              >
                {carSeats ?? "—"} seats
              </Text>
            </View>
          </View>

          {!upcoming && !!onReport && (
            <Pressable
              onPress={onReport}
              hitSlop={8}
              accessibilityLabel="Report a problem with this trip"
              style={{
                height: 36,
                width: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                backgroundColor: THEME.surface,
                borderWidth: 1,
                borderColor: THEME.line,
              }}
            >
              <Ionicons name="flag-outline" size={15} color={THEME.graphite} />
            </Pressable>
          )}
        </View>

        {/* ── Actions ── */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            gap: 8,
          }}
        >
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

        {safetyAlert ? (
          <View className="mt-3 rounded-2xl border border-[#F3C4C4] bg-[#FFF5F5] p-3">
            <View className="flex-row items-start gap-2">
              <Ionicons name="warning" size={18} color="#B02A2A" />
              <View className="flex-1">
                <Text className="text-[13px] font-JakartaBold text-[#8F2020]">
                  {safetyAlert.trigger_source === "AUTOMATED"
                    ? "Unusual activity detected"
                    : "Safety alert active"}
                </Text>
                <Text className="mt-1 text-[12px] leading-5 text-[#6F3A3A]">
                  {safetyAlert.trigger_source === "AUTOMATED"
                    ? "Are you safe? A safety incident has already been created."
                    : safetyAlert.reason}
                </Text>
              </View>
            </View>
            <View className="mt-3 flex-row gap-2">
              <Action
                icon="checkmark-circle-outline"
                label="I'm safe"
                onPress={() => onSafetyResponse?.("SAFE", "acknowledged")}
              />
              <Action
                icon="call-outline"
                label="Get help"
                onPress={() => onSafetyResponse?.("HELP", "acknowledged")}
                tone="danger"
              />
              <Action
                icon="close-outline"
                label="Dismiss"
                onPress={() => onSafetyResponse?.("DISMISSED", "dismissed")}
              />
            </View>
          </View>
        ) : null}

        {upcoming && onManualSOS ? (
          <Pressable
            onPress={onManualSOS}
            accessibilityRole="button"
            accessibilityLabel="Send manual SOS"
            className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-[#D94A4A] py-3 active:opacity-75"
          >
            <Ionicons name="alert-circle-outline" size={16} color="#B02A2A" />
            <Text className="text-[12.5px] font-JakartaBold text-[#B02A2A]">
              SOS
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default RideCard;
