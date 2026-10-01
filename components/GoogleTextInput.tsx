import { useState } from "react";
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
}: GoogleInputProps) => {
  const [text, setText] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);

  const searchPlaces = async (value: string) => {
    setText(value);

    if (value.length < 3) {
      setPlaces([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          value
        )}&limit=5&apiKey=${geoapifyKey}`
      );

      const data = await response.json();

      if (data.features) {
        setPlaces(data.features);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      console.log("Geoapify autocomplete error:", error);
      setPlaces([]);
    }
  };

  const handleSelectPlace = (place: any) => {
    const location = place.properties;

    handlePress({
      latitude: location.lat,
      longitude: location.lon,
      address: location.formatted,
    });

    setText(location.formatted);
    setPlaces([]);
  };

  return (
    <View className={`w-full ${containerStyle ?? ""}`}>
      {/* Search input */}
      <View
        className={`h-[54px] flex-row items-center rounded-2xl border-[1.5px] px-4 ${
          focused ? "border-[#0A3B2E]" : "border-[#E3E7E5]"
        }`}
        style={{
          backgroundColor:
            textInputBackgroundColor ?? (focused ? "#FFFFFF" : "#F4F6F5"),
        }}
      >
        <Image
          source={icon ? icon : icons.search}
          className="h-5 w-5"
          resizeMode="contain"
          tintColor={focused ? "#0A3B2E" : "#A9B1AD"}
        />

        <TextInput
          value={text}
          onChangeText={searchPlaces}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="#A9B1AD"
          className="ml-3 h-[52px] flex-1 text-[15px] font-JakartaMedium text-[#101814]"
        />
      </View>

      {/* Autocomplete results */}
      {places.length > 0 && (
        <View className="mt-2 overflow-hidden rounded-2xl border border-[#E3E7E5] bg-white shadow-sm shadow-black/10">
          {places.map((place, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectPlace(place)}
              activeOpacity={0.7}
              className={`flex-row items-center px-4 py-3.5 ${
                index < places.length - 1 ? "border-b border-[#E3E7E5]" : ""
              }`}
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#E4EFEA]">
                <Image
                  source={icons.point}
                  className="h-4 w-4"
                  resizeMode="contain"
                  tintColor="#0A3B2E"
                />
              </View>
              <Text
                className="flex-1 text-[13.5px] font-JakartaSemiBold text-[#101814]"
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