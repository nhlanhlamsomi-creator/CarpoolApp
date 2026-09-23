import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Keyboard,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

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
  const [searching, setSearching] = useState(false);
  const requestId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const searchPlaces = (value: string) => {
    setText(value);
    setPlaces([]);

    if (value.length < 3) {
      setSearching(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const currentRequest = ++requestId.current;
    setSearching(true);

    debounceTimer.current = setTimeout(async () => {
      if (!geoapifyKey) {
        setSearching(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            value,
          )}&filter=countrycode:za&limit=5&apiKey=${geoapifyKey}`,
        );
        const data = await response.json();

        if (currentRequest !== requestId.current) return;
        setPlaces(Array.isArray(data.features) ? data.features : []);
      } catch (error) {
        if (currentRequest === requestId.current) {
          console.log("Geoapify autocomplete error:", error);
          setPlaces([]);
        }
      } finally {
        if (currentRequest === requestId.current) setSearching(false);
      }
    }, 250);
  };

  const handleSelectPlace = (place: any) => {
    const location = place.properties;
    const countryCode = String(location.country_code ?? "").toLowerCase();

    if (countryCode && countryCode !== "za") return;

    handlePress({
      latitude: location.lat,
      longitude: location.lon,
      address: location.formatted,
    });

    setText(location.formatted);
    setPlaces([]);
    setSearching(false);
    Keyboard.dismiss();
  };


  return (
    <View
      className={`w-full rounded-3xl ${containerStyle ?? "bg-white"}`}
      style={{
        zIndex: 20,
        elevation: 8,
        shadowColor: "#2B2722",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      }}
    >

      {/* Search Input */}
      <View
        className="flex-row items-center rounded-3xl border border-[#E7DECF] px-4"
        style={{
          backgroundColor:
            textInputBackgroundColor ?? "#FFFFFF",
        }}
      >

        <View className="items-center justify-center">
          <Image
            source={icon ? icon : icons.search}
            className="w-5 h-5"
            resizeMode="contain"
          />
        </View>


        <TextInput
          value={text}
          onChangeText={searchPlaces}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="#9A928A"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
          className="ml-3 h-[54px] flex-1 text-[15px] font-JakartaSemiBold text-[#2B2722]"
        />

        {searching ? (
          <ActivityIndicator size="small" color="#E0A11E" />
        ) : text.length > 0 ? (
          <Pressable
            onPress={() => searchPlaces("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear destination search"
          >
            <Text className="text-xl font-JakartaMedium text-[#9A928A]">×</Text>
          </Pressable>
        ) : null}

      </View>


      {/* Autocomplete Results */}
      {places.length > 0 && (
        <View className="mt-2 overflow-hidden rounded-2xl border border-[#E7DECF] bg-white">
          {places.map((place, index) => (
            <Pressable
              key={`${place.properties?.place_id ?? place.properties?.formatted}-${index}`}
              onPress={() => handleSelectPlace(place)}
              className={`flex-row items-center px-4 py-3.5 ${
                index < places.length - 1 ? "border-b border-[#F0E9DE]" : ""
              }`}
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#FCEBC4]">
                <Text className="text-[#E0A11E]">⌖</Text>
              </View>
              <Text
                className="flex-1 text-[13px] font-JakartaSemiBold text-[#2B2722]"
                numberOfLines={2}
              >
                {place.properties.formatted}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};


export default GoogleTextInput;