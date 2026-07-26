/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
    "./types/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      fontFamily: {
        Jakarta: ["Jakarta", "sans-serif"],
        JakartaRegular: ["Jakarta", "sans-serif"],
        JakartaBold: ["Jakarta-Bold", "sans-serif"],
        JakartaExtraBold: ["Jakarta-ExtraBold", "sans-serif"],
        JakartaExtraLight: ["Jakarta-ExtraLight", "sans-serif"],
        JakartaLight: ["Jakarta-Light", "sans-serif"],
        JakartaMedium: ["Jakarta-Medium", "sans-serif"],
        JakartaSemiBold: ["Jakarta-SemiBold", "sans-serif"],
      },

      colors: {
        // Dark green. Same shape as before, so every existing
        // bg-primary-500 / text-primary-500 turns green with no edits.
        primary: {
          100: "#F2F8F5",
          200: "#E6F2EC", // pale tint — chips, selected rows
          300: "#C9E3D7",
          400: "#7FC9A8",
          500: "#0E5C3F", // the brand green — buttons, active states
          600: "#0B4B33",
          700: "#093B28",
          800: "#06231A", // near-black green — headers, tab bar
          900: "#04160F",
        },

        // Emerald accent, for highlights that sit on top of primary
        accent: {
          100: "#EAFBF3",
          200: "#C6F2DF",
          300: "#8FE6C1",
          400: "#4FD3A0",
          500: "#1FB574",
          600: "#189260",
          700: "#12704A",
          800: "#0C4D33",
          900: "#06301F",
        },

        secondary: {
          100: "#F7F9F8",
          200: "#EEF1F0",
          300: "#DDE3E0",
          400: "#BFC8C4",
          500: "#9BA6A1",
          600: "#68756F",
          700: "#4A5450",
          800: "#2C3532",
          900: "#101814",
        },

        success: {
          100: "#F0FBF5",
          200: "#D5F2E3",
          300: "#A9E6C6",
          400: "#5FD09B",
          500: "#1FB574",
          600: "#0E5C3F",
          700: "#0B4B33",
          800: "#093B28",
          900: "#06231A",
        },

        danger: {
          100: "#FEF3F3",
          200: "#FBDCDC",
          300: "#F7B9B9",
          400: "#EF8484",
          500: "#E04545",
          600: "#C22F2F",
          700: "#9C2525",
          800: "#761C1C",
          900: "#4F1212",
        },

        warning: {
          100: "#FDF8EB",
          200: "#FBEFCC",
          300: "#F7DF99",
          400: "#F0C74F",
          500: "#E3A008",
          600: "#B87F06",
          700: "#8A6100",
          800: "#5C4100",
          900: "#2E2000",
        },

        // Legacy keys kept so old class names keep resolving. general-500
        // is the app background, general-200 is muted body text.
        general: {
          100: "#E2E9E5", // borders
          200: "#68756F", // muted text
          300: "#EEF1F0", // subtle fills
          400: "#1FB574", // accent green
          500: "#F5F8F6", // app background
          600: "#E6F2EC", // selected row background
          700: "#E2E9E5",
          800: "#9BA6A1", // captions
        },
      },
    },
  },

  plugins: [],
};