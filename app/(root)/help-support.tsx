import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { brand, ui } from "@/constants/theme";
import { SUPPORT_TOPICS, SupportCategory } from "@/lib/support";

const HelpSupport = () => {
  const [search, setSearch] = useState("");
  const visibleTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return SUPPORT_TOPICS;
    return SUPPORT_TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query),
    );
  }, [search]);

  const openChat = (category?: SupportCategory, prompt?: string) => {
    router.push({
      pathname: "/(root)/support-chat",
      params: {
        ...(category ? { category } : {}),
        ...(prompt ? { prompt } : {}),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ui.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingTop: 8,
            paddingBottom: 24,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{
              height: 42,
              width: 42,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: ui.border,
              backgroundColor: ui.surface,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={brand.dark} />
          </Pressable>
          <View>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Jakarta-Bold",
                color: ui.muted,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Hop On
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 22,
                fontFamily: "Jakarta-ExtraBold",
                color: ui.ink,
              }}
            >
              Help & Support
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontFamily: "Jakarta-ExtraBold",
            color: ui.ink,
          }}
        >
          How can we help you?
        </Text>
        <Text
          style={{
            marginTop: 6,
            marginBottom: 18,
            fontSize: 14,
            fontFamily: "Jakarta",
            lineHeight: 20,
            color: ui.muted,
          }}
        >
          Choose a topic or ask Hop On Support a question.
        </Text>

        <View
          style={{
            height: 52,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: ui.border,
            borderRadius: 16,
            backgroundColor: ui.surface,
          }}
        >
          <Ionicons name="search-outline" size={19} color={ui.faint} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for a problem..."
            placeholderTextColor={ui.faint}
            accessibilityLabel="Search support topics"
            returnKeyType="search"
            style={{
              flex: 1,
              paddingVertical: 0,
              fontSize: 14,
              fontFamily: "Jakarta",
              color: ui.ink,
            }}
          />
        </View>

        <Text
          style={{
            marginTop: 26,
            marginBottom: 12,
            fontSize: 16,
            fontFamily: "Jakarta-ExtraBold",
            color: ui.ink,
          }}
        >
          Common topics
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {visibleTopics.map((topic) => (
            <Pressable
              key={topic.category}
              onPress={() =>
                openChat(topic.category as SupportCategory, topic.prompt)
              }
              accessibilityRole="button"
              style={{
                width: "48%",
                minHeight: 106,
                flexGrow: 1,
                padding: 14,
                borderWidth: 1,
                borderColor: ui.border,
                borderRadius: 18,
                backgroundColor: ui.surface,
              }}
            >
              <View
                style={{
                  height: 34,
                  width: 34,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 11,
                  backgroundColor: brand.tint,
                }}
              >
                <Ionicons
                  name={topic.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={brand.dark}
                />
              </View>
              <Text
                style={{
                  marginTop: 9,
                  fontSize: 13,
                  fontFamily: "Jakarta-Bold",
                  color: ui.ink,
                }}
              >
                {topic.title}
              </Text>
              <Text
                style={{
                  marginTop: 3,
                  fontSize: 11,
                  fontFamily: "Jakarta",
                  color: ui.muted,
                }}
                numberOfLines={2}
              >
                {topic.description}
              </Text>
            </Pressable>
          ))}
        </View>
        {visibleTopics.length === 0 && (
          <Text
            style={{
              paddingVertical: 24,
              textAlign: "center",
              fontSize: 13,
              fontFamily: "Jakarta",
              color: ui.muted,
            }}
          >
            No matching topics. Chat with Hop On Support for help.
          </Text>
        )}

        <Pressable
          onPress={() => openChat()}
          accessibilityRole="button"
          style={{
            minHeight: 58,
            marginTop: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            borderRadius: 18,
            backgroundColor: brand.dark,
          }}
        >
          <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Jakarta-Bold",
              color: "#FFFFFF",
            }}
          >
            Chat with Hop On Support
          </Text>
        </Pressable>

        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 9,
            padding: 14,
            borderRadius: 16,
            backgroundColor: brand.tint,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={brand.dark} />
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              fontFamily: "Jakarta",
              lineHeight: 18,
              color: ui.ink,
            }}
          >
            For immediate danger, open My Rides and use the SOS option on your
            active trip. Contact emergency services if needed.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupport;
