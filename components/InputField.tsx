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
    ? "border-[#E04545]"
    : focused
      ? "border-[#0E5C3F]"
      : "border-[#E2E9E5]";

  const bgColor = error ? "bg-[#FEF3F3]" : focused ? "bg-white" : "bg-[#F8FAF9]";

  const iconColor = error ? "#E04545" : focused ? "#0E5C3F" : "#A7B2AD";

  return (
    <View className={`my-2 w-full ${className ?? ""}`}>
      {!!label && (
        <Text
          className={`mb-2 text-[13px] font-JakartaSemiBold text-[#4A5450] ${labelStyle ?? ""}`}
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
          placeholderTextColor="#B4BEB9"
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
              color="#A7B2AD"
            />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <Ionicons name="alert-circle-outline" size={14} color="#E04545" />
          <Text className="text-xs font-JakartaMedium text-[#E04545]">
            {error}
          </Text>
        </View>
      )}

      {!error && !!hint && (
        <Text className="ml-1 mt-1.5 text-xs font-Jakarta text-[#9BA6A1]">
          {hint}
        </Text>
      )}
    </View>
  );
};

export default InputField;