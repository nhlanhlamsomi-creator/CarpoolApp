// app/(root)/(tabs)/home.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";

import { EmptyState } from "@/components/Cards";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { useFetch } from "@/lib/fetch";
import { findNearbyHubs, formatDistance, searchPlaces } from "@/lib/lib/hub";
import { useLocationStore } from "@/store";
import { Hub, HubType, Ride } from "@/types/type";

// Hub type configurations for UI display
const TYPE_ICONS: Record<HubType, string> = {
  mall: "storefront-outline",
  station: "train-outline",
  park: "leaf-outline",
  public_place: "location-outline",
  transport_hub: "bus-outline",
  university: "school-outline",
  school: "school-outline",
  hospital: "medkit-outline",
  office_park: "business-outline",
  shopping_center: "cart-outline",
  community_center: "people-outline",
  campus: "school-outline",
  library: "book-outline",
  museum: "ribbon-outline",
  sports_center: "basketball-outline",
  market: "pricetag-outline",
  bus_stop: "bus-outline",
  police_station: "shield-outline",
  petrol_station: "flame-outline",
};

const TYPE_COLORS: Record<HubType, string> = {
  mall: "#F7A13B",
  station: "#00155F",
  park: "#34D399",
  public_place: "#8B5CF6",
  transport_hub: "#EC4899",
  university: "#6366F1",
  school: "#F59E0B",
  hospital: "#EF4444",
  office_park: "#6B7280",
  shopping_center: "#10B981",
  community_center: "#3B82F6",
  campus: "#6366F1",
  library: "#8B5CF6",
  museum: "#EC4899",
  sports_center: "#F59E0B",
  market: "#F7A13B",
  bus_stop: "#00155F",
  police_station: "#1E3A5F",
  petrol_station: "#DC2626",
};

