import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { InputFieldProps } from "@/types/type";

type Props = InputFieldProps & {
  /** Vector icon name — preferred over the image `icon` prop. */
  ionicon?: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  hint?: string;
};

const InputField = ({
  label,
  icon,
  ionicon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  error,
  hint,
  ...props
}: Props) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const borderColor = error
    ? "border-[#E0575B]"
    : focused
      ? "border-[#0A3B2E]"
      : "border-[#E3E7E5]";

  const bgColor = error
    ? "bg-[#FEF3F3]"
    : focused
      ? "bg-white"
      : "bg-[#F4F6F5]";

  const iconColor = error ? "#E0575B" : focused ? "#0A3B2E" : "#A9B1AD";

  return (
    <View className={`my-2 w-full ${className ?? ""}`}>
      {!!label && (
        <Text
          className={`mb-2 text-[13px] font-JakartaSemiBold text-[#7A8580] ${labelStyle ?? ""}`}
        >
          {label}
        </Text>
      )}

      <View
        className={`h-[54px] flex-row items-center rounded-2xl border-[1.5px] px-4 ${borderColor} ${bgColor} ${containerStyle ?? ""}`}
      >
        {ionicon ? (
          <Ionicons name={ionicon} size={19} color={iconColor} />
        ) : icon ? (
          <Image source={icon} className={`h-5 w-5 ${iconStyle ?? ""}`} />
        ) : null}

        <TextInput
          className={`ml-3 flex-1 text-[15px] font-JakartaMedium text-[#101814] ${inputStyle ?? ""}`}
          placeholderTextColor="#A9B1AD"
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={19}
              color="#A9B1AD"
            />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <Ionicons name="alert-circle-outline" size={14} color="#E0575B" />
          <Text className="text-xs font-JakartaMedium text-[#E0575B]">
            {error}
          </Text>
        </View>
      )}

      {!error && !!hint && (
        <Text className="ml-1 mt-1.5 text-xs font-Jakarta text-[#A9B1AD]">
          {hint}
        </Text>
      )}
    </View>
  );
};

export default InputField;
