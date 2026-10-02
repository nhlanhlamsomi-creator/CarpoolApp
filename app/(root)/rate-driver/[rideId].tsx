import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiRequest } from "@/lib/api";

type RatingDetails = {
  ride: {
    ride_id: number;
    status: string;
    origin_address: string;
    destination_address: string;
    created_at: string;
  };
  driver: {
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
    rating: number | null;
  };
  existingRating: {
    rating: number;
    feedback: string | null;
  } | null;
};

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const RateDriver = () => {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { getToken } = useAuth();
  const [details, setDetails] = useState<RatingDetails | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(Boolean(rideId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    rideId ? null : "This trip could not be found.",
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRatingDetails = async () => {
      if (!rideId) return;

      try {
        const token = await getToken();
        const result = await apiRequest<{ data: RatingDetails }>(
          `/api/ratings/${encodeURIComponent(rideId)}`,
          {},
          token,
        );
        if (!active) return;
        setDetails(result.data);
        if (result.data.existingRating) {
          setRating(result.data.existingRating.rating);
          setFeedback(result.data.existingRating.feedback ?? "");
          setSubmitted(true);
        }
        setError(null);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this trip.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadRatingDetails();
    return () => {
      active = false;
    };
  }, [getToken, rideId]);

  const submitRating = async () => {
    if (!rideId || rating < 1 || rating > 5 || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      const token = await getToken();
      await apiRequest(
        `/api/ratings/${encodeURIComponent(rideId)}`,
        {
          method: "POST",
          body: JSON.stringify({ rating, feedback: feedback.trim() }),
        },
        token,
      );
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Your rating could not be saved. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const completed = details?.ride.status === "completed";
  const driverName = details
    ? `${details.driver.first_name} ${details.driver.last_name}`.trim() ||
      "Your driver"
    : "Your driver";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F6F5" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-11 w-11 items-center justify-center rounded-2xl border border-[#E3E7E5] bg-white"
          >
            <Ionicons name="chevron-back" size={20} color="#0A3B2E" />
          </Pressable>
          <Text className="text-[12px] font-JakartaBold uppercase tracking-[2px] text-[#7A8580]">
            Trip feedback
          </Text>
          <View className="h-11 w-11" />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0A3B2E" />
          </View>
        ) : error && !details ? (
          <View className="flex-1 items-center justify-center rounded-[28px] bg-white p-6">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#FEF3F3]">
              <Ionicons name="alert-circle-outline" size={28} color="#B02A2A" />
            </View>
            <Text className="text-center text-[18px] font-JakartaBold text-[#101814]">
              Couldn&apos;t load this trip
            </Text>
            <Text className="mt-2 text-center text-[13px] leading-5 text-[#7A8580]">
              {error}
            </Text>
          </View>
        ) : details ? (
          <>
            <View className="overflow-hidden rounded-[30px] bg-[#0A3B2E] p-6">
              <View className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[#1FA574]/20" />
              <View className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Ionicons name="checkmark-done" size={20} color="#8FE0BD" />
              </View>
              <Text className="mt-5 text-[11px] font-JakartaBold uppercase tracking-[2px] text-[#9BCDB7]">
                Trip complete
              </Text>
              <Text className="mt-1 text-[27px] font-JakartaExtraBold leading-9 text-white">
                How was your ride?
              </Text>
              <Text className="mt-2 text-[13px] leading-5 text-[#D2E5DC]">
                Your feedback helps passengers choose with confidence and helps
                drivers keep improving.
              </Text>
            </View>

            <View className="-mt-4 mx-3 flex-row items-center rounded-3xl border border-[#E3E7E5] bg-white p-4">
              {details.driver.profile_image_url ? (
                <Image
                  source={{ uri: details.driver.profile_image_url }}
                  className="h-14 w-14 rounded-2xl bg-[#E4EFEA]"
                />
              ) : (
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#E4EFEA]">
                  <Ionicons name="person" size={24} color="#0A3B2E" />
                </View>
              )}
              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-JakartaBold uppercase tracking-[1.5px] text-[#7A8580]">
                  Your driver
                </Text>
                <Text
                  className="mt-1 text-[16px] font-JakartaBold text-[#101814]"
                  numberOfLines={1}
                >
                  {driverName}
                </Text>
              </View>
              <View className="flex-row items-center rounded-full bg-[#FFF7E6] px-2.5 py-1.5">
                <Ionicons name="star" size={13} color="#D89B26" />
                <Text className="ml-1 text-[12px] font-JakartaBold text-[#705214]">
                  {details.driver.rating == null
                    ? "New"
                    : Number(details.driver.rating).toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="mt-5 rounded-[26px] border border-[#E3E7E5] bg-white p-5">
              <Text className="text-[17px] font-JakartaBold text-[#101814]">
                {submitted ? "Your rating" : "Rate your driver"}
              </Text>
              <Text className="mt-1 text-[12.5px] leading-5 text-[#7A8580]">
                {submitted
                  ? "Thanks for taking a moment to share your experience."
                  : completed
                    ? "Tap a star to rate your overall experience."
                    : "You can rate this trip once it has been marked complete."}
              </Text>

              <View className="mt-5 flex-row justify-between px-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => !submitted && setRating(star)}
                    disabled={submitted || !completed}
                    accessibilityRole="button"
                    accessibilityLabel={`${star} star${star === 1 ? "" : "s"}: ${STAR_LABELS[star]}`}
                    accessibilityState={{ selected: rating === star }}
                    className={`h-[54px] w-[54px] items-center justify-center rounded-2xl border ${
                      star <= rating
                        ? "border-[#F2D590] bg-[#FFF7E6]"
                        : "border-[#E3E7E5] bg-[#F8FAF9]"
                    }`}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={25}
                      color={star <= rating ? "#D89B26" : "#A9B1AD"}
                    />
                  </Pressable>
                ))}
              </View>
              <Text className="mt-3 text-center text-[13px] font-JakartaBold text-[#0A3B2E]">
                {STAR_LABELS[rating] ?? "Choose a star rating"}
              </Text>

              <Text className="mb-2 mt-6 text-[12px] font-JakartaBold uppercase tracking-[1.3px] text-[#7A8580]">
                Add a note <Text className="font-Jakarta">(optional)</Text>
              </Text>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                editable={!submitted && completed}
                placeholder="What made the trip good?"
                placeholderTextColor="#A9B1AD"
                maxLength={500}
                multiline
                textAlignVertical="top"
                className="min-h-[108px] rounded-2xl border border-[#E3E7E5] bg-[#F8FAF9] px-4 py-3 text-[13px] font-Jakarta text-[#101814]"
              />
              <Text className="mt-1 text-right text-[10px] font-Jakarta text-[#A9B1AD]">
                {feedback.length}/500
              </Text>

              {error && (
                <Text
                  accessibilityRole="alert"
                  className="mt-3 rounded-xl bg-[#FEF3F3] px-3 py-2 text-[12px] font-Jakarta text-[#B02A2A]"
                >
                  {error}
                </Text>
              )}

              {submitted ? (
                <View className="mt-4 flex-row items-center justify-center rounded-2xl bg-[#E4EFEA] py-4">
                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color="#0A3B2E"
                  />
                  <Text className="ml-2 text-[13px] font-JakartaBold text-[#0A3B2E]">
                    Feedback submitted
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={submitRating}
                  disabled={!completed || rating === 0 || submitting}
                  accessibilityRole="button"
                  style={{
                    opacity: !completed || rating === 0 || submitting ? 0.55 : 1,
                  }}
                  className="mt-4 flex-row items-center justify-center rounded-2xl bg-[#0A3B2E] py-4"
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text className="text-[13px] font-JakartaBold text-white">
                        Submit rating
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginLeft: 8 }}
                      />
                    </>
                  )}
                </Pressable>
              )}
            </View>

            <View className="mt-4 flex-row items-center justify-center">
              <Ionicons name="lock-closed-outline" size={12} color="#7A8580" />
              <Text className="ml-1.5 text-[10.5px] font-Jakarta text-[#7A8580]">
                Your feedback is tied to this completed trip
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RateDriver;
