import { router } from "expo-router";
import { Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import RideLayout from "@/components/RideLayout";

const ConfirmRide = () => {
  return (
    <RideLayout title={"Choose a Rider"} snapPoints={["65%", "85%"]}>
      <View className="mx-5 mt-5">
        <Text className="text-center text-lg text-general-800">No drivers available</Text>
      </View>
      <View className="mx-5 mt-10">
        <CustomButton
          title="Select Ride"
          onPress={() => router.push("/(root)/book-ride")}
        />
      </View>
    </RideLayout>
  );
};

export default ConfirmRide;
