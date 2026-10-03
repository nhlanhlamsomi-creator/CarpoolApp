import { useRef, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const geoapifyKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
  onClear,
}: GoogleInputProps) => {
  const [text, setText] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);
  const searchRequest = useRef(0);

  const searchPlaces = async (value: string) => {
    const requestId = ++searchRequest.current;
    setText(value);
    setPlaces([]);

    if (value.length < 3) {
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          value
        )}&limit=5&apiKey=${geoapifyKey}`
      );

      const data = await response.json();
      if (requestId !== searchRequest.current) return;

      if (data.features) {
        setPlaces(data.features);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      if (requestId !== searchRequest.current) return;
      console.log("Geoapify autocomplete error:", error);
      setPlaces([]);
    }
  };

  const handleSelectPlace = (place: any) => {
    searchRequest.current += 1;
    const location = place.properties;

    handlePress({
      latitude: location.lat,
      longitude: location.lon,
      address: location.formatted,
    });

    setText(location.formatted);
    setPlaces([]);
  };

  const clearSearch = () => {
    searchRequest.current += 1;
    setText("");
    setPlaces([]);
    onClear?.();
  };

  return (
    <View className={`w-full ${containerStyle ?? ""}`}>
      {/* Search input */}
      <View
        className={`h-[54px] flex-row items-center rounded-2xl border-[1.5px] px-4 ${
          focused ? "border-[#5A189A]" : "border-[#E9E2F0]"
        }`}
        style={{
          backgroundColor:
            textInputBackgroundColor ?? (focused ? "#FFFFFF" : "#F7F4FB"),
        }}
      >
        <Image
          source={icon ? icon : icons.search}
          className="h-5 w-5"
          resizeMode="contain"
          tintColor={focused ? "#5A189A" : "#A69BAF"}
        />

        <TextInput
          value={text}
          onChangeText={searchPlaces}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="#A69BAF"
          className="ml-3 h-[52px] flex-1 text-[15px] font-JakartaMedium text-[#21152F]"
          returnKeyType="search"
        />
        {text.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            accessibilityRole="button"
            accessibilityLabel="Clear location"
            hitSlop={10}
            className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-[#F0E6FA]"
          >
            <Text className="text-[18px] font-JakartaBold text-[#5A189A]">
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete results */}
      {places.length > 0 && (
        <View className="mt-2 overflow-hidden rounded-2xl border border-[#E9E2F0] bg-white shadow-sm shadow-black/10">
          {places.map((place, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectPlace(place)}
              activeOpacity={0.7}
              className={`flex-row items-center px-4 py-3.5 ${
                index < places.length - 1 ? "border-b border-[#E9E2F0]" : ""
              }`}
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#F0E6FA]">
                <Image
                  source={icons.point}
                  className="h-4 w-4"
                  resizeMode="contain"
                  tintColor="#5A189A"
                />
              </View>
              <Text
                className="flex-1 text-[13.5px] font-JakartaSemiBold text-[#21152F]"
                numberOfLines={2}
              >
                {place.properties.formatted}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;