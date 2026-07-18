import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-secondary-600";
    case "danger":
      return "bg-danger-600";
    case "success":
      return "bg-success-600";
    case "outline":
      return "bg-transparent border border-neutral-300";
    default:
      return "bg-primary-500";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      return "text-white";
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
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full rounded-3xl px-5 py-4 flex-row items-center justify-center gap-2 shadow-lg shadow-black/10 ${getBgVariantStyle(bgVariant)} ${className}`}
      {...props}
    >
      {IconLeft ? <IconLeft /> : null}
      <Text className={`text-lg font-JakartaSemiBold ${getTextVariantStyle(textVariant)}`}>
        {title}
      </Text>
      {IconRight ? <IconRight /> : null}
    </TouchableOpacity>
  );
};

export default CustomButton;