const TYPE_LABELS: Record<HubType, string> = {
  mall: "Shopping Mall",
  station: "Station",
  park: "Park",
  public_place: "Public Place",
  transport_hub: "Transport Hub",
  university: "University",
  school: "School",
  hospital: "Hospital",
  office_park: "Office Park",
  shopping_center: "Shopping Center",
  community_center: "Community Center",
  campus: "Campus",
  library: "Library",
  museum: "Museum",
  sports_center: "Sports Center",
  market: "Market",
  bus_stop: "Bus Stop",
  police_station: "Police Station",
  petrol_station: "Petrol Station",
};

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const {
    setUserLocation,
    setDestinationLocation,
    userAddress,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
  } = useLocationStore();

  const { data: recentRides, loading } = useFetch<Ride[]>(
    `/(api)/ride/${user?.id}`
  );

  const rides = recentRides || [];

  // Hub states
  const [pickupHubs, setPickupHubs] = useState<Hub[]>([]);
  const [destinationHubs, setDestinationHubs] = useState<Hub[]>([]);
  const [selectedPickupHub, setSelectedPickupHub] = useState<Hub | null>(null);
  const [selectedDropoffHub, setSelectedDropoffHub] = useState<Hub | null>(null);
  const [showPickupHubSelector, setShowPickupHubSelector] = useState(false);
  const [showDropoffHubSelector, setShowDropoffHubSelector] = useState(false);
  const [isLoadingPickupHubs, setIsLoadingPickupHubs] = useState(true);
  const [isLoadingDestinationHubs, setIsLoadingDestinationHubs] = useState(false);

  // Destination input
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [showDestinationInput, setShowDestinationInput] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load pickup hubs based on current location
  useEffect(() => {
    const loadPickupHubs = async () => {
      if (!userLatitude || !userLongitude || !isMounted.current) {
        setIsLoadingPickupHubs(false);
        return;
      }

      try {
        console.log("Loading pickup hubs for:", userLatitude, userLongitude);
        const hubs = await findNearbyHubs(userLatitude, userLongitude, 3000, 30);
        console.log("Found pickup hubs:", hubs.length);
        if (isMounted.current) {
          setPickupHubs(hubs);
          if (hubs.length > 0) {
            setSelectedPickupHub(hubs[0]);
          }
        }
      } catch (error) {
        console.error("Error loading pickup hubs:", error);
      } finally {
        if (isMounted.current) {
          setIsLoadingPickupHubs(false);
        }
      }
    };

    loadPickupHubs();
  }, [userLatitude, userLongitude]);

  // Load destination hubs when destination is set
  useEffect(() => {
    const loadDestinationHubs = async () => {
      if (!destinationLatitude || !destinationLongitude || !isMounted.current) {
        setDestinationHubs([]);
        setSelectedDropoffHub(null);
        return;
      }

      setIsLoadingDestinationHubs(true);
      try {
        console.log("Loading destination hubs for:", destinationLatitude, destinationLongitude);
        const hubs = await findNearbyHubs(destinationLatitude, destinationLongitude, 1000, 10);
        console.log("Found destination hubs:", hubs.length);
        if (isMounted.current) {
          setDestinationHubs(hubs);
          if (hubs.length > 0) {
            setSelectedDropoffHub(hubs[0]);
          }
        }
      } catch (error) {
        console.error("Error loading destination hubs:", error);
      } finally {
        if (isMounted.current) {
          setIsLoadingDestinationHubs(false);
        }
      }
    };

    loadDestinationHubs();
  }, [destinationLatitude, destinationLongitude]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (isMounted.current) {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: `${address[0].name}, ${address[0].region}`,
        });
      }
    })();
  }, []);

  // Search for destination using Geoapify API
  const searchDestination = async (query: string) => {
    setDestinationQuery(query);
    if (query.length < 2) {
      setDestinationSuggestions([]);
      return;
    }

    setIsSearchingDestination(true);
    try {
      const results = await searchPlaces(query, {
        latitude: userLatitude || 0,
        longitude: userLongitude || 0,
      });
      
      if (isMounted.current) {
        setDestinationSuggestions(results);
      }
    } catch (error) {
      console.error("Error searching destination:", error);
    } finally {
      if (isMounted.current) {
        setIsSearchingDestination(false);
      }
    }
  };

  // Select destination from suggestions
  const selectDestination = (place: any) => {
    try {
      const location = place;
      if (location && location.latitude && location.longitude) {
        setDestinationLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || location.name,
        });
        setDestinationQuery(location.address || location.name);
        setDestinationSuggestions([]);
        setShowDestinationInput(false);
      }
    } catch (error) {
      console.error("Error selecting destination:", error);
      Alert.alert("Error", "Failed to select destination. Please try again.");
    }
  };

  // Handle drop-off hub selection
  const handleSelectDropoffHub = (hub: Hub) => {
    try {
      if (!hub || !hub.latitude || !hub.longitude) {
        Alert.alert("Error", "Invalid hub selected.");
        return;
      }
      
      setDestinationLocation({
        latitude: hub.latitude,
        longitude: hub.longitude,
        address: hub.address || hub.name,
      });
      setDestinationQuery(hub.name);
      setSelectedDropoffHub(hub);
      setShowDropoffHubSelector(false);
    } catch (error) {
      console.error("Error selecting dropoff hub:", error);
      Alert.alert("Error", "Failed to select drop-off hub. Please try again.");
    }
  };

  const handleFindRide = () => {
    try {
      if (!selectedPickupHub) {
        Alert.alert("Select Pickup", "Please select a pickup hub first.");
        return;
      }

      if (!destinationAddress) {
        Alert.alert("Enter Destination", "Please enter your destination.");
        return;
      }

      router.push({
        pathname: "/(root)/find-ride",
        params: {
          pickupHubId: selectedPickupHub.id || "",
          pickupHubName: selectedPickupHub.name || "",
          pickupLatitude: selectedPickupHub.latitude || 0,
          pickupLongitude: selectedPickupHub.longitude || 0,
          dropoffHubId: selectedDropoffHub?.id || "",
          dropoffHubName: selectedDropoffHub?.name || "",
          destinationAddress: destinationAddress || "",
          destinationLatitude: destinationLatitude || 0,
          destinationLongitude: destinationLongitude || 0,
        },
      });
    } catch (error) {
      console.error("Error navigating to find ride:", error);
      Alert.alert("Error", "Failed to find ride. Please try again.");
    }
  };

  // Render hub item for the selector
  const renderHubItem = ({ item, isPickup }: { item: Hub; isPickup: boolean }) => {
    const iconName = TYPE_ICONS[item.type] || "location-outline";
    const color = TYPE_COLORS[item.type] || "#6B7280";
    const label = TYPE_LABELS[item.type] || item.type;

    const isSelected = isPickup 
      ? selectedPickupHub?.id === item.id 
      : selectedDropoffHub?.id === item.id;

    return (
      <TouchableOpacity
        onPress={() => {
          try {
            if (isPickup) {
              setSelectedPickupHub(item);
              setShowPickupHubSelector(false);
            } else {
              handleSelectDropoffHub(item);
            }
          } catch (error) {
            console.error("Error selecting hub:", error);
          }
        }}
        className={`flex-row items-center p-4 border-b border-[#EAEFF4] ${
          isSelected ? "bg-[#0E5C3F]/10" : ""
        }`}
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={iconName as any} size={24} color={color} />
        </View>

        <View className="flex-1">
          <Text className="text-[16px] font-JakartaBold text-[#101814]">{item.name}</Text>
          <Text className="text-[12px] font-JakartaMedium text-[#68756F]" numberOfLines={1}>
            {item.address || item.vicinity || "Address not available"}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-[11px] font-JakartaMedium text-[#0E5C3F]">
              {item.distance !== undefined ? formatDistance(item.distance) : "Unknown distance"}
            </Text>
            <View className="px-2 py-0.5 rounded-full bg-[#F4F7FB]">
              <Text className="text-[9px] font-JakartaMedium text-[#68756F]">{label}</Text>
            </View>
          </View>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#0E5C3F" />
        )}
      </TouchableOpacity>
    );
  };

  // Hub Selector Modal Component
  const HubSelectorModal = ({
    visible,
    onClose,
    hubs,
    isPickup,
    title,
    isLoading,
    userAddress,
  }: {
    visible: boolean;
    onClose: () => void;
    hubs: Hub[];
    isPickup: boolean;
    title: string;
    isLoading: boolean;
    userAddress?: string | null;
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredHubs, setFilteredHubs] = useState<Hub[]>(hubs);

    useEffect(() => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        setFilteredHubs(
          hubs.filter(
            (hub) =>
              hub.name.toLowerCase().includes(query) ||
              hub.address.toLowerCase().includes(query) ||
              hub.vicinity?.toLowerCase().includes(query)
          )
        );
      } else {
        setFilteredHubs(hubs);
      }
    }, [searchQuery, hubs]);

    return (
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <View className="flex-1 bg-[#F5F8F6]">
          <View className="bg-white px-4 pt-12 pb-4 shadow-[0_2px_8px_rgba(17,37,74,0.08)]">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#101814" />
              </Pressable>
              <Text className="text-[18px] font-JakartaExtraBold text-[#101814]">{title}</Text>
              <View className="w-10" />
            </View>

            {userAddress && (
              <View className="mt-2 flex-row items-center bg-[#F4F7FB] rounded-xl px-3 py-2">
                <Ionicons name="location" size={16} color="#0E5C3F" />
                <Text className="ml-2 text-[12px] font-JakartaMedium text-[#68756F]" numberOfLines={1}>
                  Current location: {userAddress}
                </Text>
              </View>
            )}

            <View className="mt-3 flex-row items-center bg-[#F4F7FB] rounded-2xl px-4 py-2">
              <Ionicons name="search" size={20} color="#68756F" />
              <TextInput
                className="flex-1 ml-2 text-[14px] font-JakartaMedium text-[#101814]"
                placeholder={`Search ${isPickup ? "pickup" : "drop-off"} hubs...`}
                placeholderTextColor="#9BA6A1"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9BA6A1" />
                </Pressable>
              )}
            </View>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0E5C3F" />
              <Text className="mt-4 text-[14px] font-JakartaMedium text-[#68756F]">
                Finding nearby hubs...
              </Text>
            </View>
          ) : filteredHubs.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="location-outline" size={64} color="#DDE3EA" />
              <Text className="mt-4 text-[18px] font-JakartaBold text-[#101814]">No hubs found</Text>
              <Text className="text-[14px] font-JakartaMedium text-[#68756F] text-center">
                {searchQuery ? "No hubs match your search" : "Try expanding your search radius"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredHubs}
              renderItem={({ item }) => renderHubItem({ item, isPickup })}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          <View className="bg-white px-4 py-4 border-t border-[#EAEFF4]">
            <Text className="text-[11px] font-JakartaMedium text-[#68756F] text-center">
              Showing {filteredHubs.length} nearby {filteredHubs.length === 1 ? "hub" : "hubs"}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      <FlatList
        data={rides.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => `${item.user_id}-${item.created_at}-${index}`}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        ListHeaderComponent={
          <>
            {/* Greeting */}
            <View className="my-5 flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[13px] font-Jakarta text-[#68756F]">
                  Welcome back
                </Text>
                <Text
                  className="mt-0.5 text-[23px] font-JakartaExtraBold text-[#101814]"
                  numberOfLines={1}
                >
                  {user?.firstName ?? "there"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  signOut();
                  router.replace("/(auth)/sign-in");
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                activeOpacity={0.8}
                className="h-11 w-11 items-center justify-center rounded-2xl border border-[#E2E9E5] bg-white"
              >
                <Ionicons name="log-out-outline" size={20} color="#68756F" />
              </TouchableOpacity>
            </View>

            {/* Pickup Hub Selection */}
            <Pressable
              onPress={() => setShowPickupHubSelector(true)}
              className="flex-row items-center gap-2 rounded-2xl bg-white px-4 py-3.5 border border-[#E2E9E5]"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E6F2EC]">
                <Ionicons name="pin" size={15} color="#0E5C3F" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-Jakarta text-[#9BA6A1]">
                  Pickup hub
                </Text>
                <Text className="text-[13px] font-JakartaSemiBold text-[#101814]" numberOfLines={1}>
                  {isLoadingPickupHubs
                    ? "Finding nearby hubs..."
                    : selectedPickupHub
                    ? `${selectedPickupHub.name} (${formatDistance(selectedPickupHub.distance || 0)})`
                    : "Select pickup hub"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#9BA6A1" />
            </Pressable>

            {/* Destination Input */}
            <Pressable
              onPress={() => setShowDestinationInput(true)}
              className="mt-3 flex-row items-center gap-2 rounded-2xl bg-white px-4 py-3.5 border border-[#E2E9E5]"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E6F2EC]">
                <Ionicons name="navigate" size={15} color="#0E5C3F" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-Jakarta text-[#9BA6A1]">
                  Destination
                </Text>
                <Text className="text-[13px] font-JakartaSemiBold text-[#101814]" numberOfLines={1}>
                  {destinationAddress || "Where are you going?"}
                </Text>
              </View>
              {destinationAddress && (
                <Ionicons name="checkmark-circle" size={18} color="#0E5C3F" />
              )}
            </Pressable>

            {/* Drop-off Hub Selection (only show if destination is set) */}
            {destinationAddress && (
              <Pressable
                onPress={() => setShowDropoffHubSelector(true)}
                className="mt-3 flex-row items-center gap-2 rounded-2xl bg-white px-4 py-3.5 border border-[#E2E9E5]"
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E6F2EC]">
                  <Ionicons name="flag" size={15} color="#0E5C3F" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-Jakarta text-[#9BA6A1]">
                    Drop-off hub
                  </Text>
                  <Text className="text-[13px] font-JakartaSemiBold text-[#101814]" numberOfLines={1}>
                    {isLoadingDestinationHubs
                      ? "Finding nearby hubs..."
                      : selectedDropoffHub
                      ? `${selectedDropoffHub.name} (${formatDistance(selectedDropoffHub.distance || 0)})`
                      : "Select drop-off hub (optional)"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#9BA6A1" />
              </Pressable>
            )}

            {/* Find Ride Button */}
            {selectedPickupHub && destinationAddress && (
              <TouchableOpacity
                onPress={handleFindRide}
                className="mt-4 bg-[#0E5C3F] py-4 rounded-2xl"
              >
                <Text className="text-center text-[16px] font-JakartaExtraBold text-white">
                  Find a Ride
                </Text>
              </TouchableOpacity>
            )}

            {/* Map */}
            <View className="mt-6 overflow-hidden rounded-3xl border border-[#E2E9E5] bg-white">
              <View className="h-[260px]">
                <Map />
              </View>

              <View className="flex-row items-center gap-2.5 px-4 py-3.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E6F2EC]">
                  <Ionicons name="navigate" size={15} color="#0E5C3F" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-Jakarta text-[#9BA6A1]">
                    Your location
                  </Text>
                  <Text
                    className="text-[13px] font-JakartaSemiBold text-[#101814]"
                    numberOfLines={1}
                  >
                    {userAddress ?? "Finding you..."}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent rides */}
            <View className="mb-3 mt-7 flex-row items-center justify-between">
              <Text className="text-[17px] font-JakartaExtraBold text-[#101814]">
                Recent rides
              </Text>

              {rides.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(root)/(tabs)/rides")}
                  activeOpacity={0.7}
                >
                  <Text className="text-[13px] font-JakartaBold text-[#0E5C3F]">
                    See all
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#0E5C3F" />
              <Text className="mt-3 text-[12.5px] font-Jakarta text-[#68756F]">
                Loading your rides
              </Text>
            </View>
          ) : (
            <EmptyState
              icon="car-outline"
              title="No rides yet"
              message="Search for a destination above and book your first seat."
            />
          )
        }
      />

      {/* Destination Input Modal */}
      <Modal
        visible={showDestinationInput}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDestinationInput(false)}
      >
        <SafeAreaView className="flex-1 bg-[#F5F8F6]">
          <View className="bg-white px-4 pt-4 pb-4 shadow-[0_2px_8px_rgba(17,37,74,0.08)]">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setShowDestinationInput(false)} className="p-2">
                <Ionicons name="close" size={24} color="#101814" />
              </Pressable>
              <Text className="text-[18px] font-JakartaExtraBold text-[#101814]">
                Where are you going?
              </Text>
              <View className="w-10" />
            </View>

            <View className="mt-3 flex-row items-center bg-[#F4F7FB] rounded-2xl px-4 py-2">
              <Ionicons name="search" size={20} color="#68756F" />
              <TextInput
                className="flex-1 ml-2 text-[14px] font-JakartaMedium text-[#101814]"
                placeholder="Search for a destination..."
                placeholderTextColor="#9BA6A1"
                value={destinationQuery}
                onChangeText={searchDestination}
                autoFocus
                returnKeyType="search"
              />
              {isSearchingDestination && (
                <ActivityIndicator size="small" color="#0E5C3F" />
              )}
              {destinationQuery.length > 0 && (
                <Pressable onPress={() => setDestinationQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9BA6A1" />
                </Pressable>
              )}
            </View>
          </View>

          {destinationSuggestions.length > 0 ? (
            <FlatList
              data={destinationSuggestions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectDestination(item)}
                  className="px-4 py-4 border-b border-[#EAEFF4] bg-white"
                >
                  <Text className="text-[14px] font-JakartaMedium text-[#101814]">
                    {item.name || item.address}
                  </Text>
                  <Text className="text-[12px] font-JakartaMedium text-[#68756F]">
                    {item.address || item.vicinity}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `${item.id || index}`}
              className="px-0"
            />
          ) : (
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="navigate-outline" size={64} color="#DDE3EA" />
              <Text className="mt-4 text-[18px] font-JakartaBold text-[#101814]">
                Search for a destination
              </Text>
              <Text className="text-[14px] font-JakartaMedium text-[#68756F] text-center">
                Type your destination address or place name
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Pickup Hub Selector Modal */}
      <HubSelectorModal
        visible={showPickupHubSelector}
        onClose={() => setShowPickupHubSelector(false)}
        hubs={pickupHubs}
        isPickup={true}
        title="Select Pickup Hub"
        isLoading={isLoadingPickupHubs}
        userAddress={userAddress}
      />

      {/* Drop-off Hub Selector Modal */}
      <HubSelectorModal
        visible={showDropoffHubSelector}
        onClose={() => setShowDropoffHubSelector(false)}
        hubs={destinationHubs}
        isPickup={false}
        title="Select Drop-off Hub"
        isLoading={isLoadingDestinationHubs}
        userAddress={destinationAddress || undefined}
      />
    </SafeAreaView>
  );
};

export default Home;