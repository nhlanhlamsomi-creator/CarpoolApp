import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Animated, Alert, Image,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius, shadows } from '../../theme';

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconGoogle = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

const IconPassenger = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconCar = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 17H3V9l2-5h14l2 5v8h-2" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <Path d="M3 12h18" stroke={color} strokeWidth="1.8" />
    <Circle cx="7.5" cy="17" r="2" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="16.5" cy="17" r="2" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }) {
  const { login }               = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide   = useRef(new Animated.Value(-20)).current;
  const cardOpacity   = useRef(new Animated.Value(0)).current;
  const cardSlide     = useRef(new Animated.Value(28)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(headerSlide,   { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity,   { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardSlide,     { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      ]),
      Animated.timing(footerOpacity,   { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      navigation.replace(user.role === 'driver' ? 'DriverTabs' : 'PassengerTabs');
    } catch {
      Alert.alert('Login Failed', 'Incorrect email or password.');
    } finally {
      setLoading(false);
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
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <IconChevronLeft size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.headerContent,
            { opacity: headerOpacity, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <View style={styles.logoBox}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Welcome back</Text>
          <Text style={styles.headerSub}>Log in to your Lyft account</Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Form card ── */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <Input
            label="Email Address"
            placeholder="e.g. sipho@email.com"
            value={email}
            onChangeText={v => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: null })); }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={v => { setPassword(v); if (errors.password) setErrors(p => ({ ...p, password: null })); }}
            error={errors.password}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Logging in…' : 'Log In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleLogin}
            activeOpacity={0.82}
          >
            <IconGoogle size={20} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Demo accounts ── */}
        <Animated.View style={[styles.demoSection, { opacity: footerOpacity }]}>
          <Text style={styles.demoLabel}>Try a demo account</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={[styles.demoCard, { backgroundColor: colors.primary }]}
              onPress={() => { setEmail('passenger@demo.com'); setPassword('password123'); }}
              activeOpacity={0.82}
            >
              <IconPassenger size={16} color="#fff" />
              <Text style={styles.demoCardText}>Passenger</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoCard, { backgroundColor: colors.primaryDark }]}
              onPress={() => { setEmail('driver@demo.com'); setPassword('password123'); }}
              activeOpacity={0.82}
            >
              <IconCar size={16} color="#fff" />
              <Text style={styles.demoCardText}>Driver</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <TouchableOpacity onPress={() => navigation.navigate('GetStarted')} activeOpacity={0.7}>
            <Text style={styles.footerText}>
              Don't have an account?{'  '}
              <Text style={styles.footerBold}>Register</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.privacyNote}>Do not sell or share my personal info</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoBox: {
    width: 68,
    height: 68,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  logoImage: {
    width: 46,
    height: 46,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Login button
  loginBtn: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBEB',
  },
  dividerText: {
    fontSize: 12,
    color: '#AAA',
    fontWeight: '500',
  },

  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },

  // Demo
  demoSection: {
    marginTop: 24,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AAA',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 14,
  },
  demoCardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
  footerBold: {
    color: colors.primary,
    fontWeight: '700',
  },
  privacyNote: {
    fontSize: 11,
    color: '#BBB',
    textDecorationLine: 'underline',
  },
});