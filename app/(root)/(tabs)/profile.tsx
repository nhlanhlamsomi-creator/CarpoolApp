import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ImageSourcePropType,
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
import { icons } from "@/constants";
import OptionSheet, {
    GENDER_OPTIONS,
    SA_LANGUAGES,
    VEHICLE_OPTIONS,
} from "@/components/OptionSheet";
import { brand, ui } from "@/constants/theme";
import { apiRequest } from "@/lib/api";
import {
    PickedImage,
    captureImage,
    pickFromLibrary,
    uploadAvatar,
} from "@/lib/verification";

// ─── Palette ─────────────────────────────────────────────────────────────────
const PALETTE = {
  cream: ui.bg,
  sand: ui.surface,
  accent: brand.accent,
  accentDeep: brand.dark,
  accentSoft: brand.tint,
  charcoal: ui.ink,
  graphite: ui.muted,
  muted: ui.muted,
  line: ui.border,
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
    Alert.alert(
      "Can't open that",
      "No app on this phone can handle that link.",
    );
  }
};

type ProfileRecord = {
  id?: number;
  name?: string;
  email?: string;
  clerk_id?: string;
  profile_image_url?: string;
  rating?: number | string | null;
  rating_count?: number;
  total_trips?: number;
  verification_percentage?: number;
  government_id_url?: string;
  selfie_image_url?: string;
  government_id_back_url?: string;
  verification_status?: string;
  phone_number?: string;
  profile_data?: Record<string, any>;
};

type RideSummary = {
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  money_spent: number;
  favorite_driver: string;
  last_ride: string;
};

