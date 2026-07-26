import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any) => {
  if (!startOAuthFlow || typeof startOAuthFlow !== "function") {
    return {
      success: false,
      code: "missing_oauth_flow",
      message: "OAuth flow is unavailable.",
    };
  }

  try {
    const response = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    if (!response || typeof response !== "object") {
      return {
        success: false,
        code: "invalid_oauth_response",
        message: "Received an invalid OAuth response.",
      };
    }

    const { createdSessionId, setActive, signUp } = response as {
      createdSessionId?: string;
      setActive?: ({ session }: { session: string }) => Promise<void>;
      signUp?: { createdUserId?: string; firstName?: string; lastName?: string; emailAddress?: string };
    };

    if (!createdSessionId) {
      return {
        success: false,
        code: "missing_session",
        message: "Google sign-in did not create a session.",
      };
    }

    if (setActive) {
      await setActive({ session: createdSessionId });
    }

    if (signUp?.createdUserId) {
      await fetchAPI("/(api)/user", {
        method: "POST",
        body: JSON.stringify({
          name: `${signUp.firstName ?? ""} ${signUp.lastName ?? ""}`.trim(),
          email: signUp.emailAddress ?? "",
          clerkId: signUp.createdUserId,
        }),
      });
    }

    return {
      success: true,
      code: "success",
      message: "You have successfully signed in with Google",
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      code: err?.code ?? "unknown_error",
      message:
        err?.message || err?.errors?.[0]?.longMessage ||
        "An error occurred while signing in with Google",
    };
  }
};
