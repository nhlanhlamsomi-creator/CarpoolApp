import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

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

  const safeName = fullName || email?.split("@")[0] || "Guest";
  const safeEmail = email || "guest@example.com";

  const openPaymentSheet = async () => {
    try {
      await initializePaymentSheet();

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        return;
      }

      try {
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
            ride_time: Math.round(rideTime),
            fare_price: parseInt(amount, 10) * 100,
            payment_status: "paid",
            driver_id: driverId,
            user_id: userId ?? "guest",
          }),
        });
      } catch (rideError: any) {
        console.warn("Ride creation failed after successful payment:", rideError);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Stripe flow failed:", err);
      Alert.alert("Stripe Error", err?.message || "Unable to start payment sheet.");
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const creationResponse = await fetchAPI("/(api)/(stripe)/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: safeName,
          email: safeEmail,
          amount: amount,
        }),
      });

      if (creationResponse?.error) {
        throw new Error(creationResponse.error);
      }

      const { paymentIntent, customer, ephemeralKey } = creationResponse;

      if (!paymentIntent?.client_secret || !customer || !ephemeralKey?.secret) {
        throw new Error("Stripe payment intent creation failed.");
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: "CarpoolApp",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey.secret,
        paymentIntentClientSecret: paymentIntent.client_secret,
        allowsDelayedPaymentMethods: false,
        returnURL: "myapp://book-ride",
        defaultBillingDetails: {
          email: safeEmail,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error("Init PaymentSheet failed:", err);
      throw err;
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
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
