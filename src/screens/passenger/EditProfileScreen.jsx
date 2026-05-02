import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Platform, Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconCheck = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

function Field({ label, value, onChangeText, placeholder, keyboardType, maxLength, editable = true, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          focused && styles.fieldInputFocused,
          !editable && styles.fieldInputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C0C0C0"
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="words"
      />
      {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
}

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const hasChanges =
    form.fullName !== (user?.fullName || '') ||
    form.email    !== (user?.email    || '') ||
    form.phone    !== (user?.phone    || '');

  const handleSave = async () => {
    if (!form.fullName.trim()) { Alert.alert('Required', 'Full name cannot be empty.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { Alert.alert('Invalid', 'Enter a valid email address.'); return; }
    if (form.phone.replace(/\s/g, '').length < 10) { Alert.alert('Invalid', 'Enter a valid phone number.'); return; }
    setLoading(true);
    try {
      await updateUser?.({ ...form });
      Alert.alert('Saved!', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <IconChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, (!hasChanges || loading) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!hasChanges || loading}
          activeOpacity={0.8}
        >
          <IconCheck size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Field
            label="Full Name"
            value={form.fullName}
            onChangeText={v => set('fullName', v)}
            placeholder="e.g. Sipho Dlamini"
          />
          <View style={styles.divider} />
          <Field
            label="Email Address"
            value={form.email}
            onChangeText={v => set('email', v)}
            placeholder="e.g. sipho@email.com"
            keyboardType="email-address"
            hint="Changing your email will require re-verification."
          />
          <View style={styles.divider} />
          <Field
            label="Phone Number"
            value={form.phone}
            onChangeText={v => set('phone', v)}
            placeholder="e.g. 082 123 4567"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveFullBtn, (!hasChanges || loading) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={!hasChanges || loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveFullBtnText}>{loading ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },
  saveBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: 20, paddingBottom: 48 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 16,
  },
  fieldWrap: { marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    fontSize: 16, color: '#1a1a2e', fontWeight: '500',
    backgroundColor: '#F7F8FA', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 13,
  },
  fieldInputFocused: { borderColor: colors.primary, backgroundColor: '#fff' },
  fieldInputDisabled: { color: '#AAA', backgroundColor: '#F9F9F9' },
  fieldHint: { fontSize: 11.5, color: '#AAA', marginTop: 5, marginLeft: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  saveFullBtn: {
    height: 54, backgroundColor: colors.primary, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  saveFullBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});