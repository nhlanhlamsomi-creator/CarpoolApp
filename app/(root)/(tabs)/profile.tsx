import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SectionCard, StatCard } from "@/components/Cards";
import OptionSheet, {
  GENDER_OPTIONS,
  SA_LANGUAGES,
  VEHICLE_OPTIONS,
} from "@/components/OptionSheet";
import { fetchAPI } from "@/lib/fetch";
import {
  PickedImage,
  captureImage,
  pickFromLibrary,
  uploadAvatar,
} from "@/lib/verification";

// ─── Support contacts — replace with your real details ───────────────────────
const SUPPORT_EMAIL = "support@lyftcarpool.co.za";
const SUPPORT_PHONE = "+27110000000";
const SUPPORT_WHATSAPP = "27110000000"; // no + or spaces

const openLink = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    Linking.openURL(url);
  } else {
    Alert.alert("Can't open that", "No app on this phone can handle that link.");
  }
};

type ProfileRecord = {
  id?: number;
  name?: string;
  email?: string;
  clerk_id?: string;
  profile_image_url?: string;
  rating?: number;
  total_trips?: number;
  verification_percentage?: number;
  government_id_url?: string;
  selfie_image_url?: string;
  phone_number?: string;
  profile_data?: Record<string, any>;
};

type RideSummary = {
  completed_trips: number;
  cancelled_trips: number;
  money_spent: number;
  favorite_driver: string;
  last_ride: string;
};

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [rideSummary, setRideSummary] = useState<RideSummary>({
    completed_trips: 0,
    cancelled_trips: 0,
    money_spent: 0,
    favorite_driver: "Not available",
    last_ride: "No rides yet",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheet, setSheet] = useState<null | "gender" | "language" | "vehicle">(
    null,
  );

  const loadProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profileResult = await fetchAPI(
        `/(api)/profile?clerkId=${encodeURIComponent(user.id)}`,
      );
      setProfile(profileResult?.data ?? null);

      const rideResult = await fetchAPI(
        `/(api)/ride?clerkId=${encodeURIComponent(user.id)}`,
      );
      setRideSummary(rideResult?.data ?? rideSummary);
    } catch (error) {
      console.warn("Unable to load profile data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  // Coming back from verification or edit-profile should show the new values,
  // not whatever was loaded when the tab first mounted.
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [user?.id]),
  );

  const saveProfile = async (payload: Record<string, unknown>) => {
    if (!user?.id) {
      return;
    }

    setSaving(true);

    try {
      const result = await fetchAPI("/(api)/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, ...payload }),
      });

      if (result?.data) {
        setProfile(result.data);
      }
    } catch (error) {
      Alert.alert("Update failed", "Your profile could not be saved right now.");
      console.warn(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePickProfilePhoto = async () => {
    const run = async (fn: () => Promise<PickedImage | null>) => {
      try {
        const image = await fn();
        if (!image || !user?.id) return;

        setSaving(true);
        const publicUrl = await uploadAvatar(user.id, image);
        await saveProfile({ profile_image_url: publicUrl });
      } catch (error: any) {
        Alert.alert("Photo upload", error?.message ?? "Please try again.");
      } finally {
        setSaving(false);
      }
    };

    Alert.alert("Profile photo", "How would you like to add one?", [
      { text: "Take a photo", onPress: () => run(() => captureImage(true)) },
      { text: "Choose from library", onPress: () => run(pickFromLibrary) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
    await savePreference(key, value);
  };

  /** Merge a single key into profile_data without clobbering the rest. */
  const savePreference = async (key: string, value: unknown) => {
    const existingProfileData = profile?.profile_data ?? {};
    await saveProfile({
      profile_data: {
        ...existingProfileData,
        [key]: value,
      },
    });
  };

  const handleLogout = async () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const profileData = profile?.profile_data ?? {};
  const fullName =
    profile?.name ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "Your Name";
  const emailAddress =
    profile?.email || user?.primaryEmailAddress?.emailAddress || "Add your email";
  const phoneNumber =
    profile?.phone_number ||
    profileData.phone_number ||
    user?.primaryPhoneNumber?.phoneNumber ||
    "Add a phone number";
  const rating = typeof profile?.rating === "number" ? profile.rating : 5.0;
  const totalTrips = typeof profile?.total_trips === "number" ? profile.total_trips : 0;
  const verification =
    typeof profile?.verification_percentage === "number"
      ? profile.verification_percentage
      : 0;

  const hasPhoto = Boolean(
    profile?.profile_image_url || profileData.profile_image_url || user?.imageUrl,
  );
  const hasPhone = Boolean(phoneNumber && phoneNumber !== "Add a phone number");
  const hasId = Boolean(profile?.government_id_url || profileData.government_id_url);
  const hasSelfie = Boolean(profile?.selfie_image_url || profileData.selfie_image_url);

  // Each step is checked independently, so a gap in the middle doesn't hide
  // the steps after it.
  const steps = [
    { label: "Profile photo", done: hasPhoto },
    { label: "Phone number", done: hasPhone },
    { label: "Government ID", done: hasId },
    { label: "Selfie verification", done: hasSelfie },
  ];
  const completedSteps = steps.filter((s) => s.done).length;
  const progressValue = Math.round((completedSteps / steps.length) * 100);

  const renderSkeleton = () => (
    <View className="px-1 py-3">
      <View className="mb-5 h-28 w-full rounded-3xl bg-[#E9EEEB]" />
      <View className="mb-4 h-24 rounded-3xl bg-[#E9EEEB]" />
      <View className="mb-4 h-32 rounded-3xl bg-[#E9EEEB]" />
      <View className="mb-4 h-24 rounded-3xl bg-[#E9EEEB]" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 140 }}>
        <Text className="my-5 text-2xl font-JakartaExtraBold text-[#101814]">
          My profile
        </Text>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            {/* ── Identity header ── */}
            <View className="mb-5 items-center rounded-3xl border border-[#E2E9E5] bg-white px-5 pb-5 pt-6">
              <View className="relative">
                <Image
                  source={{
                    uri:
                      profile?.profile_image_url ||
                      profileData.profile_image_url ||
                      user?.imageUrl ||
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
                  }}
                  className="h-[104px] w-[104px] rounded-full border-[3px] border-[#E6F2EC] bg-[#EEF1F0]"
                />
                <Pressable
                  onPress={handlePickProfilePhoto}
                  accessibilityLabel="Change profile photo"
                  className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-[#0E5C3F] active:opacity-80"
                >
                  <Ionicons name="camera" size={17} color="white" />
                </Pressable>
              </View>

              <Text className="mt-4 text-xl font-JakartaExtraBold text-[#101814]">
                {fullName}
              </Text>
              <Text className="mt-1 text-[13px] font-Jakarta text-[#68756F]">
                {emailAddress}
              </Text>
            </View>

            {/* ── Stats ── */}
            <View className="mb-5 flex-row gap-3">
              <StatCard icon="star" label="Rating" value={rating.toFixed(1)} />
              <StatCard icon="car-sport" label="Trips" value={String(totalTrips)} />
              <StatCard
                icon="shield-checkmark"
                label="Verified"
                value={`${verification}%`}
              />
            </View>

            {/* ── Verification progress ── */}
            <Pressable
              onPress={() => router.push("/(root)/verification")}
              className="mb-5 rounded-3xl border border-[#E2E9E5] bg-white p-5 active:opacity-80"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[16px] font-JakartaExtraBold text-[#101814]">
                    {progressValue === 100
                      ? "Your profile is complete"
                      : "Complete your verification"}
                  </Text>
                  <Text className="mt-1 text-[13px] font-Jakarta leading-5 text-[#68756F]">
                    {progressValue === 100
                      ? "Everything is set up. Nothing further is needed."
                      : "Verified riders get matched faster and can book premium trips."}
                  </Text>
                </View>
                <Text className="text-[20px] font-JakartaExtraBold text-[#0E5C3F]">
                  {progressValue}%
                </Text>
              </View>

              <View className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEF1F0]">
                <View
                  className="h-2 rounded-full bg-[#1FB574]"
                  style={{ width: `${progressValue}%` }}
                />
              </View>

              <View className="mt-4 gap-2.5">
                {steps.map((step) => (
                  <View key={step.label} className="flex-row items-center gap-2.5">
                    <View
                      className={`h-[18px] w-[18px] items-center justify-center rounded-full ${
                        step.done ? "bg-[#1FB574]" : "bg-[#EEF1F0]"
                      }`}
                    >
                      {step.done ? (
                        <Ionicons name="checkmark" size={11} color="#fff" />
                      ) : null}
                    </View>
                    <Text
                      className={`text-[13px] ${
                        step.done
                          ? "font-JakartaMedium text-[#101814]"
                          : "font-Jakarta text-[#68756F]"
                      }`}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>

              {progressValue < 100 && (
                <View className="mt-4 flex-row items-center gap-1.5">
                  <Text className="text-[13px] font-JakartaBold text-[#0E5C3F]">
                    Continue verification
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#0E5C3F" />
                </View>
              )}
            </Pressable>

            {/* ── Identity & security ── */}
            <Text className="mb-3 text-[15px] font-JakartaExtraBold text-[#101814]">
              Identity & security
            </Text>
            <View className="mb-5">
              <SectionCard
                title="Identity verification"
                value="ID document and selfie"
                icon="shield-checkmark-outline"
                status={hasId && hasSelfie ? "verified" : "required"}
                onPress={() => router.push("/(root)/verification")}
              />
              <SectionCard
                title="Phone verification"
                icon="call-outline"
                status={hasPhone ? "verified" : "required"}
                onPress={() =>
                  Alert.alert(
                    "Phone verification",
                    "Use Clerk phone verification when it is enabled for your account.",
                  )
                }
              />
              <SectionCard
                title="Change password"
                value="Update it here in the app"
                icon="key-outline"
                onPress={() => router.push("/(root)/change-password")}
              />
            </View>

            {/* ── Personal information ── */}
            <Text className="mb-3 text-[15px] font-JakartaExtraBold text-[#101814]">
              Personal information
            </Text>
            <View className="mb-5">
              <SectionCard
                title="Full name"
                value={fullName}
                icon="person-outline"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/edit-profile",
                    params: { field: "name", label: "Full name" },
                  })
                }
              />
              <SectionCard
                title="Email"
                value={emailAddress}
                icon="mail-outline"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/edit-profile",
                    params: { field: "email", label: "Email" },
                  })
                }
              />
              <SectionCard
                title="Phone number"
                value={phoneNumber}
                icon="call-outline"
                status={hasPhone ? "verified" : "required"}
                onPress={() =>
                  router.push({
                    pathname: "/(root)/edit-profile",
                    params: { field: "phone_number", label: "Phone number" },
                  })
                }
              />
              <SectionCard
                title="Gender"
                value={profileData.gender || "Not set"}
                icon="male-female-outline"
                onPress={() => setSheet("gender")}
              />
              <SectionCard
                title="Emergency contacts"
                value={profileData.emergency_contact || "Nobody added yet"}
                icon="alert-circle-outline"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/edit-profile",
                    params: {
                      field: "emergency_contact",
                      label: "Emergency contact",
                    },
                  })
                }
              />
            </View>

            {/* ── Ride preferences ── */}
            <Text className="mb-3 text-[15px] font-JakartaExtraBold text-[#101814]">
              Ride preferences
            </Text>
            <View className="mb-5">
              <SectionCard
                title="Preferred vehicle"
                value={profileData.preferred_vehicle || "Any vehicle"}
                icon="car-outline"
                onPress={() => setSheet("vehicle")}
              />
              <SectionCard
                title="Payment method"
                value={profileData.payment_method || "Card"}
                icon="card-outline"
                onPress={() => router.push("/(root)/payment-methods")}
              />
              <SectionCard
                title="Favourite locations"
                value={profileData.favorite_locations || "Add a favourite place"}
                icon="location-outline"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/edit-profile",
                    params: { field: "favorite_locations", label: "Favourite locations" },
                  })
                }
              />

              {/* A switch, not a row that toggles when tapped — people expect
                  to see the state before they change it */}
              <View className="mb-2.5 flex-row items-center justify-between rounded-2xl border border-[#E2E9E5] bg-white px-4 py-3.5">
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2EC]">
                    <Ionicons name="notifications-outline" size={18} color="#0E5C3F" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] font-JakartaSemiBold text-[#101814]">
                      Trip notifications
                    </Text>
                    <Text className="mt-0.5 text-[12px] font-Jakarta text-[#68756F]">
                      Driver updates and booking confirmations
                    </Text>
                  </View>
                </View>

                <Switch
                  value={Boolean(profileData.notifications_enabled)}
                  onValueChange={(value) =>
                    handleTogglePreference("notifications_enabled", value)
                  }
                  trackColor={{ false: "#DFE6E2", true: "#1FB574" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <SectionCard
                title="Language"
                value={profileData.language || "English"}
                icon="language-outline"
                onPress={() => setSheet("language")}
              />
            </View>

            {/* ── Trips ── */}
            <Text className="mb-3 text-[15px] font-JakartaExtraBold text-[#101814]">
              Trips
            </Text>
            <View className="mb-5">
              <SectionCard
                title="Trip history"
                value={
                  rideSummary.completed_trips > 0
                    ? `${rideSummary.completed_trips} completed · R${
                        typeof rideSummary.money_spent === "number"
                          ? rideSummary.money_spent.toFixed(2)
                          : "0.00"
                      } spent`
                    : "No trips yet"
                }
                icon="receipt-outline"
                onPress={() => router.push("/(root)/(tabs)/rides")}
              />
            </View>

            {/* ── Support ── */}
            <Text className="mb-3 text-[15px] font-JakartaExtraBold text-[#101814]">
              Support
            </Text>
            <View className="mb-5">
              <SectionCard
                title="WhatsApp support"
                value="Fastest reply, usually within an hour"
                icon="logo-whatsapp"
                onPress={() =>
                  openLink(`https://wa.me/${SUPPORT_WHATSAPP}`)
                }
              />
              <SectionCard
                title="Email us"
                value={SUPPORT_EMAIL}
                icon="mail-outline"
                onPress={() =>
                  openLink(
                    `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                      "Lyft support request",
                    )}&body=${encodeURIComponent(
                      `\n\n---\nAccount: ${emailAddress}\nName: ${fullName}`,
                    )}`,
                  )
                }
              />
              <SectionCard
                title="Call support"
                value={SUPPORT_PHONE}
                icon="call-outline"
                onPress={() => openLink(`tel:${SUPPORT_PHONE}`)}
              />
              <SectionCard
                title="Report a problem with a trip"
                icon="flag-outline"
                onPress={() => router.push("/(root)/(tabs)/rides")}
              />
              <SectionCard
                title="Privacy policy"
                icon="shield-checkmark-outline"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/legal",
                    params: { tab: "privacy" },
                  })
                }
              />
              <SectionCard
                title="Terms of use"
                icon="document-text-outline"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/legal",
                    params: { tab: "terms" },
                  })
                }
              />
            </View>

            {/* ── Sign out ── */}
            <SectionCard
              title="Sign out"
              icon="log-out-outline"
              tone="danger"
              onPress={handleLogout}
            />
          </>
        )}
      </ScrollView>

      {saving ? (
        <View className="absolute bottom-28 self-center flex-row items-center gap-2 rounded-full bg-[#06231A] px-4 py-2.5">
          <ActivityIndicator size="small" color="white" />
          <Text className="text-[12px] font-JakartaSemiBold text-white">
            Saving…
          </Text>
        </View>
      ) : null}

      {/* ── Pickers ── */}
      <OptionSheet
        visible={sheet === "gender"}
        title="Gender"
        subtitle="Only shown to you. Used to match riders where a preference is set."
        options={GENDER_OPTIONS}
        selected={profileData.gender}
        onSelect={(value) => savePreference("gender", value)}
        onClose={() => setSheet(null)}
      />

      <OptionSheet
        visible={sheet === "language"}
        title="Language"
        subtitle="How we'll write to you in the app and in messages."
        options={SA_LANGUAGES}
        selected={profileData.language ?? "English"}
        onSelect={(value) => savePreference("language", value)}
        onClose={() => setSheet(null)}
      />

      <OptionSheet
        visible={sheet === "vehicle"}
        title="Preferred vehicle"
        subtitle="Narrower choices can mean a longer wait for a driver."
        options={VEHICLE_OPTIONS}
        selected={profileData.preferred_vehicle ?? "Any"}
        onSelect={(value) => savePreference("preferred_vehicle", value)}
        onClose={() => setSheet(null)}
      />
    </SafeAreaView>
  );
};

export default Profile;