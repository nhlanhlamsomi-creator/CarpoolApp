// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens — deep purple, violet, and white.
// Import these anywhere you need a colour in JS (map routes, icon tints,
// StatusBar). For className strings, use the arbitrary values noted below so
// the palette doesn't depend on tailwind.config.js.
// ─────────────────────────────────────────────────────────────────────────────

export const brand = {
  deep: "#1D1135", // app shell and dark surfaces
  dark: "#5A189A", // primary actions and selected states
  mid: "#7B2CBF", // pressed state and secondary surfaces
  accent: "#9D4EDD", // interactive accent and route highlights
  mint: "#C77DFF", // highlights on dark surfaces
  tint: "#F0E6FA", // pale violet chips and selected surfaces
} as const;

export const ui = {
  bg: "#F7F4FB", // light canvas between white content cards
  surface: "#FFFFFF", // sheets, cards, modals
  border: "#E9E2F0", // input borders, dividers
  ink: "#21152F", // primary text
  muted: "#746A7E", // secondary text (subtitles, descriptions)
  faint: "#A69BAF", // placeholders and inactive controls
  danger: "#E0575B", // route line, origin pin
  dangerBg: "#FEF3F3",
  warning: "#D99A1B", // star rating and positive highlights
  mapBase: "#E6E6E6", // greyed map behind the sheets
  overlay: "rgba(0,0,0,0.35)", // dim layer behind modals
} as const;

export const statusStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  paid: { bg: brand.tint, text: brand.dark, label: "Paid" },
  pending: { bg: brand.tint, text: brand.dark, label: "Pending" },
  failed: { bg: "#FEF3F3", text: "#B02A2A", label: "Failed" },
  refunded: { bg: "#EEEAF1", text: "#746A7E", label: "Refunded" },
  completed: { bg: brand.tint, text: brand.dark, label: "Completed" },
  cancelled: { bg: "#FEF3F3", text: "#B02A2A", label: "Cancelled" },
};

export default { brand, ui, statusStyles };
