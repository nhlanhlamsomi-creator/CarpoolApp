import { Image, Text, View } from "react-native";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

const RideCard = ({ ride }: { ride: Ride }) => {
  return (
    <View className="mb-4 overflow-hidden rounded-3xl bg-white shadow-sm shadow-neutral-300">
      <Image
        source={{
          uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
        }}
        className="h-44 w-full"
      />
      <View className="p-4">
        <View className="flex flex-row items-center gap-3 mb-3">
          <Image source={icons.to} className="w-5 h-5" />
          <Text className="text-md font-JakartaMedium flex-1" numberOfLines={1}>
            {ride.origin_address}
          </Text>
        </View>

        <View className="flex flex-row items-center gap-3 mb-4">
          <Image source={icons.point} className="w-5 h-5" />
          <Text className="text-md font-JakartaMedium flex-1" numberOfLines={1}>
            {ride.destination_address}
          </Text>
        </View>

        <View className="rounded-3xl bg-primary-50 p-4">
          <View className="flex flex-row items-center justify-between mb-3">
            <Text className="text-sm font-JakartaMedium text-neutral-500">Date & Time</Text>
            <Text className="text-sm font-JakartaBold" numberOfLines={1}>
              {formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between mb-3">
            <Text className="text-sm font-JakartaMedium text-neutral-500">Driver</Text>
            <Text className="text-sm font-JakartaBold">
              {ride.driver.first_name} {ride.driver.last_name}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between mb-3">
            <Text className="text-sm font-JakartaMedium text-neutral-500">Car Seats</Text>
            <Text className="text-sm font-JakartaBold">{ride.driver.car_seats}</Text>
          </View>

          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm font-JakartaMedium text-neutral-500">Payment Status</Text>
            <Text
              className={`text-sm capitalize font-JakartaBold ${ride.payment_status === "paid" ? "text-success-600" : "text-danger-600"}`}
            >
              {ride.payment_status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RideCard;
