module.exports = ({ config }) => {
  const requiredVariables = [
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
    "EXPO_PUBLIC_DIRECTIONS_API_KEY",
    "EXPO_PUBLIC_GEOAPIFY_API_KEY",
    "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ];
  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  const isEasBuild = process.env.EAS_BUILD === "true" || process.env.EAS_BUILD === "1";

  if (isEasBuild && missingVariables.length > 0) {
    throw new Error(
      `Missing app build environment variables: ${missingVariables.join(", ")}`,
    );
  }

  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};