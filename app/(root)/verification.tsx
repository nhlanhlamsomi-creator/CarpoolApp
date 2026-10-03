import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ImageSourcePropType,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import {
    CheckIdResponse,
    CheckIdServiceError,
    verifySouthAfricanID,
} from "@/lib/checkIdService";
import { fetchAPI } from "@/lib/fetch";
import {
    crossCheckProfile,
    formatIdNumber,
    normaliseIdNumber,
    validateSaIdNumber,
} from "@/lib/sa-id";
import {
    DOC_LABELS,
    DocKind,
    PickedImage,
    VerificationStatus,
    captureImage,
    pickFromLibrary,
    submitForReview,
    uploadDocument,
} from "@/lib/verification";

type Picked = Partial<Record<DocKind, PickedImage>>;

const STATUS_BANNER: Record<
  VerificationStatus,
  {
    bg: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconSource?: ImageSourcePropType;
    title: string;
    body: string;
    tint: string;
  }
> = {
  not_submitted: {
    bg: "bg-[#F0E6FA]",
    tint: "#5A189A",
    icon: "shield-outline",
    iconSource: icons.verifyIdentity,
    title: "Verify your identity",
    body: "This takes about two minutes and only has to be done once.",
  },
  pending: {
    bg: "bg-[#F0E6FA]",
    tint: "#5A189A",
    icon: "time-outline",
    title: "We're reviewing your documents",
    body: "Most checks finish within 24 hours. We'll notify you either way.",
  },
  approved: {
    bg: "bg-[#F0E6FA]",
    tint: "#5A189A",
    icon: "shield-checkmark",
    iconSource: icons.verified,
    title: "You're verified",
    body: "Your identity is confirmed. Nothing further is needed.",
  },
  rejected: {
    bg: "bg-[#FEF3F3]",
    tint: "#B02A2A",
    icon: "alert-circle-outline",
    title: "We couldn't verify these documents",
    body: "Check the reason below and upload a new photo.",
  },
};