const Profile = () => {
  const { user } = useUser();
  const { signOut, getToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [rideSummary, setRideSummary] = useState<RideSummary>({
    total_trips: 0,
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
    accountLegal: boolean;
  }>({
    identitySecurity: false,
    personalInfo: false,
    ridePreferences: false,
    trips: false,
    support: false,
    accountLegal: false,
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
      const token = await getToken();
      const profileResult = await apiRequest<{ data: ProfileRecord | null }>(
        "/api/profile",
        {},
        token,
      );
      setProfile(profileResult.data ?? null);

      const rideResult = await apiRequest<{ data: RideSummary }>(
        "/api/profile/summary",
        {},
        token,
      );
      setRideSummary(rideResult.data ?? rideSummary);
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
      const token = await getToken();
      const result = await apiRequest<{ data: ProfileRecord }>(
        "/api/profile",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token,
      );

      if (result.data) {
        setProfile(result.data);
      }
    } catch (error) {
      Alert.alert(
        "Update failed",
        error instanceof Error
          ? error.message
          : "Your profile could not be saved right now.",
      );
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
    profile?.email ||
    user?.primaryEmailAddress?.emailAddress ||
    "Add your email";
  const phoneNumber =
    profile?.phone_number ||
    profileData.phone_number ||
    user?.primaryPhoneNumber?.phoneNumber ||
    "Add a phone number";
  const numericRating = Number(profile?.rating);
  const rating =
    Number.isFinite(numericRating) && numericRating > 0
      ? numericRating.toFixed(1)
      : "New";
  const totalTrips = rideSummary.total_trips;
  const verification =
    typeof profile?.verification_percentage === "number"
      ? profile.verification_percentage
      : 0;
  const verificationStatus = (profile?.verification_status ?? "Not submitted")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const hasPhoto = Boolean(
    profile?.profile_image_url ||
    profileData.profile_image_url ||
    user?.imageUrl,
  );
  const hasPhone = Boolean(phoneNumber && phoneNumber !== "Add a phone number");
  const hasId = Boolean(
    profile?.government_id_url || profileData.government_id_url,
  );
  const hasIdBack = Boolean(
    profile?.government_id_back_url || profileData.government_id_back_url,
  );
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
          backgroundColor: PALETTE.sand,
        }}
      />
      <View
        style={{
          marginBottom: 16,
          height: 96,
          borderRadius: 24,
          backgroundColor: PALETTE.sand,
        }}
      />
      <View
        style={{
          marginBottom: 16,
          height: 128,
          borderRadius: 24,
          backgroundColor: PALETTE.sand,
        }}
      />
      <View
        style={{
          marginBottom: 16,
          height: 96,
          borderRadius: 24,
          backgroundColor: PALETTE.sand,
        }}
      />
    </View>
  );

  // Section header — shared violet palette
  const renderSectionHeader = (
    title: string,
    section: keyof typeof expandedSections,
    iconName: keyof typeof Ionicons.glyphMap,
    iconBgColor: string = PALETTE.accentSoft,
    iconColor: string = PALETTE.accentDeep,
    iconSource?: ImageSourcePropType,
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
        borderColor: PALETTE.line,
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
          {iconSource ? (
            <Image
              source={iconSource}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name={iconName} size={20} color={iconColor} />
          )}
        </View>
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Jakarta-ExtraBold",
            color: PALETTE.charcoal,
          }}
        >
          {title}
        </Text>
      </View>
      <Ionicons
        name={expandedSections[section] ? "chevron-up" : "chevron-down"}
        size={22}
        color={PALETTE.muted}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.cream }}>
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={{ marginVertical: 20 }}>
          <Text className="text-[24px] font-JakartaExtraBold text-[#21152F]">
            My profile
          </Text>
        </View>

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
                borderColor: PALETTE.line,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 20,
                paddingBottom: 20,
                paddingTop: 24,
                shadowColor: PALETTE.charcoal,
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
                    borderColor: PALETTE.accentSoft,
                    backgroundColor: PALETTE.sand,
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
                    backgroundColor: PALETTE.accent,
                    shadowColor: PALETTE.accentDeep,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="camera" size={17} color={PALETTE.charcoal} />
                </Pressable>
              </View>

              <Text
                style={{
                  marginTop: 16,
                  fontSize: 20,
                  fontFamily: "Jakarta-ExtraBold",
                  color: PALETTE.charcoal,
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
                  color: PALETTE.muted,
                }}
              >
                {emailAddress}
              </Text>
            </View>

            {/* ── Profile overview ── */}
            <Text
              style={{
                marginBottom: 12,
                color: PALETTE.charcoal,
                fontSize: 16,
                fontFamily: "Jakarta-ExtraBold",
              }}
            >
              Profile overview
            </Text>
            <View style={{ marginBottom: 20, flexDirection: "row", gap: 12 }}>
              <StatCard
                icon="star"
                iconSource={icons.star}
                label="Rating"
                value={rating}
              />
              <StatCard
                icon="car-sport"
                iconSource={icons.sportsCar}
                label="Trips"
                value={String(totalTrips)}
              />
              <StatCard
                icon="shield-checkmark"
                iconSource={icons.verify}
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
                borderColor: PALETTE.line,
                backgroundColor: "#FFFFFF",
                padding: 20,
                shadowColor: PALETTE.charcoal,
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
                      color: PALETTE.charcoal,
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
                      color: PALETTE.graphite,
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
                    color: PALETTE.accentDeep,
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
                  backgroundColor: PALETTE.cream,
                }}
              >
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: PALETTE.accent,
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
                        backgroundColor: step.done
                          ? PALETTE.accent
                          : PALETTE.sand,
                      }}
                    >
                      {step.done ? (
                        <Ionicons
                          name="checkmark"
                          size={11}
                          color={PALETTE.charcoal}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: step.done ? "Jakarta-Medium" : "Jakarta",
                        color: step.done ? PALETTE.charcoal : PALETTE.muted,
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
                      color: PALETTE.accentDeep,
                    }}
                  >
                    Continue verification
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={PALETTE.accentDeep}
                  />
                </View>
              )}
            </Pressable>

            {/* ── Identity & security ── */}
            {renderSectionHeader(
              "Identity & security",
              "identitySecurity",
              "shield-checkmark",
              PALETTE.accentSoft,
              PALETTE.accentDeep,
              icons.identityAndSecurity,
            )}
            {expandedSections.identitySecurity && (
              <View style={{ marginBottom: 20 }}>
                <SectionCard
                  title="Verification status"
                  value={`${verificationStatus} · ${verification}% complete`}
                  iconSource={icons.verified}
                  status={hasId && hasSelfie ? "verified" : "required"}
                  onPress={() => router.push("/(root)/verification")}
                />
                <SectionCard
                  title="Verify identity"
                  value="Submit your documents for review"
                  iconSource={icons.verifyIdentity}
                  onPress={() => router.push("/(root)/verification")}
                />
                <SectionCard
                  title="ID document"
                  value={hasId ? "Document uploaded" : "Add the front of your ID"}
                  iconSource={icons.idDocument}
                  status={hasId ? "verified" : "required"}
                  onPress={() => router.push("/(root)/verification")}
                />
                <SectionCard
                  title="ID back (document back)"
                  value={hasIdBack ? "Document uploaded" : "Add the back of your ID"}
                  iconSource={icons.idBack}
                  status={hasIdBack ? "verified" : "required"}
                  onPress={() => router.push("/(root)/verification")}
                />
                <SectionCard
                  title="Selfie verification"
                  value={hasSelfie ? "Selfie uploaded" : "Add a verification selfie"}
                  iconSource={icons.selfie}
                  status={hasSelfie ? "verified" : "required"}
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
              PALETTE.accentSoft,
              PALETTE.accentDeep,
              icons.personalInformation,
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
                  iconSource={icons.email}
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
                  iconSource={icons.phone}
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
                  iconSource={icons.gender}
                  onPress={() => setSheet("gender")}
                />

                {/* ── Emergency contact ── */}
                <View
                  style={{
                    marginBottom: 10,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: PALETTE.line,
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
                          color: PALETTE.charcoal,
                        }}
                      >
                        Add Emergency Contact
                      </Text>

                      <Text
                        style={{
                          marginBottom: 4,
                          fontSize: 12,
                          fontFamily: "Jakarta",
                          color: PALETTE.muted,
                        }}
                      >
                        Contact Name
                      </Text>
                      <TextInput
                        style={{
                          marginBottom: 12,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: PALETTE.line,
                          backgroundColor: PALETTE.cream,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          fontFamily: "Jakarta",
                          color: PALETTE.charcoal,
                        }}
                        placeholder="e.g., John Doe"
                        placeholderTextColor={PALETTE.muted}
                        value={emergencyName}
                        onChangeText={setEmergencyName}
                      />

                      <Text
                        style={{
                          marginBottom: 4,
                          fontSize: 12,
                          fontFamily: "Jakarta",
                          color: PALETTE.muted,
                        }}
                      >
                        Phone Number (10+ digits)
                      </Text>
                      <TextInput
                        style={{
                          marginBottom: 12,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: PALETTE.line,
                          backgroundColor: PALETTE.cream,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          fontFamily: "Jakarta",
                          color: PALETTE.charcoal,
                        }}
                        placeholder="e.g., 0712345678"
                        placeholderTextColor={PALETTE.muted}
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
                            backgroundColor: PALETTE.accent,
                            borderWidth: 1.5,
                            borderColor: PALETTE.accentDeep,
                            paddingVertical: 12,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "Jakarta-Bold",
                              color: PALETTE.charcoal,
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
                            borderColor: PALETTE.line,
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
                              color: PALETTE.graphite,
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
                            backgroundColor: "#F0E6FA",
                          }}
                        >
                          <Image
                            source={icons.emergencyContacts}
                            style={{ width: 22, height: 22 }}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "Jakarta-SemiBold",
                              color: PALETTE.charcoal,
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
                                  color: PALETTE.charcoal,
                                }}
                              >
                                {emergencyContact.name}
                              </Text>
                              {emergencyContact.phone && (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: "Jakarta",
                                    color: PALETTE.muted,
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
                                color: PALETTE.muted,
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
                        color={PALETTE.muted}
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
              PALETTE.accentSoft,
              PALETTE.accentDeep,
              icons.ridePreference,
            )}
            {expandedSections.ridePreferences && (
              <View style={{ marginBottom: 20 }}>
                <SectionCard
                  title="Ride preference"
                  value={profileData.ride_preference || "No preference set"}
                  iconSource={icons.ridePreference}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/edit-profile",
                      params: {
                        field: "ride_preference",
                        label: "Ride preference",
                      },
                    })
                  }
                />
                <SectionCard
                  title="Preferred vehicle"
                  value={profileData.preferred_vehicle || "Any vehicle"}
                  iconSource={icons.preferredVehicle}
                  onPress={() => setSheet("vehicle")}
                />
                <SectionCard
                  title="Payment method"
                  value={profileData.payment_method || "Card"}
                  iconSource={icons.paymentMethod}
                  onPress={() => router.push("/(root)/payment-methods")}
                />
                <SectionCard
                  title="Favourite locations"
                  value={
                    profileData.favorite_locations || "Add a favourite place"
                  }
                  iconSource={icons.favouriteLocations}
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
                    borderColor: PALETTE.line,
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
                        backgroundColor: PALETTE.accentSoft,
                      }}
                    >
                      <Image
                        source={icons.tripNotifications}
                        style={{ width: 22, height: 22 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Jakarta-SemiBold",
                          color: PALETTE.charcoal,
                        }}
                      >
                        Trip notifications
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          fontSize: 12,
                          fontFamily: "Jakarta",
                          color: PALETTE.muted,
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
                    trackColor={{ false: PALETTE.line, true: PALETTE.accent }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <SectionCard
                  title="Language"
                  value={profileData.language || "English"}
                  iconSource={icons.language}
                  onPress={() => setSheet("language")}
                />
              </View>
            )}

            {/* ── Trips ── */}
            {renderSectionHeader(
              "Trips",
              "trips",
              "time",
              PALETTE.accentSoft,
              PALETTE.accentDeep,
              icons.trips,
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
                  iconSource={icons.tripHistory}
                  onPress={() => router.push("/(root)/(tabs)/rides")}
                />
              </View>
            )}

            {/* ── Support ── */}
            {renderSectionHeader(
              "Support",
              "support",
              "help-circle",
              PALETTE.accentSoft,
              PALETTE.accentDeep,
              icons.support,
            )}
            {expandedSections.support && (
              <View style={{ marginBottom: 20 }}>
                <SectionCard
                  title="Help & Support"
                  value="Find answers or chat with Hop On Support"
                  iconSource={icons.support}
                  onPress={() => router.push("/(root)/help-support")}
                />
                <SectionCard
                  title="WhatsApp support"
                  value="Fastest reply, usually within an hour"
                  iconSource={icons.whatsappSupport}
                  onPress={() => openLink(`https://wa.me/${SUPPORT_WHATSAPP}`)}
                />
                <SectionCard
                  title="Email us"
                  value={SUPPORT_EMAIL}
                  iconSource={icons.emailUs}
                  onPress={() =>
                    openLink(
                      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                        "Hop On support request",
                      )}&body=${encodeURIComponent(
                        `\n\n---\nAccount: ${emailAddress}\nName: ${fullName}`,
                      )}`,
                    )
                  }
                />
                <SectionCard
                  title="Call support"
                  value={SUPPORT_PHONE}
                  iconSource={icons.callSupport}
                  onPress={() => openLink(`tel:${SUPPORT_PHONE}`)}
                />
                <SectionCard
                  title="Report a problem with a trip"
                  iconSource={icons.reportAProblem}
                  onPress={() => router.push("/(root)/(tabs)/rides")}
                />
              </View>
            )}

            {/* ── Account & legal ── */}
            {renderSectionHeader(
              "Account & legal",
              "accountLegal",
              "document-text",
              PALETTE.accentSoft,
              PALETTE.accentDeep,
              icons.termsOfUse,
            )}
            {expandedSections.accountLegal && (
              <View style={{ marginBottom: 20 }}>
                <SectionCard
                  title="Privacy policy"
                  iconSource={icons.privacyPolicy}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/legal",
                      params: { tab: "privacy" },
                    })
                  }
                />
                <SectionCard
                  title="Terms of use"
                  iconSource={icons.termsOfUse}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/legal",
                      params: { tab: "terms" },
                    })
                  }
                />
                <SectionCard
                  title="Sign out"
                  iconSource={icons.signOut}
                  tone="danger"
                  onPress={handleLogout}
                />
              </View>
            )}
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
            backgroundColor: PALETTE.charcoal,
            paddingHorizontal: 16,
            paddingVertical: 10,
            shadowColor: PALETTE.charcoal,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 14,
            elevation: 6,
          }}
        >
          <ActivityIndicator size="small" color={PALETTE.accent} />
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
