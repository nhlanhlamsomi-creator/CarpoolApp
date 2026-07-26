import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/type";

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const {
    data: recentRides,
    loading,
  } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  const rides = recentRides || [];

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <FlatList
        data={rides.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => `${item.user_id}-${item.created_at}-${index}`}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            <View className="flex-row justify-between items-center my-5">
              <Text className="text-2xl font-JakartaExtraBold">
                Welcome {user?.firstName} 👋
              </Text>

              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-white justify-center items-center"
                onPress={() => {
                  signOut();
                  router.replace("/(auth)/sign-in");
                }}
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <Text className="text-xl font-JakartaBold mt-6 mb-3">
              Your Current Location
            </Text>

            <View className="h-[300px]">
              <Map />
            </View>

            <Text className="text-xl font-JakartaBold mt-6 mb-4">
              Recent Rides
            </Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0286FF" />
          ) : (
            <View className="items-center mt-10">
              <Image
                source={images.noResult}
                className="w-40 h-40"
                resizeMode="contain"
              />
              <Text>No recent rides found.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

export default Home;