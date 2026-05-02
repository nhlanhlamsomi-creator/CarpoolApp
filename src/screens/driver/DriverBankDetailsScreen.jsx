import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Platform, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BANKS = ['ABSA', 'Capitec', 'FNB', 'Nedbank', 'Standard Bank', 'African Bank', 'Bidvest', 'Discovery Bank', 'TymeBank', 'Other'];
const ACCOUNT_TYPES = ['Cheque / Current', 'Savings', 'Transmission'];

function Field({ label, value, onChangeText, placeholder, keyboardType, hint, maxLength }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.fieldInput, focused && s.fieldFocused]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor="#C0C0C0" keyboardType={keyboardType || 'default'}
        maxLength={maxLength} autoCapitalize="words"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {!!hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

export default function DriverBankDetailsScreen({ navigation }) {
  const [form, setForm] = useState({ bank: '', accountType: '', accountHolder: '', accountNumber: '', branchCode: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isValid = form.bank && form.accountType && form.accountHolder.trim() && form.accountNumber.length >= 9;

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}><View style={{ width: 38 }} /><Text style={s.headerTitle}>Bank Details</Text><View style={{ width: 38 }} /></View>
      <View style={s.successWrap}>
        <View style={s.successCircle}>
          <Svg width={52} height={52} viewBox="0 0 24 24" fill="none"><Path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </View>
        <Text style={s.successTitle}>Bank Added!</Text>
        <Text style={s.successSub}>Your bank account has been saved. Payouts will be processed after each trip.</Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}><Text style={s.doneBtnText}>Back to Profile</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}><IconChevronLeft size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>Bank Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Bank selector */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Select Your Bank</Text>
          <View style={s.chipRow}>
            {BANKS.map(b => (
              <TouchableOpacity key={b} style={[s.chip, form.bank === b && s.chipActive]} onPress={() => set('bank', b)} activeOpacity={0.8}>
                <Text style={[s.chipText, form.bank === b && s.chipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account type */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Account Type</Text>
          <View style={s.chipRow}>
            {ACCOUNT_TYPES.map(t => (
              <TouchableOpacity key={t} style={[s.chip, form.accountType === t && s.chipActive]} onPress={() => set('accountType', t)} activeOpacity={0.8}>
                <Text style={[s.chipText, form.accountType === t && s.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Account Details</Text>
          <Field label="Account Holder Name" value={form.accountHolder} onChangeText={v => set('accountHolder', v)} placeholder="Full name as on your bank account" hint="Must match your ID exactly" />
          <Field label="Account Number" value={form.accountNumber} onChangeText={v => set('accountNumber', v.replace(/\D/g, '').slice(0, 16))} placeholder="e.g. 1234567890" keyboardType="number-pad" maxLength={16} />
          <Field label="Branch Code" value={form.branchCode} onChangeText={v => set('branchCode', v.replace(/\D/g, '').slice(0, 6))} placeholder="e.g. 632005" keyboardType="number-pad" maxLength={6} hint="Universal branch code for most SA banks is 051001" />
        </View>

        <View style={s.privacyNote}>
          <Text style={s.privacyText}>🔒  Your banking details are encrypted using bank-grade security. Payouts are processed within 24 hours of trip completion.</Text>
        </View>

        <TouchableOpacity style={[s.submitBtn, (!isValid || loading) && { opacity: 0.45 }]} onPress={handleSubmit} disabled={!isValid || loading} activeOpacity={0.85}>
          <Text style={s.submitText}>{loading ? 'Saving…' : 'Save Bank Account'}</Text>
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
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a2e', marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F7F8FA' },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#888' },
  chipTextActive: { color: colors.primary },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  fieldInput: { fontSize: 16, color: '#1a1a2e', backgroundColor: '#F7F8FA', borderRadius: 13, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 13 },
  fieldFocused: { borderColor: colors.primary, backgroundColor: '#fff' },
  hint: { fontSize: 11.5, color: '#AAA', marginTop: 5 },
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