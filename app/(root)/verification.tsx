import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
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
  { bg: string; icon: any; title: string; body: string; tint: string }
> = {
  not_submitted: {
    bg: "bg-[#E6F2EC]",
    tint: "#0E5C3F",
    icon: "shield-outline",
    title: "Verify your identity",
    body: "This takes about two minutes and only has to be done once.",
  },
  pending: {
    bg: "bg-[#FDF4E3]",
    tint: "#8A6100",
    icon: "time-outline",
    title: "We're reviewing your documents",
    body: "Most checks finish within 24 hours. We'll notify you either way.",
  },
  approved: {
    bg: "bg-[#E6F2EC]",
    tint: "#0E5C3F",
    icon: "shield-checkmark",
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
  const { user } = useUser();

  const [status, setStatus] = useState<VerificationStatus>("not_submitted");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [profileGender, setProfileGender] = useState<string | null>(null);

  const [idInput, setIdInput] = useState("");
  const [idTouched, setIdTouched] = useState(false);

  const [picked, setPicked] = useState<Picked>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyKind, setBusyKind] = useState<DocKind | null>(null);

  // ── Live ID number check ───────────────────────────────────────────────────
  // Runs on every keystroke, but only surfaces an error once 13 digits are in
  // — telling someone their number is "too short" while they're still typing
  // it is just noise.
  const idResult = useMemo(
    () => validateSaIdNumber(idInput),
    [idInput],
  );
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
    idResult.valid && Boolean(picked.id_front && picked.selfie) && !submitting;

  const submit = async () => {
    if (!user?.id || !picked.id_front || !picked.selfie || !idResult.valid) {
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
  const DocRow = ({ kind, optional }: { kind: DocKind; optional?: boolean }) => {
    const image = picked[kind];
    const busy = busyKind === kind;
    const label = DOC_LABELS[kind];

    return (
      <Pressable
        onPress={() => !locked && !busy && choose(kind)}
        disabled={locked || busy}
        className={`mb-3 flex-row items-center rounded-2xl border-[1.5px] p-3.5 ${
          image ? "border-[#0E5C3F] bg-[#F2F8F5]" : "border-[#E2E9E5] bg-white"
        } ${locked ? "opacity-60" : "active:opacity-80"}`}
      >
        {image ? (
          <Image
            source={{ uri: image.uri }}
            className="h-14 w-14 rounded-xl bg-[#EEF1F0]"
          />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-[#E6F2EC]">
            <Ionicons
              name={kind === "selfie" ? "person-outline" : "card-outline"}
              size={22}
              color="#0E5C3F"
            />
          </View>
        )}

        <View className="ml-3.5 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[14.5px] font-JakartaBold text-[#101814]">
              {label.title}
            </Text>
            {optional && (
              <Text className="text-[10.5px] font-JakartaMedium text-[#9BA6A1]">
                Optional
              </Text>
            )}
          </View>

          <Text
            className="mt-1 text-[11.5px] font-Jakarta leading-4 text-[#68756F]"
            numberOfLines={2}
          >
            {image ? "Ready to submit. Tap to replace." : label.help}
          </Text>
        </View>

        <View className="ml-2">
          {busy ? (
            <ActivityIndicator size="small" color="#0E5C3F" />
          ) : image ? (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-[#1FB574]">
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          ) : (
            <Ionicons name="add-circle-outline" size={22} color="#9BA6A1" />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl border border-[#E2E9E5] bg-white active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color="#101814" />
        </Pressable>
        <Text className="text-[19px] font-JakartaExtraBold text-[#101814]">
          Identity verification
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E5C3F" />
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
            <Ionicons name={banner.icon} size={26} color={banner.tint} />
            <Text
              className="mt-3 text-[17px] font-JakartaExtraBold"
              style={{ color: banner.tint }}
            >
              {banner.title}
            </Text>
            <Text className="mt-1.5 text-[13px] font-Jakarta leading-5 text-[#4A5450]">
              {banner.body}
            </Text>

            {status === "rejected" && !!rejectionReason && (
              <View className="mt-3 rounded-2xl bg-white/70 px-3.5 py-3">
                <Text className="text-[11px] font-JakartaBold uppercase tracking-wider text-[#B02A2A]">
                  Reason
                </Text>
                <Text className="mt-1 text-[13px] font-JakartaMedium text-[#101814]">
                  {rejectionReason}
                </Text>
              </View>
            )}
          </View>

          {status !== "approved" && (
            <>
              {/* ── Step 1: ID number ── */}
              <Text className="mb-3 text-[15px] font-JakartaExtraBold text-[#101814]">
                Your ID number
              </Text>

              <View className="mb-3 rounded-2xl border border-[#E2E9E5] bg-white p-4">
                <TextInput
                  value={formatIdNumber(idInput)}
                  onChangeText={(text) => {
                    setIdInput(normaliseIdNumber(text).slice(0, 13));
                    setIdTouched(true);
                  }}
                  editable={!locked}
                  placeholder="000000 0000 000"
                  placeholderTextColor="#C9D2CD"
                  keyboardType="number-pad"
                  maxLength={15} // 13 digits plus the two display spaces
                  className={`rounded-xl border-[1.5px] px-4 py-3.5 text-[18px] font-JakartaBold tracking-[2px] text-[#101814] ${
                    showIdError
                      ? "border-[#E04545] bg-[#FEF3F3]"
                      : idResult.valid
                        ? "border-[#0E5C3F] bg-[#F2F8F5]"
                        : "border-[#E2E9E5] bg-[#F8FAF9]"
                  }`}
                />

                {showIdError && !idResult.valid && (
                  <View className="mt-2.5 flex-row items-center gap-1.5">
                    <Ionicons name="close-circle" size={14} color="#E04545" />
                    <Text className="flex-1 text-[12px] font-JakartaMedium text-[#E04545]">
                      {idResult.error}
                    </Text>
                  </View>
                )}

                {/* Showing what we read back proves the check ran, and lets
                    people catch a typo that still happens to be valid */}
                {idResult.valid && (
                  <View className="mt-3 rounded-xl bg-[#E6F2EC] p-3.5">
                    <View className="mb-2 flex-row items-center gap-1.5">
                      <Ionicons name="checkmark-circle" size={15} color="#0E5C3F" />
                      <Text className="text-[12px] font-JakartaBold text-[#0E5C3F]">
                        Valid ID number
                      </Text>
                    </View>

                    {[
                      { label: "Date of birth", value: idResult.dateOfBirth },
                      { label: "Age", value: `${idResult.age}` },
                      {
                        label: "Gender",
                        value:
                          idResult.gender === "male" ? "Male" : "Female",
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
                        <Text className="text-[12px] font-Jakarta text-[#4A5450]">
                          {row.label}
                        </Text>
                        <Text className="text-[12px] font-JakartaBold text-[#101814]">
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
                    className="mt-2.5 flex-row items-start gap-2 rounded-xl bg-[#FDF4E3] p-3"
                  >
                    <Ionicons name="warning-outline" size={14} color="#8A6100" />
                    <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#8A6100]">
                      {warning}
                    </Text>
                  </View>
                ))}
              </View>

              {/* ── Step 2: Documents ── */}
              <Text className="mb-3 mt-4 text-[15px] font-JakartaExtraBold text-[#101814]">
                Documents
              </Text>

              <DocRow kind="id_front" />
              <DocRow kind="id_back" optional />
              <DocRow kind="selfie" />

              <View className="mt-2 flex-row gap-2.5 rounded-2xl border border-[#E2E9E5] bg-white p-4">
                <Ionicons name="lock-closed-outline" size={16} color="#0E5C3F" />
                <Text className="flex-1 text-[11.5px] font-Jakarta leading-4 text-[#68756F]">
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
                    <Text className="mt-2.5 text-center text-[11.5px] font-Jakarta text-[#9BA6A1]">
                      {!idResult.valid
                        ? "Enter a valid ID number to continue"
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