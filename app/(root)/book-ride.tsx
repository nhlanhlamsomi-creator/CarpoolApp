import { useUser } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Image, Text, View } from "react-native";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore } from "@/store";

const BookRide = () => {
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { drivers, selectedDriver } = useDriverStore();

  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.uber"
      urlScheme="myapp"
    >
      <RideLayout title="Book Ride">
        <>
          <View className="rounded-3xl bg-white p-5 shadow-sm shadow-neutral-300">
            <View className="items-center justify-center">
              <Image
                source={{ uri: driverDetails?.profile_image_url }}
                className="h-28 w-28 rounded-full"
              />

              <Text className="mt-5 text-xl font-JakartaBold text-neutral-900">
                {driverDetails?.title || `${driverDetails?.first_name} ${driverDetails?.last_name}`}
              </Text>

              <View className="mt-3 flex-row items-center gap-2 rounded-full bg-primary-50 px-4 py-2">
                <Image
                  source={icons.star}
                  className="w-4 h-4"
                  resizeMode="contain"
                />
                <Text className="text-base font-JakartaMedium text-neutral-900">
                  {driverDetails?.rating ?? "4.9"}
                </Text>
              </View>
            </View>

            <View className="mt-6 rounded-3xl bg-primary-50 p-4">
              <View className="flex flex-row items-center justify-between mb-3">
                <Text className="text-base font-JakartaMedium text-neutral-500">Ride Price</Text>
                <Text className="text-base font-JakartaBold text-success-600">
                  ${driverDetails?.price ?? "0.00"}
                </Text>
              </View>

              <View className="flex flex-row items-center justify-between mb-3">
                <Text className="text-base font-JakartaMedium text-neutral-500">Pickup Time</Text>
                <Text className="text-base font-JakartaBold text-neutral-900">
                  {formatTime(driverDetails?.time ?? 0)}
                </Text>
              </View>

              <View className="flex flex-row items-center justify-between">
                <Text className="text-base font-JakartaMedium text-neutral-500">Car Seats</Text>
                <Text className="text-base font-JakartaBold text-neutral-900">
                  {driverDetails?.car_seats ?? 0}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 rounded-3xl bg-white p-4 shadow-sm shadow-neutral-300">
            <View className="flex-row items-start gap-3 border-b border-neutral-200 pb-4 mb-4">
              <Image source={icons.to} className="w-6 h-6" />
              <View className="flex-1">
                <Text className="text-sm font-JakartaMedium text-neutral-500">Pickup</Text>
                <Text className="text-base font-JakartaRegular text-neutral-900">
                  {userAddress}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <Image source={icons.point} className="w-6 h-6" />
              <View className="flex-1">
                <Text className="text-sm font-JakartaMedium text-neutral-500">Destination</Text>
                <Text className="text-base font-JakartaRegular text-neutral-900">
                  {destinationAddress}
                </Text>
              </View>
            </View>
          </View>

          <Payment
            fullName={user?.fullName!}
            email={user?.emailAddresses[0].emailAddress!}
            amount={driverDetails?.price!}
            driverId={driverDetails?.id}
            rideTime={driverDetails?.time!}
          />
        </>
      </RideLayout>
    </StripeProvider>
  );
};

export default BookRide;
