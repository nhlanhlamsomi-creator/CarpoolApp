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
// Matches the welcome + sign-up screens exactly.
const WARM = {
  cream:     "#FBF7F0", // page background
  sand:      "#F4EDE1", // cards, pills, secondary surfaces
  beige:     "#EDE3D2", // dividers, inactive tracks
  gold:      "#F5B93C", // primary accent — CTAs, focus, highlights
  goldDeep:  "#E0A11E", // pressed state, icons-on-tint, shadows
  goldSoft:  "#FCEBC4", // tinted backgrounds behind icons/badges
  charcoal:  "#2B2722", // primary text & icons
  graphite:  "#4A443D", // secondary text
  muted:     "#9A928A", // tertiary text, placeholders, divider label
  line:      "#E7DECF", // hairline borders
  taupe:     "#B8AE9E", // idle field icons
  taupeSoft: "#BCB2A2", // placeholder text
};

const INK    = WARM.charcoal;
const MUTED  = WARM.muted;
const BORDER = WARM.line;
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
          color={error ? DANGER : focused ? WARM.goldDeep : WARM.taupe}
        />

        <TextInput
          style={styles.fieldInput}
          placeholderTextColor={WARM.taupeSoft}
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
              color={WARM.taupe}
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

  // Badge float + glow
  const badgeBob  = useRef(new Animated.Value(0)).current;
  const badgeGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeBob, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgeBob, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeGlow, {
          toValue: 1.15,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgeGlow, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
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

  const badgeY = badgeBob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  // ── Clerk sign-in — unchanged ──────────────────────────────────────────────
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    const email = form.email.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !form.password) {
      Alert.alert("Error", "Invalid email or password");
      return;
    }

    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Invalid email or password");
      }
    } catch {
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, form]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={WARM.cream} />

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
              <Ionicons name="chevron-back" size={21} color={WARM.charcoal} />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.logoBadgeWrap,
                { transform: [{ translateY: badgeY }] },
              ]}
            >
              <Animated.View
                style={[
                  styles.logoBadgeGlow,
                  { transform: [{ scale: badgeGlow }] },
                ]}
              />
              <View style={styles.logoBadge}>
                <Ionicons name="car-sport" size={30} color={WARM.charcoal} />
              </View>
            </Animated.View>

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
            {!loading && (
              <View style={styles.ctaIconWrap}>
                <Ionicons name="arrow-forward" size={16} color={WARM.charcoal} />
              </View>
            )}
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
            <Ionicons name="shield-checkmark-outline" size={15} color={WARM.goldDeep} />
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
    backgroundColor: WARM.cream,
  },
  scroll: {
    paddingBottom: 40,
  },

  // Header — soft cream with golden depth layers
  header: {
    height: 300,
    backgroundColor: WARM.cream,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: "hidden",
  },
  blobA: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: WARM.goldSoft,
    opacity: 0.7,
    top: -width * 0.72,
    right: -width * 0.3,
  },
  blobB: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: WARM.sand,
    opacity: 0.9,
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
    borderTopColor: "rgba(245,185,60,0.5)",
    borderRightColor: "rgba(245,185,60,0.15)",
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
    backgroundColor: WARM.sand,
    borderWidth: 1,
    borderColor: WARM.line,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeWrap: {
    marginTop: 6,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: WARM.goldSoft,
    opacity: 0.85,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: WARM.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: WARM.goldDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 14,
  },
  headerTitle: {
    fontSize: 27,
    fontFamily: "Jakarta-ExtraBold",
    color: WARM.charcoal,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13.5,
    fontFamily: "Jakarta",
    color: WARM.graphite,
    opacity: 0.85,
  },

  // Card — warm white card with hairline border
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -34,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: WARM.line,
    shadowColor: WARM.charcoal,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 6,
  },

  // Field
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontFamily: "Jakarta-SemiBold",
    color: WARM.graphite,
    marginBottom: 8,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    height: 54,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: WARM.line,
    backgroundColor: WARM.cream,
  },
  fieldBoxFocused: {
    borderColor: WARM.gold,
    backgroundColor: "#FFFFFF",
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
    color: WARM.goldDeep,
  },

  // CTA — golden yellow, matching sign-up
  cta: {
    height: 56,
    borderRadius: 20,
    backgroundColor: WARM.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: WARM.goldDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 7,
  },
  ctaText: {
    color: WARM.charcoal,
    fontSize: 16,
    fontFamily: "Jakarta-Bold",
    letterSpacing: 0.2,
  },
  ctaIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: WARM.line,
  },
  dividerText: {
    fontSize: 11.5,
    fontFamily: "Jakarta-Medium",
    color: WARM.muted,
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
    backgroundColor: WARM.goldSoft,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  trustText: {
    fontSize: 12,
    fontFamily: "Jakarta-Medium",
    color: WARM.graphite,
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
    color: WARM.charcoal,
  },
});