import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─────────────────────────────────────────────────────────────────────────────
// Privacy policy and terms, kept in the app rather than behind a link.
// A link to a website you haven't built yet is worse than no link at all, and
// app stores require these to be reachable.
//
// IMPORTANT: this is a starting draft, not legal advice. Have it reviewed
// before you launch — POPIA carries real penalties for getting it wrong.
// ─────────────────────────────────────────────────────────────────────────────

const LAST_UPDATED = "26 July 2026";
const COMPANY = "DevSphere Inc.";
const CONTACT_EMAIL = "privacy@lyftcarpool.co.za";

type Section = { heading: string; body: string[] };

const PRIVACY: Section[] = [
  {
    heading: "What we collect",
    body: [
      "Account details you give us: your name, email address, phone number and profile photo.",
      "Identity documents you upload for verification: your ID or passport, and a selfie.",
      "Location data while you use the app, so we can match you with drivers going your way and show your trip on a map.",
      "Trip records: where you travelled, when, with which driver, and what you paid.",
      "Device information such as your device type and app version, which helps us fix crashes.",
    ],
  },
  {
    heading: "Why we collect it",
    body: [
      "To match riders with drivers and run the trips you book.",
      "To verify that riders and drivers are who they say they are, which is what keeps the service safe.",
      "To process payments. Card details are handled by Stripe and never stored by us.",
      "To respond when you contact support, and to investigate incidents.",
      "To meet legal obligations, including keeping records that South African law requires us to keep.",
    ],
  },
  {
    heading: "Who sees your information",
    body: [
      "Drivers see your first name, profile photo, rating, and pickup and drop-off points for trips you book with them. They do not see your ID document, your phone number history, or your other trips.",
      "Our verification team sees your identity documents while reviewing them, and that access is logged.",
      "Our service providers process data on our behalf: Supabase for storage, Clerk for accounts, Stripe for payments, and Google and Geoapify for maps and addresses.",
      "We do not sell your personal information, and we do not share it for advertising.",
    ],
  },
  {
    heading: "How we protect it",
    body: [
      "Identity documents are stored in private encrypted storage. They are not publicly accessible, and links to them expire within a minute.",
      "Access to documents is restricted to staff who need it for verification, and every access is recorded.",
      "We use encrypted connections for everything the app sends and receives.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Identity documents are deleted once your account is closed, unless we are legally required to keep them longer.",
      "Trip and payment records are kept for five years, as South African tax and financial regulations require.",
      "You can ask us to delete your account and data at any time by emailing us.",
    ],
  },
  {
    heading: "Your rights under POPIA",
    body: [
      "You can ask what personal information we hold about you, and we will tell you.",
      "You can ask us to correct anything that is wrong.",
      "You can ask us to delete your information, subject to records we must keep by law.",
      "You can object to how we use your information.",
      "You can complain to the Information Regulator of South Africa if you believe we have mishandled your data.",
      `To exercise any of these rights, email ${CONTACT_EMAIL}.`,
    ],
  },
  {
    heading: "Children",
    body: [
      "This service is for people aged 18 and over. We do not knowingly collect information from children. If you believe a child has created an account, tell us and we will remove it.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "If we change this policy in a way that affects you, we will tell you in the app before the change takes effect.",
    ],
  },
];

const TERMS: Section[] = [
  {
    heading: "What this service is",
    body: [
      `${COMPANY} runs a platform that connects people travelling in the same direction so they can share a trip and split the cost.`,
      "We are not a transport operator. We do not employ drivers and we do not own the vehicles. Drivers are independent people offering seats in their own cars.",
    ],
  },
  {
    heading: "Who can use it",
    body: [
      "You must be 18 or older.",
      "You must give accurate information and complete identity verification before booking or offering trips.",
      "One person, one account. Do not let anyone else use yours.",
    ],
  },
  {
    heading: "Booking and paying",
    body: [
      "The fare shown before you confirm is what you pay. Card payments are taken when you confirm the booking.",
      "If you choose cash, you pay the driver directly at the end of the trip.",
      "Cancelling shortly before pickup may incur a fee, which is shown to you before you cancel.",
      "Refunds are handled case by case. Contact support within seven days of a trip.",
    ],
  },
  {
    heading: "Your responsibilities as a rider",
    body: [
      "Be at the pickup point on time and treat the driver and other passengers with respect.",
      "Do not bring anything illegal into the vehicle.",
      "Do not damage the vehicle. You may be charged for cleaning or repairs.",
      "Wear a seatbelt.",
    ],
  },
  {
    heading: "Driver requirements",
    body: [
      "Drivers must hold a valid South African driving licence and, where the law requires one, a Professional Driving Permit.",
      "Vehicles must be licensed, roadworthy and insured.",
      "Drivers are responsible for complying with the National Land Transport Act and any operating licence requirements that apply to them.",
    ],
  },
  {
    heading: "Safety",
    body: [
      "Every trip can be shared with an emergency contact, and the app includes an emergency button.",
      "Report any safety incident to us immediately, and to the South African Police Service where a crime may have been committed.",
      "We may suspend or remove any account where we believe someone's safety is at risk.",
    ],
  },
  {
    heading: "Ratings and conduct",
    body: [
      "Riders and drivers rate each other after a trip. Ratings that stay persistently low may result in removal from the platform.",
      "Harassment, discrimination, threats and abuse are not tolerated and result in permanent removal.",
    ],
  },
  {
    heading: "Our liability",
    body: [
      "We provide the platform that connects you. We are not responsible for the conduct of drivers or riders, or for what happens during a trip.",
      "Nothing here limits your rights under the Consumer Protection Act, or excludes liability that cannot lawfully be excluded.",
    ],
  },
  {
    heading: "Ending your account",
    body: [
      "You can close your account at any time from the app or by emailing us.",
      "We may suspend or close an account that breaks these terms, and we will tell you why.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      "These terms are governed by the laws of the Republic of South Africa.",
    ],
  },
];

const Legal = () => {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [active, setActive] = useState<"privacy" | "terms">(
    tab === "terms" ? "terms" : "privacy",
  );

  const sections = active === "privacy" ? PRIVACY : TERMS;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8F6]">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl border border-[#E2E9E5] bg-white active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color="#101814" />
        </Pressable>
        <Text className="text-[19px] font-JakartaExtraBold text-[#101814]">
          Legal
        </Text>
      </View>

      {/* Tabs */}
      <View className="mx-5 mb-4 flex-row rounded-2xl bg-[#EEF1F0] p-1">
        {(["privacy", "terms"] as const).map((key) => {
          const selected = active === key;
          return (
            <Pressable
              key={key}
              onPress={() => setActive(key)}
              className={`flex-1 items-center rounded-xl py-2.5 ${
                selected ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-[13px] ${
                  selected
                    ? "font-JakartaBold text-[#0E5C3F]"
                    : "font-JakartaMedium text-[#68756F]"
                }`}
              >
                {key === "privacy" ? "Privacy policy" : "Terms of use"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-4 text-[11.5px] font-JakartaMedium uppercase tracking-wider text-[#9BA6A1]">
          Last updated {LAST_UPDATED}
        </Text>

        {sections.map((section, index) => (
          <View
            key={section.heading}
            className="mb-3 rounded-2xl border border-[#E2E9E5] bg-white p-5"
          >
            <View className="mb-3 flex-row items-center gap-2.5">
              <View className="h-6 w-6 items-center justify-center rounded-lg bg-[#E6F2EC]">
                <Text className="text-[11px] font-JakartaBold text-[#0E5C3F]">
                  {index + 1}
                </Text>
              </View>
              <Text className="flex-1 text-[15px] font-JakartaExtraBold text-[#101814]">
                {section.heading}
              </Text>
            </View>

            {section.body.map((paragraph, i) => (
              <View key={i} className="mb-2.5 flex-row">
                <View className="mr-2.5 mt-[7px] h-1.5 w-1.5 rounded-full bg-[#1FB574]" />
                <Text className="flex-1 text-[13px] font-Jakarta leading-5 text-[#4A5450]">
                  {paragraph}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View className="mt-2 flex-row gap-2.5 rounded-2xl bg-[#E6F2EC] p-4">
          <Ionicons name="mail-outline" size={16} color="#0E5C3F" />
          <Text className="flex-1 text-[12px] font-Jakarta leading-4 text-[#0E5C3F]">
            Questions about any of this? Email {CONTACT_EMAIL} and we&apos;ll
            answer within five working days.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Legal;