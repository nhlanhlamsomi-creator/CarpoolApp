import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar,
  Animated, TextInput,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { resetPassword } from '../../services/auth.service';
import { validateEmail } from '../../utils/sanitise';
import { colors, typography, spacing, radius } from '../../theme';

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconMail = ({ size = 44, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth="1.6" fill="none" />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

const IconMailInput = ({ size = 18, color = '#AAA' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth="1.7" fill="none" />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
  </Svg>
);

const IconShieldCheck = ({ size = 44, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconArrowRight = ({ size = 18, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Decorative blobs ─────────────────────────────────────────────────────────

function HeroBlobIcon({ sent }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={heroStyles.wrap}>
      {/* Outer ring */}
      <Animated.View style={[heroStyles.ringOuter, { transform: [{ scale: pulseAnim }] }]} />
      {/* Inner ring */}
      <View style={heroStyles.ringInner} />
      {/* Icon circle */}
      <View style={heroStyles.iconCircle}>
        {sent
          ? <IconShieldCheck size={40} color="#fff" />
          : <IconMail size={40} color="#fff" />
        }
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ringOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ringInner: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ icon: Icon, label, error, ...props }) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.box, error && fieldStyles.boxError]}>
        {Icon && (
          <View style={fieldStyles.iconWrap}>
            <Icon size={18} color={error ? '#EF4444' : '#AAA'} />
          </View>
        )}
        <TextInput
          style={fieldStyles.input}
          placeholderTextColor="#C0C0C0"
          autoCapitalize="none"
          {...props}
        />
      </View>
      {!!error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 7 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 52,
  },
  boxError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  iconWrap: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1a1a2e' },
  error: { fontSize: 12, color: '#EF4444', marginTop: 5, marginLeft: 4 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [sent]);

  const transitionToSent = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -24, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setSent(true);
      slideAnim.setValue(32);
      fadeAnim.setValue(0);
    });
  };

  const handleReset = async () => {
    const { valid, error: emailError, value: cleanEmail } = validateEmail(email);
    if (!valid) { setError(emailError); return; }
    setLoading(true);
    try {
      await resetPassword(cleanEmail);
    } catch {
      // intentionally silent — security: don't reveal if email exists
    } finally {
      setLoading(false);
      transitionToSent();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <IconChevronLeft size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        {/* Hero icon lives in header so it sits half in/half out the sheet */}
        <View style={styles.heroArea}>
          <HeroBlobIcon sent={sent} />
          <Text style={styles.heroTitle}>
            {sent ? 'Email Sent!' : 'Forgot Password?'}
          </Text>
          <Text style={styles.heroSub}>
            {sent
              ? `We sent a reset link to\n${email}`
              : "No worries — it happens to everyone."}
          </Text>
        </View>
      </View>

      {/* ── Sheet ── */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {!sent ? (
            <>
              <Text style={styles.cardTitle}>Enter your email</Text>
              <Text style={styles.cardSub}>
                We'll send a secure reset link — no account confirmation either way.
              </Text>

              <Field
                icon={IconMailInput}
                label="Email Address"
                placeholder="e.g. sipho@email.com"
                value={email}
                onChangeText={v => { setEmail(v); setError(null); }}
                error={error}
                keyboardType="email-address"
              />

              {/* Security note */}
              <View style={styles.securityRow}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z" fill={colors.primary} opacity={0.7} />
                  <Path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.securityText}>
                  We never reveal whether an email is registered.
                </Text>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={[styles.ctaBtn, loading && { opacity: 0.72 }]}
                onPress={handleReset}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.ctaBtnText}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </Text>
                {!loading && <IconArrowRight size={18} color="#fff" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backLink}
                activeOpacity={0.7}
              >
                <Text style={styles.backLinkText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Check your inbox</Text>
              <Text style={styles.cardSub}>
                If an account exists for this email, you'll receive a reset link shortly. Also check your spam folder.
              </Text>

              {/* Tips */}
              {[
                'Check your spam or junk folder',
                'The link expires in 15 minutes',
                'Request a new link if needed',
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}

              {/* Back to login */}
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => navigation.replace('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaBtnText}>Back to Login</Text>
                <IconArrowRight size={18} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  fadeAnim.setValue(0);
                  slideAnim.setValue(32);
                  setSent(false);
                }}
                style={styles.backLink}
                activeOpacity={0.7}
              >
                <Text style={styles.backLinkText}>Try a different email</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  // Header / hero area
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroArea: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 26,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13.5,
    color: '#888',
    lineHeight: 20,
    marginBottom: 22,
  },

  // Security note
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: (colors.primaryLight || '#E8F5EE'),
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 17,
    fontWeight: '500',
  },

  // Tips (sent state)
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  tipText: {
    fontSize: 13.5,
    color: '#666',
    lineHeight: 20,
  },

  // CTA
  ctaBtn: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Back link
  backLink: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});