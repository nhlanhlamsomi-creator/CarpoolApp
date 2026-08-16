// components/GoogleTextInput.tsx
import { View, Image, TextInput, Text, TouchableOpacity } from "react-native";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);

  const searchPlaces = async (value: string) => {
    setText(value);

    if (value.length < 3) {
      setPlaces([]);
      return;
    }

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
    <View
      className={`w-full rounded-3xl ${
        containerStyle ?? "bg-white"
      } shadow-sm shadow-neutral-300`}
    >

      {/* Search Input */}
      <View
        className="flex-row items-center rounded-3xl px-4"
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
          placeholder={
            initialLocation ?? "Where do you want to go?"
          }
          placeholderTextColor="#9CA3AF"
          className="flex-1 h-[52px] ml-3 text-base font-semibold text-gray-900"
        />

      </View>


      {/* Autocomplete Results */}
      {
        places.length > 0 && (

          <View
            className="bg-white rounded-2xl mt-2 overflow-hidden"
          >

            {
              places.map((place, index) => (

                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectPlace(place)}
                  className="p-4 border-b border-gray-100"
                >

                  <Text
                    className="text-gray-900 font-semibold"
                    numberOfLines={2}
                  >
                    {place.properties.formatted}
                  </Text>


                </TouchableOpacity>

              ))
            }

          </View>

        )
      }


    </View>
  );
};

export default GoogleTextInput;