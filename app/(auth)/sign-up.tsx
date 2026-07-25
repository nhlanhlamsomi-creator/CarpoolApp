import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log("SIGN UP ERROR");
      console.log(err);

      Alert.alert(
        "Error",
        err?.errors?.[0]?.longMessage || "Something went wrong."
      );
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp =
        await signUp.attemptEmailAddressVerification({
          code: verification.code,
        });

      if (completeSignUp.status === "complete") {
        console.log("Clerk User Created");
        console.log(completeSignUp);

        // Save user in Neon
        const response = await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });

        console.log("========== USER API RESPONSE ==========");
        console.log(response);

        await setActive({
          session: completeSignUp.createdSessionId,
        });

        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        console.log("Verification not complete");
        console.log(completeSignUp);

        setVerification({
          ...verification,
          state: "failed",
          error: "Verification failed.",
        });
      }
    } catch (err: any) {
      console.log("VERIFY ERROR");
      console.log(err);

      setVerification({
        ...verification,
        state: "failed",
        error: err?.errors?.[0]?.longMessage || "Something went wrong.",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.signUpCar}
            className="w-full h-[250px]"
          />

          <Text className="absolute bottom-5 left-5 text-2xl font-JakartaSemiBold">
            Create Your Account
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) =>
              setForm({
                ...form,
                name: value,
              })
            }
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) =>
              setForm({
                ...form,
                email: value,
              })
            }
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            secureTextEntry
            textContentType="password"
            value={form.password}
            onChangeText={(value) =>
              setForm({
                ...form,
                password: value,
              })
            }
          />

          <CustomButton
            title="Sign Up"
            className="mt-6"
            onPress={onSignUpPress}
          />

          <OAuth />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">
              Log In
            </Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white rounded-2xl px-7 py-9">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              Verification
            </Text>

            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}
            </Text>

            <InputField
              label="Code"
              placeholder="123456"
              icon={icons.lock}
              keyboardType="numeric"
              value={verification.code}
              onChangeText={(value) =>
                setVerification({
                  ...verification,
                  code: value,
                })
              }
            />

            {verification.error !== "" && (
              <Text className="text-red-500 mt-2">
                {verification.error}
              </Text>
            )}

            <CustomButton
              title="Verify Email"
              className="mt-5 bg-success-500"
              onPress={onPressVerify}
            />
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white rounded-2xl px-7 py-9">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />

            <Text className="text-3xl text-center font-JakartaBold">
              Verified
            </Text>

            <Text className="text-base text-center text-gray-400 mt-2 font-Jakarta">
              Your account has been successfully created.
            </Text>

            <CustomButton
              title="Browse Home"
              className="mt-5"
              onPress={() => router.replace("/(root)/(tabs)/home")}
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;