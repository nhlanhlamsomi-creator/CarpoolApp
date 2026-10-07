export type SupportCategory =
  | "booking"
  | "hubs"
  | "driver"
  | "payment"
  | "verification"
  | "app-account"
  | "safety";

export type SupportMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  safety?: boolean;
};

export const SUPPORT_TOPICS: {
  category: SupportCategory;
  title: string;
  description: string;
  icon: string;
  prompt: string;
}[] = [
  {
    category: "booking",
    title: "Booking",
    description: "Finding and confirming a ride",
    icon: "car-outline",
    prompt: "I'm having a problem booking a ride.",
  },
  {
    category: "hubs",
    title: "Hubs",
    description: "Pickup and drop-off locations",
    icon: "location-outline",
    prompt: "I can't find the hub I need.",
  },
  {
    category: "driver",
    title: "Driver",
    description: "Driver or trip concerns",
    icon: "person-outline",
    prompt: "I'm having a problem with my driver.",
  },
  {
    category: "payment",
    title: "Payment",
    description: "Charges and payment methods",
    icon: "card-outline",
    prompt: "I have a problem with my payment.",
  },
  {
    category: "verification",
    title: "Verification",
    description: "Identity checks and documents",
    icon: "shield-checkmark-outline",
    prompt: "I'm having a problem with ID verification.",
  },
  {
    category: "app-account",
    title: "App & Account",
    description: "Sign-in and app problems",
    icon: "phone-portrait-outline",
    prompt: "Something isn't working correctly in the app.",
  },
  {
    category: "safety",
    title: "Safety",
    description: "Get help with a safety concern",
    icon: "warning-outline",
    prompt: "I have a safety concern.",
  },
];

export const INITIAL_SUPPORT_MESSAGE =
  "Hi! I'm Hop On Support 👋\n\nI can help you with bookings, drivers, hubs, payments, your account, verification and more.\n\nWhat can I help you with?";

export function supportErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/AI_SUPPORT_NOT_CONFIGURED/i.test(message)) {
    return "AI Support is not configured on the server yet. Please contact Hop On Support. The server owner needs to add GEMINI_API_KEY to the backend environment.";
  }
  if (/endpoint not found|404/i.test(message)) {
    return "The support chat endpoint is not available on the current backend. Please contact Hop On Support so the server can be updated.";
  }
  if (/429|sending messages too quickly/i.test(message)) {
    return "You're sending messages too quickly. Please wait a moment and try again.";
  }
  if (/401|403|authentication|required|unauthorized/i.test(message)) {
    return "Please sign in again to contact Hop On Support.";
  }
  if (/network request failed|failed to fetch|networkerror|offline|timed out/i.test(message)) {
    return "You're offline. Check your internet connection and try again.";
  }
  if (/AI_SUPPORT_UPSTREAM_ERROR|temporarily unavailable|502|503|504|500|couldn't process|internal server error/i.test(message)) {
    return "Hop On AI Support could not reach its AI service. Please try again shortly or contact human support if this continues.";
  }
  return "Sorry, we're having trouble connecting to Hop On Support right now. Please try again.";
}