const Verification = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [status, setStatus] = useState<VerificationStatus>("not_submitted");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [profileGender, setProfileGender] = useState<string | null>(null);

  const [idInput, setIdInput] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [idVerification, setIdVerification] = useState<CheckIdResponse | null>(
    null,
  );
  const [idVerificationError, setIdVerificationError] = useState<string | null>(
    null,
  );
  const [verifyingId, setVerifyingId] = useState(false);

  const [picked, setPicked] = useState<Picked>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyKind, setBusyKind] = useState<DocKind | null>(null);

  // ── Live ID number check ───────────────────────────────────────────────────
  // Runs on every keystroke, but only surfaces an error once 13 digits are in
  // — telling someone their number is "too short" while they're still typing
  // it is just noise.
  const idResult = useMemo(() => validateSaIdNumber(idInput), [idInput]);
  const idDigits = normaliseIdNumber(idInput).length;
  const showIdError = idTouched && idDigits >= 13 && !idResult.valid;

  const warnings = useMemo(() => {
    if (!idResult.valid) return [];
    return crossCheckProfile(idResult, { gender: profileGender });
  }, [idResult, profileGender]);

  // ── Load current status ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const result = await fetchAPI(
          `/(api)/profile?clerkId=${encodeURIComponent(user.id)}`,
        );
        const record = result?.data ?? {};

        setStatus(
          (record.verification_status as VerificationStatus) ?? "not_submitted",
        );
        setRejectionReason(record.verification_rejection_reason ?? null);
        setProfileGender(record.profile_data?.gender ?? null);
        if (record.id_number) setIdInput(record.id_number);
        if (record.id_verified) {
          setIdVerification({
            idNumber: record.id_number ?? "",
            isValid: true,
            dob: record.date_of_birth,
            citizenship: record.id_citizenship,
          });
        }
      } catch (error) {
        console.warn("Could not load verification status", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  // ── Choosing a document ────────────────────────────────────────────────────
  const choose = (kind: DocKind) => {
    const run = async (fn: () => Promise<PickedImage | null>) => {
      setBusyKind(kind);
      try {
        const image = await fn();
        if (image) setPicked((prev) => ({ ...prev, [kind]: image }));
      } catch (error: any) {
        Alert.alert("Can't open that", error?.message ?? "Please try again.");
      } finally {
        setBusyKind(null);
      }
    };

    if (kind === "selfie") {
      // A selfie from the library defeats the purpose, so camera only.
      run(() => captureImage(true));
      return;
    }

    Alert.alert(DOC_LABELS[kind].title, "How would you like to add this?", [
      { text: "Take a photo", onPress: () => run(() => captureImage(false)) },
      { text: "Choose from library", onPress: () => run(pickFromLibrary) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ── Submitting ─────────────────────────────────────────────────────────────
  const canSubmit =
    idResult.valid &&
    idVerification?.isValid === true &&
    Boolean(picked.id_front && picked.selfie) &&
    !submitting;

  const verifyId = async () => {
    if (verifyingId) return;

    const normalisedId = normaliseIdNumber(idInput);
    setIdTouched(true);
    setIdVerificationError(null);

    if (!/^\d{13}$/.test(normalisedId)) {
      setIdVerification(null);
      setIdVerificationError("Enter exactly 13 digits before verifying.");
      return;
    }

    setVerifyingId(true);
    try {
      const result = await verifySouthAfricanID(normalisedId, await getToken());

      if (!result.isValid) {
        setIdVerification(null);
        setIdVerificationError(
          "ID could not be verified.\nPlease check the ID number and try again.",
        );
        return;
      }

      setIdVerification(result);
    } catch (error) {
      setIdVerification(null);

      if (error instanceof CheckIdServiceError && error.status === 401) {
        setIdVerificationError(
          "ID verification service authentication failed.\nPlease try again later.",
        );
      } else if (
        error instanceof CheckIdServiceError &&
        error.status === 400
      ) {
        setIdVerificationError(
          "ID could not be verified.\nPlease check the ID number and try again.",
        );
      } else {
        setIdVerificationError(
          "Unable to verify your ID right now.\nPlease check your internet connection and try again.",
        );
      }
    } finally {
      setVerifyingId(false);
    }
  };

  const submit = async () => {
    if (
      !user?.id ||
      !picked.id_front ||
      !picked.selfie ||
      !idResult.valid ||
      idVerification?.isValid !== true
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const [idFrontPath, selfiePath, idBackPath] = await Promise.all([
        uploadDocument(user.id, "id_front", picked.id_front),
        uploadDocument(user.id, "selfie", picked.selfie),
        picked.id_back
          ? uploadDocument(user.id, "id_back", picked.id_back)
          : Promise.resolve(undefined),
      ]);

      await submitForReview(user.id, {
        government_id_url: idFrontPath,
        government_id_back_url: idBackPath,
        selfie_image_url: selfiePath,
        id_number: idResult.idNumber,
        id_verified: true,
        date_of_birth: idResult.dateOfBirth,
        id_citizenship: idResult.citizenship,
        verification_warnings: warnings,
      });

      setStatus("pending");
      setPicked({});
      setRejectionReason(null);
    } catch (error: any) {
      Alert.alert(
        "Upload failed",
        error?.message ?? "We couldn't send your documents. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const banner = STATUS_BANNER[status];
  const locked = status === "pending" || status === "approved";

  // ── Document row ───────────────────────────────────────────────────────────
  const DocRow = ({
    kind,
    optional,
  }: {
    kind: DocKind;
    optional?: boolean;
  }) => {
    const image = picked[kind];
    const busy = busyKind === kind;
    const label = DOC_LABELS[kind];
    const iconSource = {
      id_front: icons.idDocument,
      id_back: icons.idBack,
      selfie: icons.selfie,
    }[kind];

    return (
      <Pressable
        onPress={() => !locked && !busy && choose(kind)}
        disabled={locked || busy}
        className={`mb-3 flex-row items-center rounded-2xl border-[1.5px] p-3.5 ${
          image ? "border-[#5A189A] bg-[#F0E6FA]" : "border-[#E9E2F0] bg-white"
        } ${locked ? "opacity-60" : "active:opacity-80"}`}
      >
        {image ? (
          <Image
            source={{ uri: image.uri }}
            className="h-14 w-14 rounded-xl bg-[#F0E6FA]"
          />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-[#F0E6FA]">
            <Image
              source={iconSource}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
              accessibilityLabel={`${label.title} icon`}
            />
          </View>
        )}

        <View className="ml-3.5 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[14.5px] font-JakartaBold text-[#21152F]">
              {label.title}
            </Text>
            {optional && (
              <Text className="text-[10.5px] font-JakartaMedium text-[#A69BAF]">
                Optional
              </Text>
            )}
          </View>

          <Text
            className="mt-1 text-[11.5px] font-Jakarta leading-4 text-[#746A7E]"
            numberOfLines={2}
          >
            {image ? "Ready to submit. Tap to replace." : label.help}
          </Text>
        </View>

        <View className="ml-2">
          {busy ? (
            <ActivityIndicator size="small" color="#5A189A" />
          ) : image ? (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-[#9D4EDD]">
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          ) : (
            <Ionicons name="add-circle-outline" size={22} color="#A69BAF" />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F4FB]">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl border border-[#E9E2F0] bg-white active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color="#21152F" />
        </Pressable>
        <Text className="text-[19px] font-JakartaExtraBold text-[#21152F]">
          Identity verification
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5A189A" />
        </View>
      ) : (
        <ScrollView
          className="px-5"
          contentContainerStyle={{ paddingBottom: 48, paddingTop: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Status banner */}
          <View className={`mb-5 rounded-3xl p-5 ${banner.bg}`}>
            {banner.iconSource ? (
              <Image
                source={banner.iconSource}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
                accessibilityLabel="Verification status icon"
              />
            ) : (
              <Ionicons name={banner.icon} size={26} color={banner.tint} />
            )}
            <Text
              className="mt-3 text-[17px] font-JakartaExtraBold"
              style={{ color: banner.tint }}
            >
              {banner.title}
            </Text>
            <Text className="mt-1.5 text-[13px] font-Jakarta leading-5 text-[#746A7E]">
              {banner.body}
            </Text>

            {status === "rejected" && !!rejectionReason && (
              <View className="mt-3 rounded-2xl bg-white/70 px-3.5 py-3">
                <Text className="text-[11px] font-JakartaBold uppercase tracking-wider text-[#B02A2A]">
                  Reason
                </Text>
                <Text className="mt-1 text-[13px] font-JakartaMedium text-[#21152F]">
                  {rejectionReason}
                </Text>
              </View>
            )}
          </View>

          {status !== "approved" && (
            <>
              {/* ── Step 1: ID number ── */}
              <Text className="mb-3 text-[15px] font-JakartaExtraBold text-[#21152F]">
                Your ID number
              </Text>

              <View className="mb-3 rounded-2xl border border-[#E9E2F0] bg-white p-4">
                <TextInput
                  value={formatIdNumber(idInput)}
                  onChangeText={(text) => {
                    setIdInput(normaliseIdNumber(text).slice(0, 13));
                    setIdTouched(true);
                    setIdVerification(null);
                    setIdVerificationError(null);
                  }}
                  editable={!locked}
                  placeholder="000000 0000 000"
                  placeholderTextColor="#C9D2CD"
                  keyboardType="number-pad"
                  maxLength={15} // 13 digits plus the two display spaces
                  className={`rounded-xl border-[1.5px] px-4 py-3.5 text-[18px] font-JakartaBold tracking-[2px] text-[#21152F] ${
                    showIdError
                      ? "border-[#E0575B] bg-[#FEF3F3]"
                      : idResult.valid
                        ? "border-[#5A189A] bg-[#F0E6FA]"
                        : "border-[#E9E2F0] bg-[#F7F4FB]"
                  }`}
                />

                <Pressable
                  onPress={verifyId}
                  disabled={verifyingId || locked}
                  accessibilityRole="button"
                  accessibilityLabel="Verify South African ID"
                  className={`mt-3 items-center rounded-xl bg-[#0E5C3F] py-3 ${
                    verifyingId || locked ? "opacity-60" : "active:opacity-80"
                  }`}
                >
                  {verifyingId ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-[13px] font-JakartaBold text-white">
                      Verify ID
                    </Text>
                  )}
                </Pressable>

                {!!idVerificationError && (
                  <View className="mt-2.5 rounded-xl bg-[#FEF3F3] p-3">
                    <Text className="text-[12px] font-JakartaMedium leading-4 text-[#B02A2A]">
                      {idVerificationError}
                    </Text>
                  </View>
                )}

                {idVerification?.isValid && (
                  <View className="mt-3 rounded-xl bg-[#E6F2EC] p-3.5">
                    <View className="mb-2 flex-row items-center gap-1.5">
                      <Ionicons name="checkmark-circle" size={15} color="#0E5C3F" />
                      <Text className="text-[12px] font-JakartaBold text-[#0E5C3F]">
                        ✓ ID Verified
                      </Text>
                    </View>
                    {[
                      idVerification.dob
                        ? {
                            label: "Date of birth",
                            value: idVerification.dob.slice(0, 10),
                          }
                        : null,
                      idVerification.age !== undefined
                        ? { label: "Age", value: String(idVerification.age) }
                        : null,
                      idVerification.gender
                        ? { label: "Gender", value: idVerification.gender }
                        : null,
                      idVerification.citizenship
                        ? {
                            label: "Citizenship",
                            value: idVerification.citizenship,
                          }
                        : null,
                    ]
                      .filter(Boolean)
                      .map((row) => (
                        <View
                          key={row!.label}
                          className="flex-row items-center justify-between py-0.5"
                        >
                          <Text className="text-[12px] font-Jakarta text-[#4A5450]">
                            {row!.label}
                          </Text>
                          <Text className="text-[12px] font-JakartaBold text-[#21152F]">
                            {row!.value}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}

                {showIdError && !idResult.valid && (
                  <View className="mt-2.5 flex-row items-center gap-1.5">
                    <Ionicons name="close-circle" size={14} color="#E0575B" />
                    <Text className="flex-1 text-[12px] font-JakartaMedium text-[#E0575B]">
                      {idResult.error}
                    </Text>
                  </View>
                )}

                {/* Showing what we read back proves the check ran, and lets
                    people catch a typo that still happens to be valid */}
                {idResult.valid && (
                  <View className="mt-3 rounded-xl bg-[#F0E6FA] p-3.5">
                    <View className="mb-2 flex-row items-center gap-1.5">
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color="#5A189A"
                      />
                      <Text className="text-[12px] font-JakartaBold text-[#5A189A]">
                        Valid ID number
                      </Text>
                    </View>

                    {[
                      { label: "Date of birth", value: idResult.dateOfBirth },
                      { label: "Age", value: `${idResult.age}` },
                      {
                        label: "Gender",
                        value: idResult.gender === "male" ? "Male" : "Female",
                      },
                      {
                        label: "Status",
                        value:
                          idResult.citizenship === "citizen"
                            ? "SA citizen"
                            : "Permanent resident",
                      },
                    ].map((row) => (
                      <View
                        key={row.label}
                        className="flex-row items-center justify-between py-0.5"
                      >
                        <Text className="text-[12px] font-Jakarta text-[#746A7E]">
                          {row.label}
                        </Text>
                        <Text className="text-[12px] font-JakartaBold text-[#21152F]">
                          {row.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Mismatches don't block submission — they're flagged for the
                    reviewer, since a legitimate person may have updated their
                    profile carelessly */}
                {warnings.map((warning) => (
                  <View
                    key={warning}
                    className="mt-2.5 flex-row items-start gap-2 rounded-xl bg-[#F0E6FA] p-3"
                  >
                    <Ionicons
                      name="warning-outline"
                      size={14}
                      color="#5A189A"
                    />
                    <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#5A189A]">
                      {warning}
                    </Text>
                  </View>
                ))}
              </View>

              {/* ── Step 2: Documents ── */}
              <Text className="mb-3 mt-4 text-[15px] font-JakartaExtraBold text-[#21152F]">
                Documents
              </Text>

              <DocRow kind="id_front" />
              <DocRow kind="id_back" optional />
              <DocRow kind="selfie" />

              <View className="mt-2 flex-row gap-2.5 rounded-2xl border border-[#E9E2F0] bg-white p-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#5A189A"
                />
                <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#746A7E]">
                  Your documents are encrypted and stored privately. Only our
                  verification team can open them, and they&apos;re deleted once
                  your account is closed.
                </Text>
              </View>

              {!locked && (
                <View className="mt-6">
                  <CustomButton
                    title={submitting ? "Uploading…" : "Submit for review"}
                    loading={submitting}
                    disabled={!canSubmit}
                    onPress={submit}
                  />
                  {!canSubmit && !submitting && (
                    <Text className="mt-2.5 text-center text-[11.5px] font-Jakarta text-[#A69BAF]">
                      {!idResult.valid
                        ? "Enter a valid ID number to continue"
                        : idVerification?.isValid !== true
                          ? "Verify your ID number to continue"
                        : "Add your ID document and a selfie to continue"}
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Verification;
