import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Image, Text, View } from "react-native";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore } from "@/store";

const BookRide = () => {
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { drivers, selectedDriver } = useDriverStore();

  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];

  const driverName =
    driverDetails?.title ||
    `${driverDetails?.first_name ?? ""} ${driverDetails?.last_name ?? ""}`.trim() ||
    "Your driver";

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      // Must match `merchantIdentifier` in app.json or Apple Pay won't appear
      merchantIdentifier="merchant.com.lyft"
      urlScheme="myapp"
    >
      <RideLayout title="Confirm booking" snapPoints={["70%", "92%"]}>
        <>
          {/* ── Driver ── */}
          <View className="items-center rounded-3xl border border-[#E2E9E5] bg-white px-5 pb-5 pt-6">
            <View className="relative">
              <Image
                source={{ uri: driverDetails?.profile_image_url }}
                className="h-24 w-24 rounded-full bg-[#EEF1F0]"
              />
              <View className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#1FB574]">
                <Ionicons name="checkmark" size={13} color="#fff" />
              </View>
            </View>

            <Text className="mt-4 text-[19px] font-JakartaExtraBold text-[#101814]">
              {driverName}
            </Text>

            <View className="mt-2 flex-row items-center gap-3">
              <View className="flex-row items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-1.5">
                <Ionicons name="star" size={12} color="#E3A008" />
                <Text className="text-[12px] font-JakartaBold text-[#4A5450]">
                  {driverDetails?.rating ?? "4.9"}
                </Text>
              </View>

              <View className="flex-row items-center gap-1 rounded-full bg-[#F5F8F6] px-3 py-1.5">
                <Ionicons name="people-outline" size={12} color="#68756F" />
                <Text className="text-[12px] font-JakartaBold text-[#4A5450]">
                  {driverDetails?.car_seats ?? 0} seats
                </Text>
              </View>
            </View>

            {/* ── Fare breakdown ── */}
            <View className="mt-5 w-full rounded-2xl bg-[#E6F2EC] p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[13px] font-JakartaMedium text-[#4A5450]">
                  Pickup in
                </Text>
                <Text className="text-[13px] font-JakartaBold text-[#101814]">
                  {formatTime(driverDetails?.time ?? 0)}
                </Text>
              </View>

              <View className="mb-3 h-[1px] bg-[#C9E3D7]" />

              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] font-JakartaBold text-[#0E5C3F]">
                  Total fare
                </Text>
                <Text className="text-[20px] font-JakartaExtraBold text-[#0E5C3F]">
                  R{driverDetails?.price ?? "0.00"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Route ── */}
          <View className="mt-4 rounded-3xl border border-[#E2E9E5] bg-white p-5">
            <Text className="mb-4 text-[13px] font-JakartaExtraBold uppercase tracking-wider text-[#9BA6A1]">
              Your route
            </Text>

            <View className="flex-row">
              <View className="mr-3 items-center pt-1.5">
                <View className="h-2.5 w-2.5 rounded-full bg-[#1FB574]" />
                <View className="my-1.5 w-[1.5px] flex-1 bg-[#E2E9E5]" />
                <View className="h-2.5 w-2.5 rounded-[3px] bg-[#0E5C3F]" />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-Jakarta text-[#9BA6A1]">
                  Pickup
                </Text>
                <Text className="mb-5 mt-0.5 text-[14px] font-JakartaSemiBold text-[#101814]">
                  {userAddress ?? "—"}
                </Text>

                <Text className="text-[11px] font-Jakarta text-[#9BA6A1]">
                  Drop-off
                </Text>
                <Text className="mt-0.5 text-[14px] font-JakartaSemiBold text-[#101814]">
                  {destinationAddress ?? "—"}
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