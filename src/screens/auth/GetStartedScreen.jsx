import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import Button from '../../components/common/Button';
import { colors, typography, spacing, radius, shadows } from '../../theme';

const { height } = Dimensions.get('window');

export default function GetStartedScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Top green header section */}
      <View style={styles.header}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🚗</Text>
        </View>
        <Text style={styles.brand}>CarpoolGo</Text>
        <Text style={styles.brandSub}>Ride Smart. Save More.</Text>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.heading}>Get Started</Text>
        <Text style={styles.subheading}>
          Enter your full Lyft profile to begin
        </Text>

        {/* Form fields placeholder — linked to real registration */}
        <View style={styles.formCard}>
          <Text style={styles.formNote}>
            Create your account or log in to continue
          </Text>

          <Button
            title="Register as Passenger"
            onPress={() => navigation.navigate('Register', { role: 'passenger' })}
            size="full"
            style={styles.btnPrimary}
          />

          <Button
            title="Register as Driver"
            onPress={() => navigation.navigate('Register', { role: 'driver' })}
            variant="secondary"
            size="full"
            style={styles.btnSecondary}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social login options */}
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Already have account */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  logoIcon: {
    fontSize: 36,
  },
  brand: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  heading: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formNote: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  btnPrimary: {
    marginBottom: spacing.md,
    borderRadius: radius.full,
  },
  btnSecondary: {
    marginBottom: spacing.md,
    borderRadius: radius.full,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  socialBtnText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  loginLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  loginLinkBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});
