import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Platform, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

function Field({ label, value, onChangeText, placeholder, keyboardType, hint, maxLength }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.fieldInput, focused && s.fieldFocused]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor="#C0C0C0" keyboardType={keyboardType || 'default'}
        maxLength={maxLength} autoCapitalize="characters"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {!!hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

const CODE_OPTIONS = ['A', 'B', 'C', 'EB', 'EC', 'C1', 'EC1'];

export default function DriverLicenceVerificationScreen({ navigation }) {
  const [form, setForm] = useState({ licenceNumber: '', pdpNumber: '', licenceCode: 'EB', expiryDate: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isValid = form.licenceNumber.trim().length >= 8 && form.expiryDate.length === 5;

  const formatExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}><View style={{ width: 38 }} /><Text style={s.headerTitle}>Driver's Licence</Text><View style={{ width: 38 }} /></View>
      <View style={s.successWrap}>
        <View style={s.successCircle}>
          <Svg width={52} height={52} viewBox="0 0 24 24" fill="none"><Path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </View>
        <Text style={s.successTitle}>Submitted!</Text>
        <Text style={s.successSub}>Your driver's licence has been submitted for verification. This usually takes a few minutes.</Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}><Text style={s.doneBtnText}>Back to Profile</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}><IconChevronLeft size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>Driver's Licence</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.cardTitle}>Licence Details</Text>
          <Text style={s.cardSub}>Enter your South African driver's licence details exactly as they appear on your card.</Text>

          <Field label="Licence Number" value={form.licenceNumber} onChangeText={v => set('licenceNumber', v.replace(/[^A-Z0-9]/g, '').slice(0, 12))} placeholder="e.g. 0123456789" hint="Found on the front of your licence card" />

          {/* Licence code selector */}
          <Text style={s.fieldLabel}>Licence Code</Text>
          <View style={s.codeRow}>
            {CODE_OPTIONS.map(code => (
              <TouchableOpacity
                key={code}
                style={[s.codeBtn, form.licenceCode === code && s.codeBtnActive]}
                onPress={() => set('licenceCode', code)}
                activeOpacity={0.8}
              >
                <Text style={[s.codeBtnText, form.licenceCode === code && s.codeBtnTextActive]}>{code}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.hint}>Code EB = standard cars · Code C = heavy vehicles</Text>

          <View style={s.rowWrap}>
            <View style={{ flex: 1 }}>
              <Field label="Expiry Date" value={form.expiryDate} onChangeText={v => set('expiryDate', formatExpiry(v))} placeholder="MM/YY" keyboardType="number-pad" maxLength={5} />
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>PDP — Professional Driving Permit</Text>
          <Text style={s.cardSub}>Required if you carry paying passengers. Leave blank if you don't have one yet.</Text>
          <Field label="PDP Number (optional)" value={form.pdpNumber} onChangeText={v => set('pdpNumber', v.replace(/[^A-Z0-9]/g, '').slice(0, 12))} placeholder="e.g. PDP123456" hint="Your PDP allows you to carry passengers for reward" />
        </View>

        <View style={s.privacyNote}>
          <Text style={s.privacyText}>🔒  Your licence details are encrypted and verified against eNaTIS. Never shared with passengers.</Text>
        </View>

        <TouchableOpacity style={[s.submitBtn, (!isValid || loading) && { opacity: 0.45 }]} onPress={handleSubmit} disabled={!isValid || loading} activeOpacity={0.85}>
          <Text style={s.submitText}>{loading ? 'Submitting…' : 'Submit Licence'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },
  scroll: { padding: 20, paddingBottom: 48 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#888', lineHeight: 19, marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  fieldInput: { fontSize: 16, color: '#1a1a2e', backgroundColor: '#F7F8FA', borderRadius: 13, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 13 },
  fieldFocused: { borderColor: colors.primary, backgroundColor: '#fff' },
  hint: { fontSize: 11.5, color: '#AAA', marginTop: 5 },
  rowWrap: { flexDirection: 'row', gap: 12 },
  codeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  codeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F7F8FA' },
  codeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  codeBtnText: { fontSize: 14, fontWeight: '700', color: '#888' },
  codeBtnTextActive: { color: colors.primary },
  privacyNote: { backgroundColor: colors.primary + '10', borderRadius: 14, padding: 14, marginBottom: 20 },
  privacyText: { fontSize: 12.5, color: colors.primaryDark, lineHeight: 18 },
  submitBtn: { height: 54, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#1a1a2e', marginBottom: 12 },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  doneBtn: { height: 54, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});