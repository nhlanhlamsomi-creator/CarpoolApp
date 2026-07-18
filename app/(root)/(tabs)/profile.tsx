import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileSectionCard from "@/components/ProfileSectionCard";
import StatCard from "@/components/StatCard";
import { fetchAPI } from "@/lib/fetch";

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
    Alert.alert(
      "Profile photo",
      "Photo upload will be enabled here once the media picker module is available in this build.",
    );
  };

  const handleGovernmentIdUpload = async () => {
    Alert.alert(
      "Government ID",
      "Document upload will be enabled here once the picker module is available in this build.",
    );
  };

  const handleOpenSelfieCamera = async () => {
    Alert.alert(
      "Selfie verification",
      "Selfie capture will be enabled here once camera support is available in this build.",
    );
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
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
    profile?.phone_number || profileData.phone_number || user?.primaryPhoneNumber?.phoneNumber || "Add a phone number";
  const rating = typeof profile?.rating === "number" ? profile.rating : 5.0;
  const totalTrips = typeof profile?.total_trips === "number" ? profile.total_trips : 0;
  const verification = typeof profile?.verification_percentage === "number" ? profile.verification_percentage : 0;
  const completedSteps = [
    Boolean(profile?.profile_image_url || profileData.profile_image_url || user?.imageUrl),
    Boolean(phoneNumber && phoneNumber !== "Add a phone number"),
    Boolean(profile?.government_id_url || profileData.government_id_url),
    Boolean(profile?.selfie_image_url || profileData.selfie_image_url),
  ].filter(Boolean).length;
  const progressValue = Math.round((completedSteps / 4) * 100);

  const renderSkeleton = () => (
    <View className="px-1 py-3">
      <View className="mb-5 h-24 w-full rounded-3xl bg-neutral-200" />
      <View className="mb-4 h-24 rounded-3xl bg-neutral-200" />
      <View className="mb-4 h-28 rounded-3xl bg-neutral-200" />
      <View className="mb-4 h-24 rounded-3xl bg-neutral-200" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 140 }}>
        <Text className="my-5 text-2xl font-JakartaBold text-neutral-900">
          My profile
        </Text>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            <View className="my-4 items-center justify-center">
              <View className="relative">
                <Image
                  source={{
                    uri:
                      profile?.profile_image_url ||
                      profileData.profile_image_url ||
                      user?.imageUrl ||
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
                  }}
                  className="h-[120px] w-[120px] rounded-full border-[3px] border-white"
                />
                <Pressable
                  onPress={handlePickProfilePhoto}
                  className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-black"
                >
                  <Ionicons name="camera" size={18} color="white" />
                </Pressable>
              </View>
              <Text className="mt-4 text-xl font-JakartaBold text-neutral-900">
                {fullName}
              </Text>
              <Text className="mt-1 text-sm text-neutral-500">{emailAddress}</Text>
            </View>

            <View className="mb-5 flex-row gap-3">
              <StatCard icon="⭐" label="Rating" value={rating.toFixed(1)} />
              <StatCard icon="🚗" label="Trips" value={String(totalTrips)} />
              <StatCard icon="✔️" label="Verification" value={`${verification}%`} />
            </View>

            <View className="mb-5 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-200">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-lg font-JakartaBold text-neutral-900">
                    Complete your verification
                  </Text>
                  <Text className="mt-1 text-sm text-neutral-500">
                    Complete your profile to unlock all features.
                  </Text>
                </View>
                <Text className="text-lg font-JakartaBold text-neutral-900">
                  {progressValue}%
                </Text>
              </View>

              <View className="mt-4 h-2 rounded-full bg-neutral-100">
                <View
                  className="h-2 rounded-full bg-black"
                  style={{ width: `${progressValue}%` }}
                />
              </View>

              <View className="mt-4 gap-2">
                {[
                  "Profile Photo",
                  "Phone Number",
                  "Government ID",
                  "Selfie Verification",
                ].map((step, index) => {
                  const isComplete = index < completedSteps;
                  return (
                    <View key={step} className="flex-row items-center">
                      <View
                        className={`mr-3 h-2.5 w-2.5 rounded-full ${isComplete ? "bg-black" : "bg-neutral-300"}`}
                      />
                      <Text className="text-sm text-neutral-600">{step}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-3 text-lg font-JakartaBold text-neutral-900">
                Identity & Security
              </Text>
              <View className="gap-3">
                <ProfileSectionCard
                  title="Government ID"
                  value={profile?.government_id_url || profileData.government_id_url ? "Submitted" : "Not Submitted"}
                  icon="document-text"
                  onPress={handleGovernmentIdUpload}
                />
                <ProfileSectionCard
                  title="Selfie Verification"
                  value={profile?.selfie_image_url || profileData.selfie_image_url ? "Verified" : "Not Verified"}
                  icon="camera"
                  onPress={handleOpenSelfieCamera}
                />
                <ProfileSectionCard
                  title="Phone Verification"
                  value={phoneNumber && phoneNumber !== "Add a phone number" ? "Verified" : "Verify"}
                  icon="call"
                  onPress={() =>
                    Alert.alert("Phone verification", "Use Clerk phone verification when it is enabled for your account.")
                  }
                />
                <ProfileSectionCard
                  title="Change Password"
                  value="Reset or manage"
                  icon="key"
                  onPress={() => Linking.openURL("https://accounts.clerk.com/")}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-3 text-lg font-JakartaBold text-neutral-900">
                Personal Information
              </Text>
              <View className="gap-3">
                <ProfileSectionCard
                  title="Full Name"
                  value={fullName}
                  icon="person"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "name", label: "Full Name" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Email"
                  value={emailAddress}
                  icon="mail"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "email", label: "Email" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Phone Number"
                  value={phoneNumber}
                  icon="call"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "phone_number", label: "Phone Number" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Gender"
                  value={profileData.gender || "Not provided"}
                  icon="male-female"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "gender", label: "Gender" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Date of Birth"
                  value={profileData.date_of_birth || "Not provided"}
                  icon="calendar"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "date_of_birth", label: "Date of Birth" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Home Address"
                  value={profileData.home_address || "Not provided"}
                  icon="home"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "home_address", label: "Home Address" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Emergency Contact"
                  value={profileData.emergency_contact || "Not provided"}
                  icon="warning"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "emergency_contact", label: "Emergency Contact" },
                    })
                  }
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-3 text-lg font-JakartaBold text-neutral-900">
                Ride Preferences
              </Text>
              <View className="gap-3">
                <ProfileSectionCard
                  title="Preferred Vehicle"
                  value={profileData.preferred_vehicle || "Standard"}
                  icon="car"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "preferred_vehicle", label: "Preferred Vehicle" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Payment Method"
                  value={profileData.payment_method || "Cash"}
                  icon="card"
                  onPress={() => router.push("/(root)/payment-methods")}
                />
                <ProfileSectionCard
                  title="Favorite Locations"
                  value={profileData.favorite_locations || "Add a favorite place"}
                  icon="location"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "favorite_locations", label: "Favorite Locations" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Notifications"
                  value={profileData.notifications_enabled ? "On" : "Off"}
                  icon="notifications"
                  onPress={() => handleTogglePreference("notifications_enabled", !profileData.notifications_enabled)}
                />
                <ProfileSectionCard
                  title="Language"
                  value={profileData.language || "English"}
                  icon="language"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: { field: "language", label: "Language" },
                    })
                  }
                />
                <ProfileSectionCard
                  title="Dark Mode"
                  value={profileData.dark_mode ? "On" : "Off"}
                  icon="moon"
                  onPress={() => handleTogglePreference("dark_mode", !profileData.dark_mode)}
                />
              </View>
            </View>

            <View className="mb-5 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-200">
              <Text className="text-lg font-JakartaBold text-neutral-900">
                Ride History Summary
              </Text>
              <View className="mt-3 gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-neutral-500">Completed Trips</Text>
                  <Text className="font-JakartaSemiBold text-neutral-900">
                    {rideSummary.completed_trips}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-neutral-500">Cancelled Trips</Text>
                  <Text className="font-JakartaSemiBold text-neutral-900">
                    {rideSummary.cancelled_trips}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-neutral-500">Money Spent</Text>
                  <Text className="font-JakartaSemiBold text-neutral-900">
                    ${typeof rideSummary.money_spent === "number" ? rideSummary.money_spent.toFixed(2) : "0.00"}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-neutral-500">Favorite Driver</Text>
                  <Text className="font-JakartaSemiBold text-neutral-900">
                    {rideSummary.favorite_driver}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-neutral-500">Last Ride</Text>
                  <Text className="font-JakartaSemiBold text-neutral-900">
                    {rideSummary.last_ride}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-3 text-lg font-JakartaBold text-neutral-900">
                Support
              </Text>
              <View className="gap-3">
                <ProfileSectionCard title="Help Center" icon="help-circle" onPress={() => Alert.alert("Help Center", "Support articles will be available soon.")} />
                <ProfileSectionCard title="Report a Problem" icon="alert-circle" onPress={() => Alert.alert("Report a Problem", "Your message will be routed to support.")} />
                <ProfileSectionCard title="Privacy Policy" icon="shield-checkmark" onPress={() => Alert.alert("Privacy Policy", "Policy details will be added soon.")} />
                <ProfileSectionCard title="Terms & Conditions" icon="document-text" onPress={() => Alert.alert("Terms", "Terms will be added soon.")} />
                <ProfileSectionCard title="About" icon="information-circle" onPress={() => Alert.alert("About", "Uber-style profile experience.")} />
                <ProfileSectionCard title="Contact Support" icon="chatbubble-ellipses" onPress={() => Alert.alert("Support", "Support team can be reached soon.")} />
              </View>
            </View>

            <Pressable
              onPress={handleLogout}
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4"
            >
              <Text className="text-center text-sm font-JakartaBold text-red-600">
                Logout
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {saving ? (
        <View className="absolute bottom-4 right-4 rounded-full bg-black/80 px-3 py-2">
          <ActivityIndicator color="white" />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default Profile;
