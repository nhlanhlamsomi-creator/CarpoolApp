import { useSignIn } from "@clerk/expo/legacy";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import OAuth from "@/components/OAuth";
import hopOnLogo from "@/assets/images/hopon.logo.png";
import { brand, ui } from "@/constants/theme";

type FieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  secure?: boolean;
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
          color={error ? ui.danger : focused ? brand.dark : ui.faint}
        />
        <TextInput
          style={styles.fieldInput}
          placeholderTextColor={ui.faint}
          autoCapitalize="none"
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setHidden((value) => !value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={19}
              color={ui.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const canContinue = acceptedPrivacy && acceptedTerms;

  const onSignInPress = useCallback(async () => {
    if (!isLoaded || loading) return;

    if (!canContinue) {
      Alert.alert("Consent required", "Please accept both policies to continue.");
      return;
    }

    const email = form.email.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !form.password) {
      Alert.alert("Check your details", "Enter a valid email and password.");
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
        Alert.alert("Sign-in incomplete", "Please try signing in again.");
      }
    } catch {
      Alert.alert("Unable to sign in", "Check your email and password, then try again.");
    } finally {
      setLoading(false);
    }
  }, [canContinue, form.email, form.password, isLoaded, loading, setActive, signIn]);

  const openLegal = (tab: "privacy" | "terms") => {
    router.push({ pathname: "/(root)/legal", params: { tab } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={brand.deep} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <View style={styles.topBar}>
            <View style={styles.settingsBadge} accessibilityElementsHidden>
              <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.brandLockup}>
              <Image
                source={hopOnLogo}
                style={styles.brandIcon}
                resizeMode="contain"
                accessibilityLabel="HopOn app logo"
              />
              <Text style={styles.brandName}>HopOn</Text>
            </View>
            <View style={styles.topBarSpacer} />
          </View>
          <View style={styles.welcomeCopy}>
            <Text style={styles.headerTitle}>Welcome</Text>
            <Text style={styles.headerSub}>Sign in to find your next ride.</Text>
          </View>
          <View style={styles.heroOrb} />
          <View style={styles.heroOrbSmall} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in</Text>
          <Text style={styles.cardDescription}>
            Use your account details to continue.
          </Text>

          <Field
            label="Email"
            icon="mail-outline"
            placeholder="Email"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            value={form.email}
            onChangeText={(email) => setForm((current) => ({ ...current, email }))}
          />

          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="Password"
            secure
            textContentType="password"
            autoComplete="current-password"
            returnKeyType="done"
            value={form.password}
            onChangeText={(password) =>
              setForm((current) => ({ ...current, password }))
            }
            onSubmitEditing={onSignInPress}
          />

          <TouchableOpacity
            style={styles.forgotButton}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Forgot password?",
                "Use the password reset option from your account email, or contact support for help.",
              )
            }
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <ConsentRow
            checked={acceptedPrivacy}
            onToggle={() => setAcceptedPrivacy((value) => !value)}
            lead="I agree and accept "
            link="Privacy Policy"
            onLinkPress={() => openLegal("privacy")}
          />
          <ConsentRow
            checked={acceptedTerms}
            onToggle={() => setAcceptedTerms((value) => !value)}
            lead="I agree and accept "
            link="Terms of Use"
            onLinkPress={() => openLegal("terms")}
          />

          <Text style={styles.consentHint}>
            You can only move forward if you agree to everything above.
          </Text>

          <TouchableOpacity
            style={[styles.cta, (!canContinue || loading) && styles.disabledAction]}
            onPress={onSignInPress}
            activeOpacity={0.85}
            disabled={!canContinue || loading}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>
              {loading ? "Logging in..." : "Log in"}
            </Text>
            {!loading && (
              <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <OAuth
            showApple={false}
            googleLabel="Continue with Google"
            disabled={!canContinue}
            variant="purple"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/sign-up" asChild>
              <Pressable accessibilityRole="link">
                <Text style={styles.footerLink}>Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

type ConsentRowProps = {
  checked: boolean;
  onToggle: () => void;
  lead: string;
  link: string;
  onLinkPress: () => void;
};

function ConsentRow({
  checked,
  onToggle,
  lead,
  link,
  onLinkPress,
}: ConsentRowProps) {
  return (
    <View style={styles.consentRow}>
      <Pressable
        onPress={onToggle}
        style={styles.checkboxButton}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`${lead}${link}`}
      >
        <Ionicons
          name={checked ? "checkbox" : "square-outline"}
          size={22}
          color={checked ? brand.dark : ui.faint}
        />
      </Pressable>
      <Text style={styles.consentText}>
        {lead}
        <Text
          style={styles.consentLink}
          onPress={onLinkPress}
          accessibilityRole="link"
        >
          {link}
        </Text>
      </Text>
    </View>
  );
}

export default SignIn;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.deep,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  header: {
    height: 300,
    paddingTop: Platform.OS === "ios" ? 58 : 38,
    paddingHorizontal: 24,
    overflow: "hidden",
    backgroundColor: brand.deep,
  },
  topBar: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  brandLockup: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  brandIcon: {
    width: 32,
    height: 32,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Jakarta-ExtraBold",
    letterSpacing: -0.5,
  },
  topBarSpacer: {
    width: 40,
  },
  welcomeCopy: {
    alignItems: "center",
    marginTop: 42,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 44,
    fontFamily: "Jakarta-ExtraBold",
    letterSpacing: -0.8,
  },
  headerSub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontFamily: "Jakarta",
  },
  heroOrb: {
    position: "absolute",
    right: -78,
    bottom: -136,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "rgba(199,125,255,0.2)",
  },
  heroOrbSmall: {
    position: "absolute",
    left: -100,
    bottom: -190,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: "rgba(90,24,154,0.18)",
  },
  card: {
    marginHorizontal: 16,
    marginTop: -34,
    paddingTop: 26,
    paddingBottom: 24,
    paddingHorizontal: 22,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    shadowColor: "#100820",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: {
    color: ui.ink,
    fontSize: 23,
    fontFamily: "Jakarta-Bold",
    letterSpacing: -0.4,
  },
  cardDescription: {
    marginTop: 4,
    marginBottom: 21,
    color: ui.muted,
    fontSize: 13,
    fontFamily: "Jakarta",
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    marginBottom: 7,
    color: ui.ink,
    fontSize: 12,
    fontFamily: "Jakarta-SemiBold",
  },
  fieldBox: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  fieldBoxFocused: {
    borderColor: brand.accent,
    backgroundColor: "#FCFAFF",
  },
  fieldBoxError: {
    borderColor: ui.danger,
    backgroundColor: ui.dangerBg,
  },
  fieldInput: {
    flex: 1,
    height: "100%",
    color: ui.ink,
    fontSize: 14,
    fontFamily: "Jakarta",
  },
  fieldError: {
    marginTop: 5,
    marginLeft: 3,
    color: ui.danger,
    fontSize: 12,
    fontFamily: "Jakarta-Medium",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 14,
  },
  forgotText: {
    color: brand.dark,
    fontSize: 12,
    fontFamily: "Jakarta-SemiBold",
  },
  consentRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxButton: {
    width: 26,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  consentText: {
    flex: 1,
    color: ui.ink,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Jakarta-Medium",
  },
  consentLink: {
    color: brand.dark,
    fontFamily: "Jakarta-Bold",
  },
  consentHint: {
    marginTop: 6,
    marginBottom: 16,
    color: ui.muted,
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: "center",
    fontFamily: "Jakarta",
  },
  cta: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 27,
    backgroundColor: brand.dark,
    shadowColor: brand.dark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  disabledAction: {
    opacity: 0.52,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Jakarta-Bold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 19,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: ui.border,
  },
  dividerText: {
    color: ui.faint,
    fontSize: 10,
    fontFamily: "Jakarta-Bold",
    letterSpacing: 1.4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 19,
  },
  footerText: {
    color: ui.muted,
    fontSize: 12,
    fontFamily: "Jakarta",
  },
  footerLink: {
    color: brand.dark,
    fontSize: 12,
    fontFamily: "Jakarta-Bold",
  },
});
