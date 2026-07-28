// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens — dark green / black / white.
// Import these anywhere you need a colour in JS (map routes, icon tints,
// StatusBar). For className strings, use the arbitrary values noted below so
// the palette doesn't depend on tailwind.config.js.
// ─────────────────────────────────────────────────────────────────────────────

export const brand = {
  deep:   "#06231A", // near-black green — headers, splash        bg-[#06231A]
  dark:   "#0E5C3F", // primary — buttons, active states          bg-[#0E5C3F]
  mid:    "#12724F", // pressed / secondary surfaces              bg-[#12724F]
  accent: "#1FB574", // emerald — highlights, success             bg-[#1FB574]
  mint:   "#6FEFB4", // brightest highlight, on dark only         bg-[#6FEFB4]
  tint:   "#E6F2EC", // pale green chips and info rows            bg-[#E6F2EC]
} as const;

export const ui = {
  bg:      "#F5F8F6", // app background
  surface: "#FFFFFF",
  border:  "#E2E9E5",
  ink:     "#101814", // primary text
  muted:   "#68756F", // secondary text
  faint:   "#9BA6A1", // captions, placeholders
  danger:  "#E04545",
  dangerBg:"#FEF3F3",
  warning: "#E3A008",
} as const;

/** Status pill colours, keyed by the payment_status / trip status string. */
export const statusStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  paid:      { bg: "#E6F2EC", text: "#0E5C3F", label: "Paid" },
  pending:   { bg: "#FDF4E3", text: "#8A6100", label: "Pending" },
  failed:    { bg: "#FEF3F3", text: "#B02A2A", label: "Failed" },
  refunded:  { bg: "#EEF1F0", text: "#68756F", label: "Refunded" },
  completed: { bg: "#E6F2EC", text: "#0E5C3F", label: "Completed" },
  cancelled: { bg: "#FEF3F3", text: "#B02A2A", label: "Cancelled" },
};

export default { brand, ui, statusStyles };
