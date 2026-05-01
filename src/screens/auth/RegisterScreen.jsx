import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function RegisterScreen({ navigation, route }) {
  const role      = route?.params?.role || 'passenger';
  const isDriver  = role === 'driver';
  const { register } = useAuth();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    fullName: '', email: '', phone: '', idNumber: '',
    password: '', confirmPassword: '',
    licenceNumber: '', vehicleMake: '', vehicleModel: '',
    vehicleColor: '', licensePlate: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.fullName.trim())    e.fullName    = 'Full name is required';
    if (!form.email.trim())       e.email       = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())       e.phone       = 'Phone number is required';
    if (!form.idNumber.trim())    e.idNumber    = 'ID number is required';
    else if (form.idNumber.length !== 13) e.idNumber = 'SA ID must be 13 digits';
    if (!form.password)           e.password    = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.licenceNumber.trim()) e.licenceNumber = 'Licence number is required';
    if (!form.vehicleMake.trim())   e.vehicleMake   = 'Vehicle make is required';
    if (!form.vehicleModel.trim())  e.vehicleModel  = 'Vehicle model is required';
    if (!form.licensePlate.trim())  e.licensePlate  = 'Licence plate is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      if (isDriver) { setStep(2); return; }
    }
    if (step === 2 && !validateStep2()) return;

    setLoading(true);
    try {
      await register({ ...form, role });
      Alert.alert('Account Created! 🎉', 'Welcome to CarpoolGo!', [
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isDriver ? 'Driver Registration' : 'Create Account'}</Text>
        <View style={{ width: 32 }} />
      </View>

      {isDriver && (
        <View style={styles.stepBar}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <Text style={styles.stepLabel}>Step {step} of 2</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Input label="Full Name *" placeholder="e.g. Sipho Dlamini" value={form.fullName} onChangeText={v => set('fullName', v)} error={errors.fullName} autoCapitalize="words" />
            <Input label="Email Address *" placeholder="e.g. sipho@email.com" value={form.email} onChangeText={v => set('email', v)} error={errors.email} keyboardType="email-address" />
            <Input label="Phone Number *" placeholder="e.g. 0821234567" value={form.phone} onChangeText={v => set('phone', v)} error={errors.phone} keyboardType="phone-pad" />
            <Input label="SA ID Number *" placeholder="13-digit ID number" value={form.idNumber} onChangeText={v => set('idNumber', v)} error={errors.idNumber} keyboardType="numeric" />
            <Input label="Password *" placeholder="Min. 8 characters" value={form.password} onChangeText={v => set('password', v)} error={errors.password} secureTextEntry />
            <Input label="Confirm Password *" placeholder="Repeat password" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} error={errors.confirmPassword} secureTextEntry />
            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Your data is encrypted. We never share personal information.</Text>
            </View>
          </>
        )}

        {step === 2 && isDriver && (
          <>
            <Text style={styles.sectionTitle}>Driver & Vehicle Details</Text>
            <Input label="Driver's Licence Number *" placeholder="e.g. 0123456789" value={form.licenceNumber} onChangeText={v => set('licenceNumber', v)} error={errors.licenceNumber} />
            <Input label="Vehicle Make *" placeholder="e.g. Toyota" value={form.vehicleMake} onChangeText={v => set('vehicleMake', v)} error={errors.vehicleMake} autoCapitalize="words" />
            <Input label="Vehicle Model *" placeholder="e.g. Corolla" value={form.vehicleModel} onChangeText={v => set('vehicleModel', v)} error={errors.vehicleModel} autoCapitalize="words" />
            <Input label="Vehicle Colour" placeholder="e.g. White" value={form.vehicleColor} onChangeText={v => set('vehicleColor', v)} autoCapitalize="words" />
            <Input label="Licence Plate *" placeholder="e.g. CA 123-456" value={form.licensePlate} onChangeText={v => set('licensePlate', v)} error={errors.licensePlate} autoCapitalize="characters" />
            <View style={styles.verifyNote}>
              <Text style={styles.securityIcon}>✅</Text>
              <Text style={styles.securityText}>Documents verified within 24 hours before your first trip.</Text>
            </View>
          </>
        )}

        <Button
          title={isDriver && step === 1 ? 'Next — Vehicle Details' : 'Create Account'}
          onPress={handleNext}
          size="full"
          loading={loading}
          style={styles.submitBtn}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginBold}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.white },
  header:       { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  backBtn:      { width: 32 },
  backIcon:     { color: colors.white, fontSize: 22 },
  headerTitle:  { flex: 1, color: colors.white, fontSize: typography.fontSize.lg, fontWeight: '700', textAlign: 'center' },
  stepBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.primaryLight, gap: spacing.sm },
  stepDot:      { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  stepDotActive:{ backgroundColor: colors.primary },
  stepLine:     { flex: 1, height: 2, backgroundColor: colors.border },
  stepLineActive:{ backgroundColor: colors.primary },
  stepLabel:    { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: '600' },
  content:      { padding: spacing.lg, paddingBottom: 48 },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  securityNote: { flexDirection: 'row', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  verifyNote:   { flexDirection: 'row', backgroundColor: '#E8F5E9', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  securityIcon: { fontSize: 14 },
  securityText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.primary, lineHeight: 20 },
  submitBtn:    { borderRadius: radius.full, marginTop: spacing.md, marginBottom: spacing.sm },
  loginLink:    { alignItems: 'center', paddingVertical: spacing.md },
  loginLinkText:{ fontSize: typography.fontSize.base, color: colors.textSecondary },
  loginBold:    { color: colors.primary, fontWeight: '700' },
});
