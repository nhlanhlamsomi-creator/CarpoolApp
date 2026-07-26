import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { useLocationStore } from "@/store";

const FindRide = () => {
  const {
    userAddress,
    userLatitude,
    userLongitude,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  const ready = Boolean(userAddress && destinationAddress);

  const swap = () => {
    if (
      userAddress == null ||
      destinationAddress == null ||
      userLatitude == null ||
      userLongitude == null ||
      destinationLatitude == null ||
      destinationLongitude == null
    ) {
      return;
    }

    const pickup = {
      latitude: userLatitude,
      longitude: userLongitude,
      address: userAddress,
    };

    setUserLocation({
      latitude: destinationLatitude,
      longitude: destinationLongitude,
      address: destinationAddress,
    });
    setDestinationLocation(pickup);
  };

  return (
    <RideLayout
      title="Find your ride"
      subtitle="Set your pickup and drop-off"
      snapPoints={["58%", "88%"]}
    >
      <View className="flex-1">
        {/* Pickup */}
        <View className="mt-4">
          <View className="mb-2 flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-[#1FB574]" />
            <Text className="text-[13px] font-JakartaBold text-[#101814]">
              Pickup
            </Text>
          </View>

          <GoogleTextInput
            initialLocation={userAddress ?? "Your current location"}
            biasLat={userLatitude}
            biasLng={userLongitude}
            handlePress={(location) => setUserLocation(location)}
          />
        </View>

        {/* Swap — a small affordance that saves retyping both fields */}
        <View className="my-2 flex-row items-center">
          <View className="ml-[5px] h-8 w-[1.5px] bg-[#E2E9E5]" />
          <TouchableOpacity
            onPress={swap}
            disabled={!ready}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Swap pickup and destination"
            className={`ml-auto h-9 w-9 items-center justify-center rounded-full border border-[#E2E9E5] bg-white ${
              ready ? "" : "opacity-40"
            }`}
          >
            <Ionicons name="swap-vertical" size={16} color="#0E5C3F" />
          </TouchableOpacity>
        </View>

        {/* Destination */}
        <View>
          <View className="mb-2 flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-[3px] bg-[#0E5C3F]" />
            <Text className="text-[13px] font-JakartaBold text-[#101814]">
              Drop-off
            </Text>
          </View>

          <GoogleTextInput
            initialLocation={destinationAddress ?? "Where are you going?"}
            biasLat={userLatitude}
            biasLng={userLongitude}
            handlePress={(location) => setDestinationLocation(location)}
          />
        </View>

        {/* CTA — disabled until both ends are known, so people don't tap
            through to an empty driver list */}
        <View className="mt-8">
          <CustomButton
            title={ready ? "Find drivers" : "Set both locations"}
            disabled={!ready}
            IconRight={() =>
              ready ? (
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              ) : null
            }
            onPress={() => router.push("/(root)/confirm-ride")}
          />
        </View>
      </View>
    </RideLayout>
  );
};

export default FindRide;