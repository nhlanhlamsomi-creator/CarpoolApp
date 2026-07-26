// ─────────────────────────────────────────────────────────────────────────────
// Small display components, kept together because they share one visual
// language. Replaces ProfileSectionCard.tsx and StatCard.tsx.
//
//   import { SectionCard, StatCard, EmptyState, Badge } from "@/components/Cards";
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type IoniconName = keyof typeof Ionicons.glyphMap;

// ─── SectionCard ─────────────────────────────────────────────────────────────
// A tappable settings/profile row.

type SectionCardProps = {
  title: string;
  value?: string;
  icon?: IoniconName;
  onPress?: () => void;
  /** Shows a coloured pill on the right — use for verification status. */
  status?: "verified" | "pending" | "rejected" | "required";
  tone?: "default" | "danger";
};

const STATUS_PILL = {
  verified: { bg: "bg-[#E6F2EC]", text: "text-[#0E5C3F]", label: "Verified" },
  pending:  { bg: "bg-[#FDF4E3]", text: "text-[#8A6100]", label: "In review" },
  rejected: { bg: "bg-[#FEF3F3]", text: "text-[#B02A2A]", label: "Rejected" },
  required: { bg: "bg-[#EEF1F0]", text: "text-[#68756F]", label: "Required" },
};

export const SectionCard = ({
  title,
  value,
  icon = "ellipse-outline",
  onPress,
  status,
  tone = "default",
}: SectionCardProps) => {
  const danger = tone === "danger";
  const pill = status ? STATUS_PILL[status] : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mb-2.5 flex-row items-center justify-between rounded-2xl border border-[#E2E9E5] bg-white px-4 py-3.5 active:opacity-70"
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={`h-10 w-10 items-center justify-center rounded-xl ${
            danger ? "bg-[#FEF3F3]" : "bg-[#E6F2EC]"
          }`}
        >
          <Ionicons
            name={icon}
            size={18}
            color={danger ? "#E04545" : "#0E5C3F"}
          />
        </View>

        <View className="flex-1">
          <Text
            className={`text-[14px] font-JakartaSemiBold ${
              danger ? "text-[#E04545]" : "text-[#101814]"
            }`}
          >
            {title}
          </Text>
          {!!value && (
            <Text
              className="mt-0.5 text-[12px] font-Jakarta text-[#68756F]"
              numberOfLines={1}
            >
              {value}
            </Text>
          )}
        </View>
      </View>

      {pill ? (
        <View className={`mr-1.5 rounded-full px-2.5 py-1 ${pill.bg}`}>
          <Text className={`text-[10.5px] font-JakartaBold ${pill.text}`}>
            {pill.label}
          </Text>
        </View>
      ) : null}

      <Ionicons name="chevron-forward" size={18} color="#9BA6A1" />
    </Pressable>
  );
};

// ─── StatCard ────────────────────────────────────────────────────────────────

type StatCardProps = {
  icon: IoniconName;
  label: string;
  value: string;
  /** Optional change indicator, e.g. "+12%" */
  delta?: string;
};

export const StatCard = ({ icon, label, value, delta }: StatCardProps) => (
  <View className="flex-1 rounded-2xl border border-[#E2E9E5] bg-white px-3.5 py-4">
    <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#E6F2EC]">
      <Ionicons name={icon} size={17} color="#0E5C3F" />
    </View>

    <Text className="mt-3 text-[20px] font-JakartaExtraBold text-[#101814]">
      {value}
    </Text>

    <View className="mt-0.5 flex-row items-center gap-1.5">
      <Text className="text-[11.5px] font-Jakarta text-[#68756F]">{label}</Text>
      {!!delta && (
        <Text className="text-[11px] font-JakartaBold text-[#1FB574]">
          {delta}
        </Text>
      )}
    </View>
  </View>
);

// ─── EmptyState ──────────────────────────────────────────────────────────────
// An empty screen is an invitation to act, so this takes an action by default.

type EmptyStateProps = {
  icon?: IoniconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon = "car-outline",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <View className="items-center px-8 py-14">
    <View className="h-20 w-20 items-center justify-center rounded-3xl bg-[#E6F2EC]">
      <Ionicons name={icon} size={34} color="#0E5C3F" />
    </View>

    <Text className="mt-5 text-center text-[17px] font-JakartaExtraBold text-[#101814]">
      {title}
    </Text>
    <Text className="mt-2 text-center text-[13.5px] font-Jakarta leading-5 text-[#68756F]">
      {message}
    </Text>

    {!!actionLabel && !!onAction && (
      <Pressable
        onPress={onAction}
        className="mt-6 rounded-2xl bg-[#0E5C3F] px-6 py-3.5 active:opacity-80"
      >
        <Text className="text-[14px] font-JakartaBold text-white">
          {actionLabel}
        </Text>
      </Pressable>
    )}
  </View>
);

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeProps = {
  label: string;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
  icon?: IoniconName;
};

const TONES = {
  brand:   { bg: "bg-[#E6F2EC]", text: "text-[#0E5C3F]", icon: "#0E5C3F" },
  success: { bg: "bg-[#E6F2EC]", text: "text-[#0E5C3F]", icon: "#1FB574" },
  warning: { bg: "bg-[#FDF4E3]", text: "text-[#8A6100]", icon: "#E3A008" },
  danger:  { bg: "bg-[#FEF3F3]", text: "text-[#B02A2A]", icon: "#E04545" },
  neutral: { bg: "bg-[#EEF1F0]", text: "text-[#68756F]", icon: "#68756F" },
};

export const Badge = ({ label, tone = "brand", icon }: BadgeProps) => {
  const t = TONES[tone];
  return (
    <View className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${t.bg}`}>
      {!!icon && <Ionicons name={icon} size={12} color={t.icon} />}
      <Text className={`text-[11px] font-JakartaBold ${t.text}`}>{label}</Text>
    </View>
  );
};