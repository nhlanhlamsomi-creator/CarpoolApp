import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

// ─── Palette ─────────────────────────────────────────────────────────────────
const WARM = {
  cream:    "#FBF7F0",
  sand:     "#F4EDE1",
  gold:     "#F5B93C",
  goldDeep: "#E0A11E",
  goldSoft: "#FCEBC4",
  charcoal: "#2B2722",
  graphite: "#4A443D",
  muted:    "#9A928A",
  line:     "#E7DECF",
};

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const openPaymentSheet = async () => {
    try {
      setLoading(true);
      await initializePaymentSheet();

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      Alert.alert("Payment error", err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "LYFT",
      intentConfiguration: {
        mode: {
          amount: Math.round(Number(amount) * 100),
          currencyCode: "usd",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: Number(amount),
                paymentMethodId: paymentMethod.id,
              }),
            },
          );

          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });

            if (result.client_secret) {
              await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: Math.round(Number(amount) * 100),
                  payment_status: "paid",
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "myapp://book-ride",
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <>
      {/* ═══ Confirm Ride — GOLD ═══ */}
      <Pressable
        onPress={openPaymentSheet}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Confirm ride"
        style={{
          marginTop: 22,
          marginBottom: 10,
          height: 58,
          borderRadius: 20,
          backgroundColor: loading ? WARM.goldSoft : WARM.gold,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          borderWidth: 1.5,
          borderColor: loading ? WARM.gold : WARM.goldDeep,
          shadowColor: WARM.goldDeep,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: loading ? 0.1 : 0.35,
          shadowRadius: 18,
          elevation: loading ? 2 : 8,
          opacity: loading ? 0.65 : 1,
        }}
      >
        <Text
          style={{
            color: WARM.charcoal,
            fontSize: 16,
            fontFamily: "Jakarta-Bold",
            letterSpacing: 0.2,
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? "Processing…" : "Confirm Ride"}
        </Text>

        {!loading && (
          <View
            style={{
              height: 26,
              width: 26,
              borderRadius: 13,
              backgroundColor: "rgba(255,255,255,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="arrow-forward"
              size={16}
              color={WARM.charcoal}
            />
          </View>
        )}
      </Pressable>

      {/* ═══ Success modal ═══ */}
      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 28,
            borderWidth: 1,
            borderColor: WARM.line,
            padding: 26,
            alignItems: "center",
            shadowColor: WARM.charcoal,
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.12,
            shadowRadius: 26,
            elevation: 8,
          }}
        >
          <Image
            source={images.check}
            style={{ width: 112, height: 112, marginTop: 4 }}
            resizeMode="contain"
          />

          <Text
            style={{
              marginTop: 18,
              fontSize: 22,
              fontFamily: "Jakarta-ExtraBold",
              color: WARM.charcoal,
              textAlign: "center",
              letterSpacing: -0.5,
            }}
          >
            Booking placed successfully
          </Text>

          <Text
            style={{
              marginTop: 10,
              fontSize: 13.5,
              lineHeight: 20,
              fontFamily: "Jakarta",
              color: WARM.graphite,
              textAlign: "center",
            }}
          >
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          {/* Back Home — GOLD */}
          <Pressable
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            accessibilityRole="button"
            accessibilityLabel="Back home"
            style={{
              marginTop: 22,
              height: 54,
              width: "100%",
              borderRadius: 20,
              backgroundColor: WARM.gold,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 1.5,
              borderColor: WARM.goldDeep,
              shadowColor: WARM.goldDeep,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text
              style={{
                color: WARM.charcoal,
                fontSize: 15.5,
                fontFamily: "Jakarta-Bold",
                letterSpacing: 0.2,
              }}
            >
              Back Home
            </Text>
            <View
              style={{
                height: 24,
                width: 24,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.55)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="home"
                size={14}
                color={WARM.charcoal}
              />
            </View>
          </Pressable>
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;