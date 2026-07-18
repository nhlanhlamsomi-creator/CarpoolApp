export const colors = {
  // Primary green palette (matches Lyft-inspired Figma)
  primary: '#1A7A4A',        // Main green
  primaryDark: '#155C38',    // Pressed/active
  primaryLight: '#E8F5EE',   // Light tint backgrounds
  primaryMid: '#2ECC71',     // Accent green
  accent: '#27AE60',         // Secondary green

  // Neutrals
  white: '#FFFFFF',
  background: '#F7FAF9',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#5C6B73',
  textMuted: '#9BA8AF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E0EBE5',
  borderLight: '#F0F5F2',

  // Status
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#2980B9',

  // Map/trip specific
  routeLine: '#1A7A4A',
  pickup: '#27AE60',
  dropoff: '#E74C3C',

  // Overlays
  overlay: 'rgba(26, 26, 46, 0.5)',
  overlayLight: 'rgba(26, 122, 74, 0.08)',
};

export const typography = {
  // Font families (React Native uses system fonts; in Expo you'd load custom)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#1A7A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
