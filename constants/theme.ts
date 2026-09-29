// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens — dark green / black / white.
// Import these anywhere you need a colour in JS (map routes, icon tints,
// StatusBar). For className strings, use the arbitrary values noted below so
// the palette doesn't depend on tailwind.config.js.
// ─────────────────────────────────────────────────────────────────────────────

export const brand = {
  deep: "#04231C", // darkest green, splash background      bg-[#04231C]
  dark: "#0A3B2E", // primary: buttons, active tab, hexagon  bg-[#0A3B2E]
  mid: "#14523F", // pressed state / secondary surfaces     bg-[#14523F]
  accent: "#1FA574", // car illustration, route pin, pulse ring bg-[#1FA574]
  mint: "#5FD3A6", // highlight on dark surfaces only        bg-[#5FD3A6]
  tint: "#E4EFEA", // pale green chips, pulse-ring fill      bg-[#E4EFEA]
} as const;

export const ui = {
  bg: "#F4F6F5", // app background
  surface: "#FFFFFF", // sheets, cards, modals
  border: "#E3E7E5", // input borders, dividers
  ink: "#101814", // primary text
  muted: "#7A8580", // secondary text (subtitles, descriptions)
  faint: "#A9B1AD", // placeholders, "Lain Kali" link, inactive tabs
  danger: "#E0575B", // route line, origin pin
  dangerBg: "#FEF3F3",
  warning: brand.accent, // star rating and positive highlights
  mapBase: "#E6E6E6", // greyed map behind the sheets
  overlay: "rgba(0,0,0,0.35)", // dim layer behind modals
} as const;

export const statusStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  paid: { bg: "#E4EFEA", text: "#0A3B2E", label: "Paid" },
  pending: { bg: brand.tint, text: brand.dark, label: "Pending" },
  failed: { bg: "#FEF3F3", text: "#B02A2A", label: "Failed" },
  refunded: { bg: "#E3E7E5", text: "#7A8580", label: "Refunded" },
  completed: { bg: "#E4EFEA", text: "#0A3B2E", label: "Completed" },
  cancelled: { bg: "#FEF3F3", text: "#B02A2A", label: "Cancelled" },
};

export default { brand, ui, statusStyles };
