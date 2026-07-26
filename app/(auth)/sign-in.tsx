import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import OAuth from "@/components/OAuth";

const { width } = Dimensions.get("window");

// ─── Palette ─────────────────────────────────────────────────────────────────
const GREEN = {
  deep:   "#06231A",
  dark:   "#0E5C3F",
  mid:    "#12724F",
  accent: "#1FB574",
  mint:   "#6FEFB4",
  tint:   "#E6F2EC",
};

const INK    = "#101814";
const MUTED  = "#68756F";
const BORDER = "#E2E9E5";
const DANGER = "#E04545";

// ─── Field ───────────────────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  secure?: boolean;
  [key: string]: any;
};

function Field({ label, icon, error, secure, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[
          styles.fieldBox,
          focused && styles.fieldBoxFocused,
          !!error && styles.fieldBoxError,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={error ? DANGER : focused ? GREEN.dark : "#A7B2AD"}
        />

        <TextInput
          style={styles.fieldInput}
          placeholderTextColor="#B4BEB9"
          autoCapitalize="none"
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {secure && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} activeOpacity={0.7}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={19}
              color="#A7B2AD"
            />
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // ── Animations ─────────────────────────────────────────────────────────────
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-18)).current;
  const cardFade    = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(34)).current;
  const footerFade  = useRef(new Animated.Value(0)).current;
  const ringSpin    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 460, useNativeDriver: true }),
        Animated.spring(headerSlide, {
          toValue: 0,
          tension: 68,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(cardSlide, {
          toValue: 0,
          tension: 66,
          friction: 11,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerFade, { toValue: 1, duration: 360, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // ── Clerk sign-in — unchanged ──────────────────────────────────────────────
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, form]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={GREEN.deep} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
          <Animated.View style={[styles.orbitRing, { transform: [{ rotate: spin }] }]} />

          <Animated.View
            style={[
              styles.headerInner,
              { opacity: headerFade, transform: [{ translateY: headerSlide }] },
            ]}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={21} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>

            <View style={styles.logoBadge}>
              <Ionicons name="car-sport" size={30} color={GREEN.dark} />
            </View>

            <Text style={styles.headerTitle}>Welcome back</Text>
            <Text style={styles.headerSub}>Log in to keep riding and saving</Text>
          </Animated.View>
        </View>

        {/* ── Form card ── */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardFade, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <Field
            label="Email address"
            icon="mail-outline"
            placeholder="e.g. sipho@email.com"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />

          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="Enter your password"
            secure
            textContentType="password"
            value={form.password}
            onChangeText={(value: string) => setForm({ ...form, password: value })}
          />

          <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cta, loading && { opacity: 0.72 }]}
            onPress={onSignInPress}
            activeOpacity={0.88}
            disabled={loading}
          >
            <Text style={styles.ctaText}>{loading ? "Logging in…" : "Log in"}</Text>
            {!loading && <Ionicons name="arrow-forward" size={19} color="#fff" />}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <OAuth />
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: footerFade }]}>
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark-outline" size={15} color={GREEN.dark} />
            <Text style={styles.trustText}>Every driver is verified before they drive</Text>
          </View>

          <Link href="/sign-up" style={styles.signupLink}>
            <Text style={styles.signupLabel}>Don&apos;t have an account? </Text>
            <Text style={styles.signupAction}>Sign up</Text>
          </Link>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F6",
  },
  scroll: {
    paddingBottom: 40,
  },

  // Header
  header: {
    height: 300,
    backgroundColor: GREEN.deep,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: "hidden",
  },
  blobA: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: GREEN.dark,
    opacity: 0.5,
    top: -width * 0.72,
    right: -width * 0.3,
  },
  blobB: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: GREEN.mid,
    opacity: 0.2,
    bottom: -width * 0.5,
    left: -width * 0.3,
  },
  orbitRing: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1.5,
    borderColor: "transparent",
    borderTopColor: "rgba(111,239,180,0.4)",
    borderRightColor: "rgba(31,181,116,0.15)",
    alignSelf: "center",
    top: 62,
  },
  headerInner: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 62 : 46,
    paddingHorizontal: 22,
  },
  backBtn: {
    position: "absolute",
    left: 22,
    top: Platform.OS === "ios" ? 58 : 42,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 18,
    shadowColor: GREEN.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 14,
  },
  headerTitle: {
    fontSize: 27,
    fontFamily: "Jakarta-ExtraBold",
    color: "#fff",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13.5,
    fontFamily: "Jakarta",
    color: "rgba(255,255,255,0.62)",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -34,
    borderRadius: 26,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },

  // Field
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontFamily: "Jakarta-SemiBold",
    color: "#4A5450",
    marginBottom: 8,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    height: 54,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#F8FAF9",
  },
  fieldBoxFocused: {
    borderColor: GREEN.dark,
    backgroundColor: "#fff",
  },
  fieldBoxError: {
    borderColor: DANGER,
    backgroundColor: "#FEF3F3",
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Jakarta",
    color: INK,
  },
  fieldError: {
    fontSize: 12,
    fontFamily: "Jakarta-Medium",
    color: DANGER,
    marginTop: 6,
    marginLeft: 4,
  },

  // Forgot
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Jakarta-SemiBold",
    color: GREEN.dark,
  },

  // CTA
  cta: {
    height: 56,
    borderRadius: 17,
    backgroundColor: GREEN.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: GREEN.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Jakarta-Bold",
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerText: {
    fontSize: 11.5,
    fontFamily: "Jakarta-Medium",
    color: "#9BA6A1",
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: 26,
    gap: 16,
    paddingHorizontal: 24,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GREEN.tint,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  trustText: {
    fontSize: 12,
    fontFamily: "Jakarta-Medium",
    color: GREEN.dark,
  },
  signupLink: {
    textAlign: "center",
  },
  signupLabel: {
    fontSize: 14,
    fontFamily: "Jakarta",
    color: MUTED,
  },
  signupAction: {
    fontSize: 14,
    fontFamily: "Jakarta-Bold",
    color: GREEN.dark,
  },
});