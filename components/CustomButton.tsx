import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { ButtonProps } from "@/types/type";

type Props = ButtonProps & {
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

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

// ─── Background variant ──────────────────────────────────────────────────────
const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-[#F4EDE1] border-[1.5px] border-[#E7DECF]";
    case "danger":
      return "bg-[#E04545]";
    case "success":
      return "bg-[#F5B93C] border-[1.5px] border-[#E0A11E]";
    case "outline":
      return "bg-white border-[1.5px] border-[#E7DECF]";
    default:
      return "bg-[#F5B93C] border-[1.5px] border-[#E0A11E]";
  }
};

// ─── Text variant ────────────────────────────────────────────────────────────
const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-[#2B2722]";
    case "secondary":
      return "text-[#4A443D]";
    case "danger":
      return "text-white";
    case "success":
      return "text-[#2B2722]";
    default:
      return "text-[#2B2722]";
  }
};

const getSizeStyle = (size: Props["size"]) => {
  switch (size) {
    case "sm":
      return "px-4 py-2.5";
    case "lg":
      return "px-6 py-5";
    default:
      return "px-5 py-4";
  }
};

const getTextSize = (size: Props["size"]) => {
  switch (size) {
    case "sm":
      return "text-sm";
    case "lg":
      return "text-lg";
    default:
      return "text-base";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className = "",
  loading = false,
  disabled = false,
  size = "md",
  fullWidth = true,
  ...props
}: Props) => {
  const inactive = loading || disabled;

  // Only filled variants carry a shadow — outline stays flat.
  const elevation =
    bgVariant === "outline" ? "" : "shadow-lg shadow-[#E0A11E]/30";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`${fullWidth ? "w-full" : "self-start"} rounded-2xl flex-row items-center justify-center gap-2 ${getSizeStyle(
        size
      )} ${getBgVariantStyle(bgVariant)} ${elevation} ${
        inactive ? "opacity-60" : ""
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={bgVariant === "outline" ? "#E0A11E" : "#2B2722"}
        />
      ) : (
        IconLeft && <IconLeft />
      )}

      <Text
        className={`font-JakartaBold ${getTextSize(size)} ${getTextVariantStyle(
          textVariant
        )}`}
      >
        {title}
      </Text>

      {!loading && IconRight ? <IconRight /> : null}
    </TouchableOpacity>
  );
};

export default CustomButton;