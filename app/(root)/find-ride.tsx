import { router } from "expo-router";
import { Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  return (
    <RideLayout title="Find Your Ride">

      <View className="flex-1 px-1">

        {/* Pickup */}
        <View className="mt-5">
          <Text className="text-base font-JakartaSemiBold text-neutral-900 mb-2">
            From
          </Text>

          <GoogleTextInput
            icon={icons.target}
            initialLocation={userAddress ?? "Your current location"}
            containerStyle="bg-white"
            textInputBackgroundColor="#F8FAFC"
            handlePress={(location) =>
              setUserLocation(location)
            }
          />
        </View>


        {/* Destination */}
        <View className="mt-6">
          <Text className="text-base font-JakartaSemiBold text-neutral-900 mb-2">
            To
          </Text>

          <GoogleTextInput
            icon={icons.map}
            initialLocation={
              destinationAddress ?? "Where do you want to go?"
            }
            containerStyle="bg-white"
            textInputBackgroundColor="#F8FAFC"
            handlePress={(location) =>
              setDestinationLocation(location)
            }
          />
        </View>


        {/* Button */}
        <View className="mt-8">
          <CustomButton
            title="Find Now"
            onPress={() =>
              router.push("/(root)/confirm-ride")
            }
            className="h-14 rounded-full"
          />
        </View>

      </View>

    </RideLayout>
  );
};

export default FindRide;