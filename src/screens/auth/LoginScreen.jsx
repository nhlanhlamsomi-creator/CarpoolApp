import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Animated, Alert,
} from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login }               = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const cardAnim  = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'driver') {
        navigation.replace('DriverTabs');
      } else {
        navigation.replace('PassengerTabs');
      }
    } catch {
      Alert.alert('Login Failed', 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View style={styles.logoBox}><Text style={styles.logoEmoji}>🚗</Text></View>
        <Text style={styles.headerTitle}>Login</Text>
        <Text style={styles.headerSub}>Login to your CarpoolGo profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: cardAnim }] }]}>
          <Input
            label="Email Address"
            placeholder="e.g. sipho@email.com"
            value={email}
            onChangeText={v => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: null })); }}
            error={errors.email}
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={v => { setPassword(v); if (errors.password) setErrors(p => ({ ...p, password: null })); }}
            error={errors.password}
            secureTextEntry
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo accounts</Text>
            <TouchableOpacity onPress={() => { setEmail('passenger@demo.com'); setPassword('password123'); }}>
              <Text style={styles.demoBtn}>👤 Passenger login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEmail('driver@demo.com'); setPassword('password123'); }}>
              <Text style={styles.demoBtn}>🚗 Driver login</Text>
            </TouchableOpacity>
          </View>

          <Button title="Login" onPress={handleLogin} size="full" loading={loading} style={styles.loginBtn} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerOr}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleBtn} onPress={handleLogin}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('GetStarted')}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.footerBold}>Register</Text>
            </Text>
          </TouchableOpacity>
          <Text style={styles.privacyNote}>Do not sell or share my personal info</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: 40, alignItems: 'center' },
  logoBox:        { width: 60, height: 60, backgroundColor: colors.white, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadows.sm },
  logoEmoji:      { fontSize: 30 },
  headerTitle:    { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white, letterSpacing: -0.3 },
  headerSub:      { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  scrollContent:  { padding: spacing.lg, paddingBottom: 48 },
  card:           { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.lg, ...shadows.md },
  forgotLink:     { alignSelf: 'flex-end', marginBottom: spacing.md, marginTop: -spacing.sm },
  forgotText:     { color: colors.primary, fontSize: typography.fontSize.sm, fontWeight: '600' },
  demoBox:        { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  demoTitle:      { fontSize: typography.fontSize.xs, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  demoBtn:        { fontSize: typography.fontSize.sm, color: colors.primaryDark, paddingVertical: 4, fontWeight: '600' },
  loginBtn:       { borderRadius: radius.full, marginBottom: spacing.md },
  divider:        { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
  dividerLine:    { flex: 1, height: 1, backgroundColor: colors.border },
  dividerOr:      { marginHorizontal: spacing.sm, color: colors.textMuted, fontSize: typography.fontSize.sm },
  googleBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, paddingVertical: 14, gap: spacing.sm },
  googleG:        { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleBtnText:  { fontSize: typography.fontSize.base, color: colors.textPrimary, fontWeight: '500' },
  footer:         { alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  footerText:     { fontSize: typography.fontSize.base, color: colors.textSecondary },
  footerBold:     { color: colors.primary, fontWeight: '700' },
  privacyNote:    { fontSize: typography.fontSize.xs, color: colors.textMuted, textDecorationLine: 'underline' },
});
