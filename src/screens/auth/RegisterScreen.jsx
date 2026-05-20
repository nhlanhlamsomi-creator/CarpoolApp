import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/sanitise';
import { colors, typography, spacing, radius } from '../../theme';

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

function Field({ label, error, ...props }) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, error && fieldStyles.inputError]}
        placeholderTextColor="#A1A5B0"
        {...props}
      />
      {!!error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

export default function RegisterScreen({ navigation, route }) {
  const { register } = useAuth();
  const role = route?.params?.role || 'passenger';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!validateEmail(email).valid) nextErrors.email = 'Enter a valid email';
    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'At least 6 characters';
    if (!phone.trim()) nextErrors.phone = 'Phone number is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
      });
      Alert.alert('Account created', 'Your account has been saved to Firebase. Please log in.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error) {
      Alert.alert('Registration failed', error?.message || 'Please try again.');
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <IconChevronLeft />
        </TouchableOpacity>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Sign up as a {role === 'driver' ? 'driver' : 'passenger'} and start booking or earning rides.
        </Text>
      </View>

      <View style={styles.sheet}>
        <Field
          label="Full Name"
          value={fullName}
          onChangeText={text => { setFullName(text); setErrors(prev => ({ ...prev, fullName: null })); }}
          placeholder="e.g. Sipho Dlamini"
          autoCapitalize="words"
          error={errors.fullName}
        />

        <Field
          label="Email Address"
          value={email}
          onChangeText={text => { setEmail(text); setErrors(prev => ({ ...prev, email: null })); }}
          placeholder="e.g. sipho@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Field
          label="Phone Number"
          value={phone}
          onChangeText={text => { setPhone(text); setErrors(prev => ({ ...prev, phone: null })); }}
          placeholder="e.g. 082 123 4567"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Field
          label="Password"
          value={password}
          onChangeText={text => { setPassword(text); setErrors(prev => ({ ...prev, password: null })); }}
          placeholder="At least 6 characters"
          secureTextEntry
          error={errors.password}
        />

        <TouchableOpacity
          style={[styles.ctaBtn, loading && { opacity: 0.75 }]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.ctaText}>{loading ? 'Creating account…' : 'Create account'}</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={styles.linkLabel}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')} activeOpacity={0.75}>
            <Text style={styles.linkAction}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
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
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  ctaBtn: {
    marginTop: 14,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  linkLabel: {
    color: '#7A7F8F',
    fontSize: 14,
  },
  linkAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

const fieldStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a1a2e',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
  },
});
