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
          100: "#E4EFEA",
          200: "#E4EFEA",
          300: "#5FD3A6",
          400: "#1FA574",
          500: "#0A3B2E",
          600: "#14523F",
          700: "#0A3B2E",
          800: "#04231C",
          900: "#04231C",
        },

        // Emerald accent, for highlights that sit on top of primary
        accent: {
          100: "#E4EFEA",
          200: "#E4EFEA",
          300: "#5FD3A6",
          400: "#1FA574",
          500: "#1FA574",
          600: "#14523F",
          700: "#0A3B2E",
          800: "#04231C",
          900: "#04231C",
        },

        secondary: {
          100: "#F4F6F5",
          200: "#E4EFEA",
          300: "#E3E7E5",
          400: "#A9B1AD",
          500: "#7A8580",
          600: "#7A8580",
          700: "#101814",
          800: "#101814",
          900: "#101814",
        },

        success: {
          100: "#E4EFEA",
          200: "#E4EFEA",
          300: "#5FD3A6",
          400: "#1FA574",
          500: "#1FA574",
          600: "#14523F",
          700: "#0A3B2E",
          800: "#04231C",
          900: "#04231C",
        },

        danger: {
          100: "#FEF3F3",
          200: "#FBDCDC",
          300: "#F7B9B9",
          400: "#EF8484",
          500: "#E0575B",
          600: "#C22F2F",
          700: "#9C2525",
          800: "#761C1C",
          900: "#4F1212",
        },

        warning: {
          100: "#E4EFEA",
          200: "#E4EFEA",
          300: "#5FD3A6",
          400: "#1FA574",
          500: "#1FA574",
          600: "#14523F",
          700: "#0A3B2E",
          800: "#04231C",
          900: "#04231C",
        },

        // Legacy keys kept so old class names keep resolving. general-500
        // is the app background, general-200 is muted body text.
        general: {
          100: "#E3E7E5", // borders
          200: "#7A8580", // muted text
          300: "#E4EFEA", // subtle fills
          400: "#1FA574", // accent green
          500: "#F4F6F5", // app background
          600: "#E4EFEA", // selected row background
          700: "#E3E7E5",
          800: "#A9B1AD", // captions
        },
      },
    },
  },

  plugins: [],
};
