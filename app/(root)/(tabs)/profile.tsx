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
  TextInput,
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

// ─── Support contacts ───────────────────────────────────────────────────────
const SUPPORT_EMAIL = "support@lyftcarpool.co.za";
const SUPPORT_PHONE = "+27110000000";
const SUPPORT_WHATSAPP = "27110000000";

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
  const [expandedSections, setExpandedSections] = useState<{
    identitySecurity: boolean;
    personalInfo: boolean;
    ridePreferences: boolean;
    trips: boolean;
    support: boolean;
  }>({
    identitySecurity: false,
    personalInfo: false,
    ridePreferences: false,
    trips: false,
    support: false,
  });

  const [editingEmergency, setEditingEmergency] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [user?.id]),
  );

  const saveProfile = async (payload: Record<string, unknown>) => {
    if (!user?.id) return;

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

  const saveEmergencyContact = async () => {
    if (!emergencyName.trim()) {
      Alert.alert("Error", "Please enter a contact name");
      return;
    }
    if (emergencyPhone.trim() && emergencyPhone.trim().length < 10) {
      Alert.alert("Error", "Phone number must be at least 10 digits");
      return;
    }

    const contactData = JSON.stringify({
      name: emergencyName.trim(),
      phone: emergencyPhone.trim(),
    });

    await savePreference("emergency_contact", contactData);
    setEditingEmergency(false);
    setEmergencyName("");
    setEmergencyPhone("");
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
  const totalTrips =
    typeof profile?.total_trips === "number" ? profile.total_trips : 0;
  const verification =
    typeof profile?.verification_percentage === "number"
      ? profile.verification_percentage
      : 0;

  const hasPhoto = Boolean(
    profile?.profile_image_url || profileData.profile_image_url || user?.imageUrl,
  );
  const hasPhone = Boolean(phoneNumber && phoneNumber !== "Add a phone number");
  const hasId = Boolean(profile?.government_id_url || profileData.government_id_url);
  const hasSelfie = Boolean(
    profile?.selfie_image_url || profileData.selfie_image_url,
  );

  const steps = [
    { label: "Profile photo", done: hasPhoto },
    { label: "Phone number", done: hasPhone },
    { label: "Government ID", done: hasId },
    { label: "Selfie verification", done: hasSelfie },
  ];
  const completedSteps = steps.filter((s) => s.done).length;
  const progressValue = Math.round((completedSteps / steps.length) * 100);

  let emergencyContact = { name: "Nobody added yet", phone: "" };
  if (
    profileData.emergency_contact &&
    profileData.emergency_contact !== "Nobody added yet"
  ) {
    try {
      const parsed = JSON.parse(profileData.emergency_contact);
      emergencyContact = {
        name: parsed.name || "Unknown",
        phone: parsed.phone || "",
      };
    } catch (e) {
      emergencyContact = { name: profileData.emergency_contact, phone: "" };
    }
  }

  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: 4, paddingVertical: 12 }}>
      <View
        style={{
          marginBottom: 20,
          height: 112,
          width: "100%",
          borderRadius: 24,
          backgroundColor: WARM.sand,
        }}
      />
      <View
        style={{
          marginBottom: 16,
          height: 96,
          borderRadius: 24,
          backgroundColor: WARM.sand,
        }}
      />
      <View
        style={{
          marginBottom: 16,
          height: 128,
          borderRadius: 24,
          backgroundColor: WARM.sand,
        }}
      />
      <View
        style={{
          marginBottom: 16,
          height: 96,
          borderRadius: 24,
          backgroundColor: WARM.sand,
        }}
      />
    </View>
  );

  // Section header — warm palette
  const renderSectionHeader = (
    title: string,
    section: keyof typeof expandedSections,
    iconName: string,
    iconBgColor: string = WARM.goldSoft,
    iconColor: string = WARM.goldDeep,
  ) => (
    <Pressable
      onPress={() => toggleSection(section)}
      style={{
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: WARM.line,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor: iconBgColor,
          }}
        >
          <Ionicons name={iconName as any} size={20} color={iconColor} />
        </View>
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Jakarta-ExtraBold",
            color: WARM.charcoal,
          }}
        >
          {title}
        </Text>
      </View>
      <Ionicons
        name={expandedSections[section] ? "chevron-up" : "chevron-down"}
        size={22}
        color={WARM.muted}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WARM.cream }}>
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text
          style={{
            marginVertical: 20,
            fontSize: 24,
            fontFamily: "Jakarta-ExtraBold",
            color: WARM.charcoal,
          }}
        >
          My profile
        </Text>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            {/* ── Identity header ── */}
            <View
              style={{
                marginBottom: 20,
                alignItems: "center",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: WARM.line,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 20,
                paddingBottom: 20,
                paddingTop: 24,
                shadowColor: WARM.charcoal,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.06,
                shadowRadius: 22,
                elevation: 5,
              }}
            >
              <View style={{ position: "relative" }}>
                <Image
                  source={{
                    uri:
                      profile?.profile_image_url ||
                      profileData.profile_image_url ||
                      user?.imageUrl ||
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
                  }}
                  style={{
                    height: 104,
                    width: 104,
                    borderRadius: 52,
                    borderWidth: 3,
                    borderColor: WARM.goldSoft,
                    backgroundColor: WARM.sand,
                  }}
                />
                <Pressable
                  onPress={handlePickProfilePhoto}
                  accessibilityLabel="Change profile photo"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    height: 40,
                    width: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 20,
                    borderWidth: 3,
                    borderColor: "#FFFFFF",
                    backgroundColor: WARM.gold,
                    shadowColor: WARM.goldDeep,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="camera" size={17} color={WARM.charcoal} />
                </Pressable>
              </View>

              <Text
                style={{
                  marginTop: 16,
                  fontSize: 20,
                  fontFamily: "Jakarta-ExtraBold",
                  color: WARM.charcoal,
                  letterSpacing: -0.3,
                }}
              >
                {fullName}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontFamily: "Jakarta",
                  color: WARM.muted,
                }}
              >
                {emailAddress}
              </Text>
            </View>

            {/* ── Stats ── */}
            <View style={{ marginBottom: 20, flexDirection: "row", gap: 12 }}>
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
              style={{
                marginBottom: 20,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: WARM.line,
                backgroundColor: "#FFFFFF",
                padding: 20,
                shadowColor: WARM.charcoal,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.05,
                shadowRadius: 18,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Jakarta-ExtraBold",
                      color: WARM.charcoal,
                    }}
                  >
                    {progressValue === 100
                      ? "Your profile is complete"
                      : "Complete your verification"}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontFamily: "Jakarta",
                      lineHeight: 20,
                      color: WARM.graphite,
                    }}
                  >
                    {progressValue === 100
                      ? "Everything is set up. Nothing further is needed."
                      : "Verified riders get matched faster and can book premium trips."}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Jakarta-ExtraBold",
                    color: WARM.goldDeep,
                  }}
                >
                  {progressValue}%
                </Text>
              </View>

              <View
                style={{
                  marginTop: 16,
                  height: 8,
                  overflow: "hidden",
                  borderRadius: 4,
                  backgroundColor: WARM.cream,
                }}
              >
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: WARM.gold,
                    width: `${progressValue}%`,
                  }}
                />
              </View>

              <View style={{ marginTop: 16, gap: 10 }}>
                {steps.map((step) => (
                  <View
                    key={step.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        height: 18,
                        width: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9,
                        backgroundColor: step.done ? WARM.gold : WARM.sand,
                      }}
                    >
                      {step.done ? (
                        <Ionicons
                          name="checkmark"
                          size={11}
                          color={WARM.charcoal}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: step.done ? "Jakarta-Medium" : "Jakarta",
                        color: step.done ? WARM.charcoal : WARM.muted,
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>

              {progressValue < 100 && (
                <View
                  style={{
                    marginTop: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Jakarta-Bold",
                      color: WARM.goldDeep,
                    }}
                  >
                    Continue verification
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={WARM.goldDeep}
                  />
                </View>
              )}
            </Pressable>

            {/* ── Identity & security ── */}
            {renderSectionHeader(
              "Identity & security",
              "identitySecurity",
              "shield-checkmark",
              WARM.goldSoft,
              WARM.goldDeep,
            )}
            {expandedSections.identitySecurity && (
              <View style={{ marginBottom: 20 }}>
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
            )}

            {/* ── Personal information ── */}
            {renderSectionHeader(
              "Personal information",
              "personalInfo",
              "person",
              "#E8EEF7",
              "#4A6FA5",
            )}
            {expandedSections.personalInfo && (
              <View style={{ marginBottom: 20 }}>
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

                {/* ── Emergency contact ── */}
                <View
                  style={{
                    marginBottom: 10,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: WARM.line,
                    backgroundColor: "#FFFFFF",
                    overflow: "hidden",
                  }}
                >
                  {editingEmergency ? (
                    <View style={{ padding: 16 }}>
                      <Text
                        style={{
                          marginBottom: 12,
                          fontSize: 14,
                          fontFamily: "Jakarta-SemiBold",
                          color: WARM.charcoal,
                        }}
                      >
                        Add Emergency Contact
                      </Text>

                      <Text
                        style={{
                          marginBottom: 4,
                          fontSize: 12,
                          fontFamily: "Jakarta",
                          color: WARM.muted,
                        }}
                      >
                        Contact Name
                      </Text>
                      <TextInput
                        style={{
                          marginBottom: 12,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: WARM.line,
                          backgroundColor: WARM.cream,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          fontFamily: "Jakarta",
                          color: WARM.charcoal,
                        }}
                        placeholder="e.g., John Doe"
                        placeholderTextColor={WARM.muted}
                        value={emergencyName}
                        onChangeText={setEmergencyName}
                      />

                      <Text
                        style={{
                          marginBottom: 4,
                          fontSize: 12,
                          fontFamily: "Jakarta",
                          color: WARM.muted,
                        }}
                      >
                        Phone Number (10+ digits)
                      </Text>
                      <TextInput
                        style={{
                          marginBottom: 12,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: WARM.line,
                          backgroundColor: WARM.cream,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          fontFamily: "Jakarta",
                          color: WARM.charcoal,
                        }}
                        placeholder="e.g., 0712345678"
                        placeholderTextColor={WARM.muted}
                        value={emergencyPhone}
                        onChangeText={setEmergencyPhone}
                        keyboardType="phone-pad"
                        maxLength={15}
                      />

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Pressable
                          onPress={saveEmergencyContact}
                          style={{
                            flex: 1,
                            borderRadius: 14,
                            backgroundColor: WARM.gold,
                            borderWidth: 1.5,
                            borderColor: WARM.goldDeep,
                            paddingVertical: 12,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "Jakarta-Bold",
                              color: WARM.charcoal,
                            }}
                          >
                            Save
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            setEditingEmergency(false);
                            setEmergencyName("");
                            setEmergencyPhone("");
                          }}
                          style={{
                            flex: 1,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: WARM.line,
                            backgroundColor: "#FFFFFF",
                            paddingVertical: 12,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "Jakarta-Bold",
                              color: WARM.graphite,
                            }}
                          >
                            Cancel
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => setEditingEmergency(true)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            height: 40,
                            width: 40,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 14,
                            backgroundColor: "#FCEBC4",
                          }}
                        >
                          <Ionicons
                            name="alert-circle-outline"
                            size={18}
                            color="#E0A11E"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "Jakarta-SemiBold",
                              color: WARM.charcoal,
                            }}
                          >
                            Emergency contact
                          </Text>
                          {emergencyContact.name !== "Nobody added yet" ? (
                            <>
                              <Text
                                style={{
                                  marginTop: 2,
                                  fontSize: 13,
                                  fontFamily: "Jakarta-Medium",
                                  color: WARM.charcoal,
                                }}
                              >
                                {emergencyContact.name}
                              </Text>
                              {emergencyContact.phone && (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: "Jakarta",
                                    color: WARM.muted,
                                  }}
                                >
                                  {emergencyContact.phone}
                                </Text>
                              )}
                            </>
                          ) : (
                            <Text
                              style={{
                                marginTop: 2,
                                fontSize: 13,
                                fontFamily: "Jakarta",
                                color: WARM.muted,
                              }}
                            >
                              Add emergency contact
                            </Text>
                          )}
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={WARM.muted}
                      />
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* ── Ride preferences ── */}
            {renderSectionHeader(
              "Ride preferences",
              "ridePreferences",
              "car",
              "#EEF7EE",
              "#2E7D32",
            )}
            {expandedSections.ridePreferences && (
              <View style={{ marginBottom: 20 }}>
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
                      params: {
                        field: "favorite_locations",
                        label: "Favourite locations",
                      },
                    })
                  }
                />

                <View
                  style={{
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: WARM.line,
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 14,
                        backgroundColor: WARM.goldSoft,
                      }}
                    >
                      <Ionicons
                        name="notifications-outline"
                        size={18}
                        color={WARM.goldDeep}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Jakarta-SemiBold",
                          color: WARM.charcoal,
                        }}
                      >
                        Trip notifications
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          fontSize: 12,
                          fontFamily: "Jakarta",
                          color: WARM.muted,
                        }}
                      >
                        Driver updates and booking confirmations
                      </Text>
                    </View>
                  </View>

                  <Switch
                    value={Boolean(profileData.notifications_enabled)}
                    onValueChange={(value) =>
                      handleTogglePreference("notifications_enabled", value)
                    }
                    trackColor={{ false: WARM.line, true: WARM.gold }}
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
            )}

            {/* ── Trips ── */}
            {renderSectionHeader(
              "Trips",
              "trips",
              "time",
              "#F3E5F5",
              "#7B1FA2",
            )}
            {expandedSections.trips && (
              <View style={{ marginBottom: 20 }}>
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
            )}

            {/* ── Support ── */}
            {renderSectionHeader(
              "Support",
              "support",
              "help-circle",
              "#FFEBEE",
              "#C62828",
            )}
            {expandedSections.support && (
              <View style={{ marginBottom: 20 }}>
                <SectionCard
                  title="WhatsApp support"
                  value="Fastest reply, usually within an hour"
                  icon="logo-whatsapp"
                  onPress={() => openLink(`https://wa.me/${SUPPORT_WHATSAPP}`)}
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
            )}

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
        <View
          style={{
            position: "absolute",
            bottom: 112,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            backgroundColor: WARM.charcoal,
            paddingHorizontal: 16,
            paddingVertical: 10,
            shadowColor: WARM.charcoal,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 14,
            elevation: 6,
          }}
        >
          <ActivityIndicator size="small" color={WARM.gold} />
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Jakarta-SemiBold",
              color: "#FFFFFF",
            }}
          >
            Saving…
          </Text>
        </View>
      ) : null}

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