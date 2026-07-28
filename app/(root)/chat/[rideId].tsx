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
    <SafeAreaView className="flex-1 bg-[#F5F8F6]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-[#E2E9E5] bg-white px-4 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl border border-[#E2E9E5] bg-white active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color="#101814" />
        </Pressable>

        {thread?.other.image ? (
          <Image
            source={{ uri: thread.other.image }}
            className="h-10 w-10 rounded-full bg-[#EEF1F0]"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E6F2EC]">
            <Ionicons name="person" size={17} color="#0E5C3F" />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-[15px] font-JakartaBold text-[#101814]" numberOfLines={1}>
            {thread?.other.name ?? "…"}
          </Text>
          <Text className="text-[11px] font-Jakarta capitalize text-[#68756F]">
            {thread ? `Your ${thread.other.role} · trip #${thread.ride_id}` : ""}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0E5C3F" />
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
                className={`mb-2 max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                  item.mine
                    ? "self-end rounded-br-md bg-[#0E5C3F]"
                    : "self-start rounded-bl-md border border-[#E2E9E5] bg-white"
                }`}
              >
                <Text
                  className={`text-[14px] font-Jakarta leading-5 ${
                    item.mine ? "text-white" : "text-[#101814]"
                  }`}
                >
                  {item.body}
                </Text>
                <Text
                  className={`mt-1 text-[9.5px] font-Jakarta ${
                    item.mine ? "text-white/60" : "text-[#9BA6A1]"
                  }`}
                >
                  {new Date(item.created_at).toLocaleTimeString("en-ZA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center px-8 py-14">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E6F2EC]">
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#0E5C3F" />
                </View>
                <Text className="mt-3 text-center text-[13px] font-Jakarta leading-5 text-[#68756F]">
                  Say hello and confirm the pickup point. Messages stay in the
                  app for everyone&apos;s safety.
                </Text>
              </View>
            }
          />
        )}

        {/* Composer */}
        {closed ? (
          <View className="border-t border-[#E2E9E5] bg-white px-5 py-4">
            <Text className="text-center text-[12.5px] font-Jakarta text-[#68756F]">
              This trip was cancelled, so its chat is closed.
            </Text>
          </View>
        ) : (
          <View className="border-t border-[#E2E9E5] bg-white px-3 py-2.5">
            {done && (
              <Text className="mb-2 text-center text-[11px] font-Jakarta text-[#9BA6A1]">
                Trip completed — you can still message about lost items.
              </Text>
            )}
            <View className="flex-row items-end gap-2">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Type a message"
                placeholderTextColor="#B4BEB9"
                multiline
                maxLength={2000}
                className="max-h-28 flex-1 rounded-2xl border-[1.5px] border-[#E2E9E5] bg-[#F8FAF9] px-4 py-3 text-[14.5px] font-Jakarta text-[#101814]"
              />
              <Pressable
                onPress={send}
                disabled={!draft.trim() || sending}
                className={`h-12 w-12 items-center justify-center rounded-2xl ${
                  draft.trim() && !sending ? "bg-[#0E5C3F]" : "bg-[#DFE6E2]"
                } active:opacity-80`}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="arrow-up" size={20} color="#fff" />
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