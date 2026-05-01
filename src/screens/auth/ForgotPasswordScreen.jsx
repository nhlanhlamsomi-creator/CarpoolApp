import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { resetPassword } from '../../services/auth.service';
import { validateEmail } from '../../utils/sanitise';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    const { valid, error: emailError, value: cleanEmail } = validateEmail(email);
    if (!valid) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(cleanEmail);
      setSent(true);
    } catch (err) {
      // SECURITY: Don't reveal whether the email exists or not
      // Always show success message to prevent email enumeration attacks
      setSent(true);
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {!sent ? (
          <>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>🔑</Text>
            </View>

            <Text style={styles.title}>Forgot your password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.formCard}>
              <Input
                label="Email Address"
                placeholder="e.g. sipho@email.com"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(null);
                }}
                error={error}
                keyboardType="email-address"
              />

              {/* Security note: we never reveal if email exists */}
              <View style={styles.securityNote}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>
                  For security, we don't confirm whether an email is registered. Check your inbox after submitting.
                </Text>
              </View>

              <Button
                title="Send Reset Link"
                onPress={handleReset}
                size="full"
                loading={loading}
                style={styles.submitBtn}
              />
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>← Back to Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Sent state */
          <View style={styles.sentBox}>
            <Text style={styles.sentIcon}>📧</Text>
            <Text style={styles.sentTitle}>Check your inbox</Text>
            <Text style={styles.sentText}>
              If an account exists for {email}, you'll receive a password reset link shortly.
            </Text>
            <Text style={styles.sentSubtext}>
              Didn't receive it? Check your spam folder or try again in a few minutes.
            </Text>

            <Button
              title="Back to Login"
              onPress={() => navigation.replace('Login')}
              size="full"
              style={styles.backBtn2}
            />

            <TouchableOpacity
              onPress={() => setSent(false)}
              style={styles.retryLink}
            >
              <Text style={styles.retryText}>Try a different email</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 32 },
  backIcon: { color: colors.white, fontSize: 22 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  iconBox: {
    width: 80, height: 80,
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    ...shadows.md,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  securityIcon: { fontSize: 14 },
  securityText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    lineHeight: 18,
  },
  submitBtn: { borderRadius: radius.full },
  backLink: { marginTop: spacing.xl },
  backLinkText: { color: colors.primary, fontWeight: '600', fontSize: typography.fontSize.base },
  // Sent state
  sentBox: { alignItems: 'center', width: '100%' },
  sentIcon: { fontSize: 64, marginBottom: spacing.lg },
  sentTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sentText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  sentSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  backBtn2: { width: '100%', borderRadius: radius.full, marginBottom: spacing.md },
  retryLink: { paddingVertical: spacing.md },
  retryText: { color: colors.primary, fontWeight: '600', fontSize: typography.fontSize.base },
});
