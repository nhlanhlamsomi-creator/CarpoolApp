import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/Cards";
import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const insets = useSafeAreaInsets();

  const listData = Array.isArray(drivers) ? drivers : [];
  const hasSelection = selectedDriver != null;

  return (
    <RideLayout
      title="Choose a driver"
      subtitle={
        listData.length > 0
          ? `${listData.length} available nearby`
          : "Searching nearby"
      }
      snapPoints={["65%", "88%"]}
      mode="list"
    >
      {/* BottomSheetFlatList, not FlatList — a plain VirtualizedList inside the
          sheet breaks windowing and fights the sheet's own gestures. */}
      <BottomSheetFlatList
        data={listData}
        keyExtractor={(item: any, index: number) => `${item.id ?? index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: insets.bottom + 32,
        }}
        renderItem={({ item }: any) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No drivers on this route yet"
            message="Nobody is heading your way right now. Try a nearby pickup point or check again shortly."
            actionLabel="Change locations"
            onAction={() => router.back()}
          />
        }
        ListFooterComponent={
          listData.length > 0 ? (
            <View className="mt-6">
              <CustomButton
                title={hasSelection ? "Continue to booking" : "Select a driver"}
                disabled={!hasSelection}
                onPress={() => router.push("/(root)/book-ride")}
              />
            </View>
          ) : null
        }
      />
    </RideLayout>
  );
};

export default ConfirmRide;