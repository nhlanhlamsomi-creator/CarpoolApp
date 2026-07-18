import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchAPI } from "@/lib/fetch";
import { useUser } from "@clerk/clerk-expo";

const EditProfile = () => {
  const router = useRouter();
  const { field, label } = useLocalSearchParams<{ field?: string; label?: string }>();
  const { user } = useUser();
  const [value, setValue] = useState("");

  const handleSave = async () => {
    if (!field || !user?.id) {
      return;
    }

    try {
      await fetchAPI("/(api)/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, [field]: value }),
      });
      Alert.alert("Saved", `${label} was updated.`);
      router.back();
    } catch (error) {
      Alert.alert("Update failed", "Unable to save the change right now.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="my-5 text-2xl font-JakartaBold text-neutral-900">
          {label || "Edit profile"}
        </Text>
        <View className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-200">
          <Text className="mb-3 text-sm font-JakartaSemiBold text-neutral-700">
            {label}
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Enter a value"
            className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
          />
        </View>
        <Pressable
          onPress={handleSave}
          className="mt-5 rounded-2xl bg-black px-4 py-3"
        >
          <Text className="text-center text-sm font-JakartaBold text-white">
            Save
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
