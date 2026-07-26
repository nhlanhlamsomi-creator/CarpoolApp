import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import { fetchAPI } from "@/lib/fetch";

// ─── Per-field behaviour ─────────────────────────────────────────────────────
// Keyboard, validation and help text depend on what's being edited, so they
// live in one table rather than scattered through the component.

type FieldConfig = {
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numbers-and-punctuation";
  autoCapitalize?: "none" | "words" | "sentences";
  multiline?: boolean;
  help?: string;
  /** Where the value lives: a top-level column, or inside profile_data. */
  nested?: boolean;
  validate?: (value: string) => string | null;
};

const CONFIG: Record<string, FieldConfig> = {
  name: {
    placeholder: "e.g. Sipho Dlamini",
    autoCapitalize: "words",
    validate: (v) =>
      v.trim().length < 2 ? "Enter your full name" : null,
  },
  email: {
    placeholder: "e.g. sipho@email.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Enter a valid email address",
  },
  phone_number: {
    placeholder: "e.g. 082 123 4567",
    keyboardType: "phone-pad",
    help: "Drivers use this to reach you about pickup.",
    validate: (v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 9 ? null : "Enter a valid phone number";
    },
  },
  gender: {
    placeholder: "e.g. Female",
    autoCapitalize: "words",
    nested: true,
  },
  date_of_birth: {
    placeholder: "YYYY-MM-DD",
    keyboardType: "numbers-and-punctuation",
    nested: true,
    help: "You must be 18 or older to book a ride.",
    validate: (v) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return "Use the format YYYY-MM-DD";

      const date = new Date(v);
      if (Number.isNaN(date.getTime())) return "That date isn't valid";

      const age =
        (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) return "You must be 18 or older";
      if (age > 120) return "Check the year you entered";

      return null;
    },
  },
  home_address: {
    placeholder: "Street, suburb, city",
    autoCapitalize: "words",
    multiline: true,
    nested: true,
  },
  emergency_contact: {
    placeholder: "Name and phone number",
    autoCapitalize: "words",
    nested: true,
    help: "We only contact this person if something goes wrong on a trip.",
  },
  preferred_vehicle: {
    placeholder: "e.g. Standard",
    autoCapitalize: "words",
    nested: true,
  },
  favorite_locations: {
    placeholder: "e.g. Home, Sandton office",
    autoCapitalize: "words",
    multiline: true,
    nested: true,
  },
  language: {
    placeholder: "e.g. English",
    autoCapitalize: "words",
    nested: true,
  },
};

const EditProfile = () => {
  const router = useRouter();
  const { field, label } = useLocalSearchParams<{ field?: string; label?: string }>();
  const { user } = useUser();

  const config: FieldConfig = (field && CONFIG[field]) || {
    placeholder: "Enter a value",
  };

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Prefill with what's already saved — an empty box gives no clue what the
  // current value is, and people retype things unnecessarily.
  useEffect(() => {
    (async () => {
      if (!user?.id || !field) {
        setLoading(false);
        return;
      }

      try {
        const result = await fetchAPI(
          `/(api)/profile?clerkId=${encodeURIComponent(user.id)}`,
        );
        const record = result?.data ?? {};
        const existing = config.nested
          ? record.profile_data?.[field]
          : record[field];

        if (existing) setValue(String(existing));
      } catch (err) {
        console.warn("Could not load current value", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, field]);

  const handleSave = async () => {
    if (!field || !user?.id) return;

    const validationError = config.validate?.(value) ?? null;
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      // Nested fields have to be merged, not replaced, or saving one
      // preference wipes all the others.
      let payload: Record<string, unknown>;

      if (config.nested) {
        const current = await fetchAPI(
          `/(api)/profile?clerkId=${encodeURIComponent(user.id)}`,
        );
        const existingData = current?.data?.profile_data ?? {};
        payload = { profile_data: { ...existingData, [field]: value.trim() } };
      } else {
        payload = { [field]: value.trim() };
      }

      await fetchAPI("/(api)/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, ...payload }),
      });

      router.back();
    } catch (err) {
      Alert.alert("Update failed", "We couldn't save that change. Please try again.");
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
        {/* Header */}
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
          <Ionicons
            name="chevron-back"
            size={22}
            color="#101814"
            onPress={() => router.back()}
            suppressHighlighting
          />
          <Text className="text-[19px] font-JakartaExtraBold text-[#101814]">
            {label || "Edit profile"}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0E5C3F" />
          </View>
        ) : (
          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="rounded-3xl border border-[#E2E9E5] bg-white p-5">
              <Text className="mb-2.5 text-[12.5px] font-JakartaSemiBold text-[#4A5450]">
                {label}
              </Text>

              <TextInput
                value={value}
                onChangeText={(text) => {
                  setValue(text);
                  if (error) setError(null);
                }}
                placeholder={config.placeholder}
                placeholderTextColor="#B4BEB9"
                keyboardType={config.keyboardType ?? "default"}
                autoCapitalize={config.autoCapitalize ?? "sentences"}
                multiline={config.multiline}
                autoFocus
                className={`rounded-2xl border-[1.5px] px-4 py-3.5 text-[15px] font-JakartaMedium text-[#101814] ${
                  error
                    ? "border-[#E04545] bg-[#FEF3F3]"
                    : "border-[#E2E9E5] bg-[#F8FAF9]"
                }`}
                style={config.multiline ? { minHeight: 96, textAlignVertical: "top" } : undefined}
              />

              {error ? (
                <View className="mt-2 flex-row items-center gap-1.5">
                  <Ionicons name="alert-circle-outline" size={14} color="#E04545" />
                  <Text className="text-[12px] font-JakartaMedium text-[#E04545]">
                    {error}
                  </Text>
                </View>
              ) : config.help ? (
                <Text className="ml-1 mt-2 text-[11.5px] font-Jakarta leading-4 text-[#9BA6A1]">
                  {config.help}
                </Text>
              ) : null}
            </View>

            <View className="mt-6">
              <CustomButton
                title={saving ? "Saving…" : "Save changes"}
                loading={saving}
                disabled={!value.trim()}
                onPress={handleSave}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;