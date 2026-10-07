import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinkDisplay, useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { apiRequest } from "@/lib/api";
import { getHubPromotionalFare } from "@/lib/promotions";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
  offerTripId,
  seatsToBook = 1,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
    selectedHubId,
    setRideBooked,
  } = useLocationStore();

  const { userId, getToken } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const [processing, setProcessing] = useState(false);
  const baseAmount = Number(amount);
  const hubPromotionActive =
    offerTripId == null && selectedHubId != null;
  const chargeAmount = hubPromotionActive
    ? getHubPromotionalFare(baseAmount)
    : baseAmount;

  const safeName = fullName || email?.split("@")[0] || "Guest";
  const safeEmail = email || "guest@example.com";
  const displayAmount = Number.isFinite(chargeAmount)
    ? chargeAmount.toFixed(2)
    : "0.00";

  const openPaymentSheet = async () => {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in before booking a ride.");
      return;
    }

    const coordinates = [
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
    ];
    const invalidStandardRide =
      offerTripId == null &&
      (!userAddress ||
        !destinationAddress ||
        coordinates.some((value) => !Number.isFinite(Number(value))));

    if (
      invalidStandardRide ||
      !Number.isFinite(Number(driverId)) ||
      Number(driverId) <= 0 ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      Alert.alert(
        "Booking details missing",
        "Choose a pickup, destination, driver, and valid fare before booking.",
      );
      return;
    }

    setProcessing(true);

    try {
      const paymentIntentId = await initializePaymentSheet(chargeAmount);

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        return;
      }

      const token = await getToken();
      if (!token) throw new Error("Sign in again to finish your booking.");

      if (offerTripId != null) {
        const bookingResult = await apiRequest<{
          data?: { ride?: { ride_id?: number } };
        }>(
          "/api/offer-trip",
          {
            method: "POST",
            body: JSON.stringify({
              tripId: offerTripId,
              payment_intent_id: paymentIntentId,
              seat_count: seatsToBook,
            }),
          },
          token,
        );

        if (!bookingResult?.data?.ride?.ride_id) {
          throw new Error("Payment succeeded, but the seat was not reserved.");
        }
      } else {
        const rideResult = await apiRequest<{ data?: { ride_id?: number } }>(
          "/api/rides",
          {
            method: "POST",
            body: JSON.stringify({
              origin_address: userAddress,
              destination_address: destinationAddress,
              origin_latitude: userLatitude,
              origin_longitude: userLongitude,
              destination_latitude: destinationLatitude,
              destination_longitude: destinationLongitude,
              ride_time: Math.round(rideTime),
              fare_price: Math.round(chargeAmount * 100),
              driver_id: driverId,
              payment_intent_id: paymentIntentId,
            }),
          },
          token,
        );

        if (!rideResult?.data?.ride_id) {
          throw new Error("The payment succeeded, but the ride was not created.");
        }
      }

      setRideBooked(true);
      setSuccess(true);
    } catch (err: any) {
      console.error("Stripe flow failed:", err);
      Alert.alert(
        "Booking failed",
        err?.message || "Unable to complete your booking.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const initializePaymentSheet = async (paymentAmount: number) => {
    try {
      const token = await getToken();
      const creationResponse = await apiRequest<{
        paymentIntent?: { id?: string; client_secret?: string };
        customer?: string;
        ephemeralKey?: { secret?: string };
      }>(
        "/api/payments/intents",
        {
          method: "POST",
          body: JSON.stringify({
            name: safeName,
            email: safeEmail,
            amount: paymentAmount,
            offer_trip_id: offerTripId,
            seat_count: seatsToBook,
          }),
        },
        token,
      );

      const { paymentIntent, customer, ephemeralKey } = creationResponse;

      if (
        !paymentIntent?.id ||
        !paymentIntent.client_secret ||
        !customer ||
        !ephemeralKey?.secret
      ) {
        throw new Error("Stripe payment intent creation failed.");
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: "LYFT",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey.secret,
        paymentIntentClientSecret: paymentIntent.client_secret,
        link: {
          display: LinkDisplay.NEVER,
        },
        applePay: {
          merchantCountryCode: "ZA",
        },
        googlePay: {
          merchantCountryCode: "ZA",
          currencyCode: "ZAR",
          testEnv: __DEV__,
        },
        allowsDelayedPaymentMethods: false,
        returnURL: "myapp://book-ride",
        defaultBillingDetails: {
          email: safeEmail,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      return paymentIntent.id;
    } catch (err: any) {
      console.error("Init PaymentSheet failed:", err);
      throw err;
    }
  };

  return (
    <>
      <View
        style={{
          marginTop: 16,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: "#E7DECF",
          backgroundColor: "#FFFFFF",
          padding: 18,
          shadowColor: "#21152F",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.05,
          shadowRadius: 18,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                height: 38,
                width: 38,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 13,
                backgroundColor: "#FCEBC4",
              }}
            >
              <Ionicons name="card-outline" size={19} color="#E0A11E" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Jakarta-Bold",
                  color: "#21152F",
                }}
              >
                Payment summary
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  fontFamily: "Jakarta",
                  color: "#746A7E",
                }}
              >
                Secure checkout with LYFT
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 22,
                fontFamily: "Jakarta-ExtraBold",
                color: "#E0A11E",
              }}
            >
              R{displayAmount}
            </Text>
            <Text
              style={{
                marginTop: 1,
                fontSize: 10,
                fontFamily: "Jakarta-Bold",
                color: "#746A7E",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Total
            </Text>
            {hubPromotionActive ? (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  fontFamily: "Jakarta-Bold",
                  color: "#0E5C3F",
                }}
              >
                Hub promotion -10%
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={{
            height: 1,
            marginVertical: 16,
            backgroundColor: "#E7DECF",
          }}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#0E5C3F" />
          <Text
            style={{
              flex: 1,
              fontSize: 11.5,
              lineHeight: 17,
              fontFamily: "Jakarta",
              color: "#4A443D",
            }}
          >
            Your payment details are encrypted. Choose card, Apple Pay, or
            Google Pay in the secure LYFT payment sheet.
          </Text>
        </View>

      </View>

      <CustomButton
        title={processing ? "Opening secure checkout" : `Pay R${displayAmount}`}
        className="mt-5 mb-3"
        onPress={openPaymentSheet}
        loading={processing}
        disabled={processing}
        IconRight={() =>
          processing ? null : (
            <Ionicons name="arrow-forward" size={18} color="#21152F" />
          )
        }
      />

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <Ionicons name="lock-closed-outline" size={12} color="#746A7E" />
        <Text
          style={{
            fontSize: 10.5,
            fontFamily: "Jakarta",
            color: "#746A7E",
          }}
        >
          Protected by Stripe
        </Text>
      </View>

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center rounded-3xl bg-white p-7">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
