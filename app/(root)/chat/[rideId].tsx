import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { brand, ui } from "@/constants/theme";
import { apiRequest } from "@/lib/api";

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

// One conversation, tied to one trip. Identical file in both apps — the API
// works out which side you are and labels the other person accordingly.

type Message = {
  id: number;
  body: string;
  created_at: string;
  mine: boolean;
};

type Thread = {
  ride_id: number;
  status: string;
  other: { name: string; image: string | null; role: "driver" | "passenger" };
  messages: Message[];
};

const POLL_MS = 4000;

const ChatThread = () => {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { getToken, userId } = useAuth();

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!userId || !rideId) {
      setLoading(false);
      setError("Sign in to view this conversation.");
      return;
    }
    try {
      const token = await getToken();
      const result = await apiRequest<{ data: Thread }>(
        `/api/messages/${encodeURIComponent(rideId)}`,
        { method: "GET" },
        token,
      );
      setThread(result.data);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load this conversation.",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, userId, rideId]);

  const retryLoad = () => {
    setLoading(true);
    void load();
  };

  const closed = thread?.status === "cancelled";
  const done = thread?.status === "completed";

  // Polling rather than websockets: works in Expo Go with nothing to set up.
  // Supabase Realtime is the upgrade path once the app leaves Expo Go.
  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void load();
    }, 0);
    pollRef.current = setInterval(load, POLL_MS);
    return () => {
      clearTimeout(initialLoad);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !userId || !thread || closed) return;

    setSending(true);

    try {
      const token = await getToken();
      const result = await apiRequest<{ data: Message }>(
        `/api/messages/${encodeURIComponent(rideId)}`,
        { method: "POST", body: JSON.stringify({ body: text }) },
        token,
      );
      setThread((current) =>
        current
          ? { ...current, messages: [...current.messages, result.data] }
          : current,
      );
      setDraft("");
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Message could not be sent.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: PALETTE.cream }}
      edges={["top"]}
    >
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: PALETTE.line,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingBottom: 12,
          paddingTop: 8,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor: PALETTE.sand,
            borderWidth: 1,
            borderColor: PALETTE.line,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={PALETTE.charcoal} />
        </Pressable>

        {thread?.other.image ? (
          <Image
            source={{ uri: thread.other.image }}
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: PALETTE.sand,
            }}
          />
        ) : (
          <View
            style={{
              height: 40,
              width: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              backgroundColor: PALETTE.accentSoft,
            }}
          >
            <Ionicons name="person" size={17} color={PALETTE.accentDeep} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Jakarta-Bold",
              color: PALETTE.charcoal,
            }}
            numberOfLines={1}
          >
            {thread?.other.name ?? "…"}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Jakarta",
              color: PALETTE.muted,
              textTransform: "capitalize",
            }}
          >
            {thread
              ? `Your ${thread.other.role} · trip #${thread.ride_id}`
              : ""}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator size="large" color={PALETTE.accent} />
          </View>
        ) : !thread && error ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 28,
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={PALETTE.accentDeep}
            />
            <Text
              style={{
                marginTop: 12,
                textAlign: "center",
                color: PALETTE.charcoal,
                fontFamily: "Jakarta",
              }}
            >
              {error}
            </Text>
            <Pressable
              onPress={retryLoad}
              style={{
                marginTop: 16,
                borderRadius: 14,
                backgroundColor: PALETTE.accent,
                paddingHorizontal: 18,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: PALETTE.charcoal,
                  fontFamily: "Jakarta-Bold",
                }}
              >
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={thread?.messages ?? []}
            keyExtractor={(m) => String(m.id)}
            className="px-4"
            contentContainerStyle={{ paddingVertical: 14 }}
            ListHeaderComponent={
              error ? (
                <Text
                  style={{
                    marginBottom: 12,
                    borderRadius: 10,
                    backgroundColor: "#FEF3F2",
                    padding: 10,
                    color: "#B42318",
                    fontFamily: "Jakarta",
                  }}
                >
                  {error}
                </Text>
              ) : null
            }
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => (
              <View
                style={{
                  marginBottom: 8,
                  maxWidth: "78%",
                  borderRadius: 18,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  alignSelf: item.mine ? "flex-end" : "flex-start",
                  borderBottomRightRadius: item.mine ? 8 : 18,
                  borderBottomLeftRadius: item.mine ? 18 : 8,
                  backgroundColor: item.mine ? PALETTE.accent : "#FFFFFF",
                  borderWidth: item.mine ? 0 : 1,
                  borderColor: PALETTE.line,
                  shadowColor: item.mine
                    ? PALETTE.accentDeep
                    : PALETTE.charcoal,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: item.mine ? 0.2 : 0.04,
                  shadowRadius: 10,
                  elevation: item.mine ? 3 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Jakarta",
                    lineHeight: 20,
                    color: item.mine ? PALETTE.charcoal : PALETTE.charcoal,
                  }}
                >
                  {item.body}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 9.5,
                    fontFamily: "Jakarta",
                    color: item.mine ? "rgba(43,39,34,0.55)" : PALETTE.muted,
                  }}
                >
                  {new Date(item.created_at).toLocaleTimeString("en-ZA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  paddingHorizontal: 32,
                  paddingVertical: 56,
                }}
              >
                <View
                  style={{
                    height: 56,
                    width: 56,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 28,
                    backgroundColor: PALETTE.accentSoft,
                  }}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={24}
                    color={PALETTE.accentDeep}
                  />
                </View>
                <Text
                  style={{
                    marginTop: 12,
                    textAlign: "center",
                    fontSize: 13,
                    fontFamily: "Jakarta",
                    lineHeight: 20,
                    color: PALETTE.graphite,
                  }}
                >
                  Say hello and confirm the pickup point. Messages stay in the
                  app for everyone&apos;s safety.
                </Text>
              </View>
            }
          />
        )}

        {/* ── Composer ── */}
        {!thread ? null : closed ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: PALETTE.line,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 12.5,
                fontFamily: "Jakarta",
                color: PALETTE.muted,
              }}
            >
              This trip was cancelled, so its chat is closed.
            </Text>
          </View>
        ) : (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: PALETTE.line,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            {done && (
              <Text
                style={{
                  marginBottom: 8,
                  textAlign: "center",
                  fontSize: 11,
                  fontFamily: "Jakarta",
                  color: PALETTE.muted,
                }}
              >
                Trip completed — you can still message about lost items or rate your driver from trip history.
              </Text>
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Type a message"
                placeholderTextColor={PALETTE.muted}
                multiline
                maxLength={2000}
                style={{
                  maxHeight: 112,
                  flex: 1,
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: PALETTE.line,
                  backgroundColor: PALETTE.cream,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14.5,
                  fontFamily: "Jakarta",
                  color: PALETTE.charcoal,
                }}
              />
              <Pressable
                onPress={send}
                disabled={!draft.trim() || sending || !thread}
                style={{
                  height: 48,
                  width: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  backgroundColor:
                    draft.trim() && !sending && thread
                      ? PALETTE.accent
                      : PALETTE.sand,
                  borderWidth: 1.5,
                  borderColor:
                    draft.trim() && !sending && thread
                      ? PALETTE.accentDeep
                      : PALETTE.line,
                  shadowColor: PALETTE.accentDeep,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: draft.trim() && !sending && thread ? 0.3 : 0,
                  shadowRadius: 12,
                  elevation: draft.trim() && !sending && thread ? 5 : 0,
                }}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={PALETTE.charcoal} />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={PALETTE.charcoal}
                  />
                )}
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatThread;
