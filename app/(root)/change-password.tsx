import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";

// Clerk supports changing a password in-app via user.updatePassword(), so
// there's no reason to send people out to accounts.clerk.com.

const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One capital letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
];

const ChangePassword = () => {
  const { user } = useUser();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  const passed = RULES.map((rule) => rule.test(next));
  const strongEnough = passed.every(Boolean);
  const matches = next.length > 0 && next === confirm;
  const canSubmit = current.length > 0 && strongEnough && matches && !saving;

  const handleSave = async () => {
    if (!user) return;

    setErrors({});
    setSaving(true);

    try {
      await user.updatePassword({
        currentPassword: current,
        newPassword: next,
        // Ends other sessions, so a stolen session can't survive the change
        signOutOfOtherSessions: true,
      });

      Alert.alert(
        "Password changed",
        "You've been signed out on other devices.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.longMessage ??
        "We couldn't change your password. Check your current password and try again.";

      // Clerk reports a wrong current password against that field
      if (/current|incorrect|password is incorrect/i.test(message)) {
        setErrors({ current: "That's not your current password" });
      } else {
        Alert.alert("Couldn't change password", message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-xl border border-[#E2E9E5] bg-white active:opacity-70"
          >
            <Ionicons name="chevron-back" size={20} color="#101814" />
          </Pressable>
          <Text className="text-[19px] font-JakartaExtraBold text-[#101814]">
            Change password
          </Text>
        </View>

        <ScrollView
          className="px-5"
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-3xl border border-[#E2E9E5] bg-white p-5">
            <InputField
              label="Current password"
              ionicon="lock-closed-outline"
              placeholder="Your current password"
              secureTextEntry
              value={current}
              onChangeText={(v: string) => {
                setCurrent(v);
                if (errors.current) setErrors({});
              }}
              error={errors.current}
            />

            <InputField
              label="New password"
              ionicon="key-outline"
              placeholder="Choose a new password"
              secureTextEntry
              value={next}
              onChangeText={setNext}
            />

            {/* Rules shown live, so people aren't guessing what's wrong */}
            {next.length > 0 && (
              <View className="mb-2 mt-1 gap-1.5">
                {RULES.map((rule, i) => (
                  <View key={rule.label} className="flex-row items-center gap-2">
                    <Ionicons
                      name={passed[i] ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={passed[i] ? "#1FB574" : "#B4BEB9"}
                    />
                    <Text
                      className={`text-[11.5px] ${
                        passed[i]
                          ? "font-JakartaMedium text-[#0E5C3F]"
                          : "font-Jakarta text-[#9BA6A1]"
                      }`}
                    >
                      {rule.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <InputField
              label="Confirm new password"
              ionicon="key-outline"
              placeholder="Type it again"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              error={
                confirm.length > 0 && !matches ? "Passwords don't match" : null
              }
            />
          </View>

          <View className="mt-4 flex-row gap-2.5 rounded-2xl border border-[#E2E9E5] bg-white p-4">
            <Ionicons name="information-circle-outline" size={16} color="#0E5C3F" />
            <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#68756F]">
              Changing your password signs you out everywhere else. You&apos;ll
              stay signed in on this device.
            </Text>
          </View>

          <View className="mt-6">
            <CustomButton
              title={saving ? "Changing…" : "Change password"}
              loading={saving}
              disabled={!canSubmit}
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePassword;