import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Payment from "@/components/Payment";
import { brand, ui } from "@/constants/theme";
import { formatDate } from "@/lib/utils";
import { useDriverVehicle } from "@/lib/useDriverVehicle";
import { OfferTrip } from "@/types/type";

const parseTrip = (value?: string | string[]): OfferTrip | null => {
  const serialized = Array.isArray(value) ? value[0] : value;
  if (!serialized) return null;

  try {
    const trip = JSON.parse(serialized) as Partial<OfferTrip>;
    if (
      !Number.isSafeInteger(Number(trip.id)) ||
      !Number.isSafeInteger(Number(trip.driver_id)) ||
      !trip.leaving_from ||
      !trip.going_to ||
      !trip.departure_date ||
      !trip.departure_time ||
      !Number.isFinite(Number(trip.price_per_seat)) ||
      Number(trip.price_per_seat) <= 0
    ) {
      return null;
    }
    return trip as OfferTrip;
  } catch {
    return null;
  }
};

const OfferTripBooking = () => {
  const { user } = useUser();
  const { trip: tripParam } = useLocalSearchParams<{ trip?: string }>();
  const trip = parseTrip(tripParam);
  const { vehicle, loading: vehicleLoading } = useDriverVehicle(
    trip?.driver_id,
  );

  if (!trip) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: ui.bg }}>
        <StatusBar barStyle="dark-content" backgroundColor={ui.bg} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 18, fontFamily: "Jakarta-Bold", color: ui.ink }}>
            Ride details unavailable
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: brand.dark, fontFamily: "Jakarta-Bold" }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const driverName = [trip.drivers?.first_name, trip.drivers?.last_name]
    .filter(Boolean)
    .join(" ") || "Your driver";
  const date = formatDate(trip.departure_date);
  const time = trip.departure_time.slice(0, 5);
  const seatsLeft = Math.max(0, trip.seats_available - trip.seats_booked);

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.lyft"
      urlScheme="myapp"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: ui.bg }}>
        <StatusBar barStyle="dark-content" backgroundColor={ui.bg} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 8, paddingBottom: 18, gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: ui.surface,
                borderWidth: 1,
                borderColor: ui.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={20} color={ui.ink} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 11, fontFamily: "Jakarta-Bold", color: ui.muted, textTransform: "uppercase" }}>
                Seat reservation
              </Text>
              <Text style={{ marginTop: 2, fontSize: 22, fontFamily: "Jakarta-ExtraBold", color: ui.ink }}>
                Confirm and pay
              </Text>
            </View>
          </View>

          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: ui.border, backgroundColor: ui.surface, padding: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: brand.tint }}>
                <Text style={{ fontSize: 17, fontFamily: "Jakarta-Bold", color: brand.dark }}>
                  {(trip.drivers?.first_name?.[0] ?? driverName[0] ?? "D").toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: "Jakarta-Bold", color: ui.ink }}>{driverName}</Text>
                {typeof trip.drivers?.rating === "number" && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Ionicons name="star" size={12} color={brand.accent} />
                    <Text style={{ fontSize: 12, fontFamily: "Jakarta", color: ui.muted }}>{trip.drivers.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 11, fontFamily: "Jakarta-Bold", color: ui.muted }}>{date}</Text>
                <Text style={{ marginTop: 2, fontSize: 13, fontFamily: "Jakarta-Bold", color: ui.ink }}>{time}</Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: ui.border, marginBottom: 16 }} />
            <View
              style={{
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderRadius: 14,
                backgroundColor: ui.bg,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Ionicons name="car-outline" size={18} color={brand.dark} />
              <Text style={{ flex: 1, fontSize: 12, fontFamily: "Jakarta", color: ui.muted }}>
                Vehicle plate
              </Text>
              <Text style={{ fontSize: 13, fontFamily: "Jakarta-Bold", color: ui.ink }}>
                {vehicleLoading
                  ? "Loading…"
                  : vehicle?.plate ?? "Plate unavailable"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ alignItems: "center", paddingTop: 3 }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: brand.accent }} />
                <View style={{ width: 1, height: 24, backgroundColor: ui.border }} />
                <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: brand.dark }} />
              </View>
              <View style={{ flex: 1, gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 10, fontFamily: "Jakarta-Bold", color: ui.muted, textTransform: "uppercase" }}>Pickup</Text>
                  <Text style={{ marginTop: 2, fontSize: 14, fontFamily: "Jakarta-SemiBold", color: ui.ink }} numberOfLines={2}>{trip.leaving_from}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 10, fontFamily: "Jakarta-Bold", color: ui.muted, textTransform: "uppercase" }}>Drop-off</Text>
                  <Text style={{ marginTop: 2, fontSize: 14, fontFamily: "Jakarta-SemiBold", color: ui.ink }} numberOfLines={2}>{trip.going_to}</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: ui.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 12, fontFamily: "Jakarta", color: ui.muted }}>
                {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} available
              </Text>
              <Text style={{ fontSize: 20, fontFamily: "Jakarta-ExtraBold", color: ui.ink }}>
                R{Number(trip.price_per_seat).toFixed(2)}
              </Text>
            </View>
          </View>

          <Payment
            fullName={user?.fullName ?? ""}
            email={user?.emailAddresses[0]?.emailAddress ?? ""}
            amount={String(trip.price_per_seat)}
            driverId={trip.driver_id}
            rideTime={0}
            offerTripId={trip.id}
          />
        </ScrollView>
      </SafeAreaView>
    </StripeProvider>
  );
};

export default OfferTripBooking;
