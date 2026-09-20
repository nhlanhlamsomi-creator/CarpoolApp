import { useUser } from "@clerk/clerk-expo";
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

import { fetchAPI } from "@/lib/fetch";

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
  const { user } = useUser();

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!user?.id || !rideId) return;
    try {
      const result = await fetchAPI(
        `/(api)/messages/${rideId}?clerkId=${encodeURIComponent(user.id)}`,
      );
      setThread(result?.data ?? null);
    } catch (error) {
      console.warn("Could not load thread", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, rideId]);

  // Polling rather than websockets: works in Expo Go with nothing to set up.
  // Supabase Realtime is the upgrade path once the app leaves Expo Go.
  useEffect(() => {
    load();
    pollRef.current = setInterval(load, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !user?.id) return;

    setSending(true);
    setDraft("");

    // Show the message immediately; reconcile on the next poll
    setThread((t) =>
      t
        ? {
            ...t,
            messages: [
              ...t.messages,
              {
                id: -Date.now(),
                body: text,
                created_at: new Date().toISOString(),
                mine: true,
              },
            ],
          }
        : t,
    );

    try {
      await fetchAPI(`/(api)/messages/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, body: text }),
      });
      await load();
    } catch (error) {
      setDraft(text); // give their words back rather than losing them
      await load();
    } finally {
      setSending(false);
    }
  };

  const closed = thread?.status === "cancelled";
  const done = thread?.status === "completed";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: WARM.cream }}
      edges={["top"]}
    >
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: WARM.line,
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
            backgroundColor: WARM.sand,
            borderWidth: 1,
            borderColor: WARM.line,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={WARM.charcoal} />
        </Pressable>

        {thread?.other.image ? (
          <Image
            source={{ uri: thread.other.image }}
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: WARM.sand,
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
              backgroundColor: WARM.goldSoft,
            }}
          >
            <Ionicons name="person" size={17} color={WARM.goldDeep} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Jakarta-Bold",
              color: WARM.charcoal,
            }}
            numberOfLines={1}
          >
            {thread?.other.name ?? "…"}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Jakarta",
              color: WARM.muted,
              textTransform: "capitalize",
            }}
          >
            {thread ? `Your ${thread.other.role} · trip #${thread.ride_id}` : ""}
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
            <ActivityIndicator size="large" color={WARM.gold} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={thread?.messages ?? []}
            keyExtractor={(m) => String(m.id)}
            className="px-4"
            contentContainerStyle={{ paddingVertical: 14 }}
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
                  backgroundColor: item.mine ? WARM.gold : "#FFFFFF",
                  borderWidth: item.mine ? 0 : 1,
                  borderColor: WARM.line,
                  shadowColor: item.mine ? WARM.goldDeep : WARM.charcoal,
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
                    color: item.mine ? WARM.charcoal : WARM.charcoal,
                  }}
                >
                  {item.body}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 9.5,
                    fontFamily: "Jakarta",
                    color: item.mine
                      ? "rgba(43,39,34,0.55)"
                      : WARM.muted,
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
                    backgroundColor: WARM.goldSoft,
                  }}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={24}
                    color={WARM.goldDeep}
                  />
                </View>
                <Text
                  style={{
                    marginTop: 12,
                    textAlign: "center",
                    fontSize: 13,
                    fontFamily: "Jakarta",
                    lineHeight: 20,
                    color: WARM.graphite,
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
        {closed ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: WARM.line,
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
                color: WARM.muted,
              }}
            >
              This trip was cancelled, so its chat is closed.
            </Text>
          </View>
        ) : (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: WARM.line,
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
                  color: WARM.muted,
                }}
              >
                Trip completed — you can still message about lost items.
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
                placeholderTextColor={WARM.muted}
                multiline
                maxLength={2000}
                style={{
                  maxHeight: 112,
                  flex: 1,
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: WARM.line,
                  backgroundColor: WARM.cream,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14.5,
                  fontFamily: "Jakarta",
                  color: WARM.charcoal,
                }}
              />
              <Pressable
                onPress={send}
                disabled={!draft.trim() || sending}
                style={{
                  height: 48,
                  width: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  backgroundColor:
                    draft.trim() && !sending ? WARM.gold : WARM.sand,
                  borderWidth: 1.5,
                  borderColor:
                    draft.trim() && !sending ? WARM.goldDeep : WARM.line,
                  shadowColor: WARM.goldDeep,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: draft.trim() && !sending ? 0.3 : 0,
                  shadowRadius: 12,
                  elevation: draft.trim() && !sending ? 5 : 0,
                }}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={WARM.charcoal} />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={WARM.charcoal}
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