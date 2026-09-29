import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { ButtonProps } from "@/types/type";

type Props = ButtonProps & {
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-[#14523F]";
    case "danger":
      return "bg-[#E0575B]";
    case "success":
      return "bg-[#1FA574]";
    case "outline":
      return "bg-white border-[1.5px] border-[#E3E7E5]";
    case "ghost":
      return "bg-[#E4EFEA]";
    default:
      return "bg-[#0A3B2E]";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-[#101814]";
    case "secondary":
      return "text-[#7A8580]";
    case "danger":
      return "text-white";
    case "success":
      return "text-white";
    case "brand":
      return "text-[#0A3B2E]";
    default:
      return "text-white";
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

  // Only the filled primary button carries a shadow — an outline button with a
  // drop shadow reads as a mistake.
  const elevation =
    bgVariant === "outline" || bgVariant === "ghost"
      ? ""
      : "shadow-lg shadow-[#0A3B2E]/25";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`${fullWidth ? "w-full" : "self-start"} rounded-2xl flex-row items-center justify-center gap-2 ${getSizeStyle(
        size,
      )} ${getBgVariantStyle(bgVariant)} ${elevation} ${
        inactive ? "opacity-60" : ""
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            bgVariant === "outline" || bgVariant === "ghost"
              ? "#0A3B2E"
              : "#FFFFFF"
          }
        />
      ) : (
        IconLeft && <IconLeft />
      )}

      <Text
        className={`font-JakartaBold ${getTextSize(size)} ${getTextVariantStyle(
          textVariant,
        )}`}
      >
        {title}
      </Text>

      {!loading && IconRight ? <IconRight /> : null}
    </TouchableOpacity>
  );
};

export default CustomButton;
