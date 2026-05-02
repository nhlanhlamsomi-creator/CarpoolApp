import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Platform, Alert, ScrollView, Modal, FlatList,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme';

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconChevronDown = ({ size = 18, color = '#888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconShield = ({ size = 15, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconSearch = ({ size = 18, color = '#AAA' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" />
    <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const COUNTRIES = [
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
].sort((a, b) => a.name.localeCompare(b.name));

function CountryPicker({ visible, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={pick.container}>
        <View style={pick.header}>
          <Text style={pick.title}>Select Country</Text>
          <TouchableOpacity onPress={onClose} style={pick.closeBtn}>
            <Text style={pick.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={pick.searchWrap}>
          <IconSearch size={18} color="#AAA" />
          <TextInput style={pick.searchInput} value={search} onChangeText={setSearch} placeholder="Search country..." placeholderTextColor="#C0C0C0" autoFocus />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={i => i.code}
          renderItem={({ item }) => (
            <TouchableOpacity style={pick.row} onPress={() => { onSelect(item); setSearch(''); }} activeOpacity={0.7}>
              <Text style={pick.flag}>{item.flag}</Text>
              <Text style={pick.name}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={pick.sep} />}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
}

const pick = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 20, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  title: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  closeText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', margin: 16, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, fontSize: 15, color: '#1a1a2e' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 20 },
  flag: { fontSize: 26 },
  name: { fontSize: 15, color: '#1a1a2e', fontWeight: '500' },
  sep: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 60 },
});

export default function DriverIDVerificationScreen({ navigation }) {
  const [docType, setDocType]     = useState('sa_id');
  const [idNumber, setIdNumber]   = useState('');
  const [passport, setPassport]   = useState('');
  const [country, setCountry]     = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const saIdValid      = idNumber.replace(/\s/g, '').length === 13;
  const passportValid  = passport.trim().length >= 6 && !!country;
  const isValid        = docType === 'sa_id' ? saIdValid : passportValid;

  const formatSAId = (text) => {
    const d = text.replace(/\D/g, '').slice(0, 13);
    let f = d;
    if (d.length > 6)  f = d.slice(0, 6) + ' ' + d.slice(6);
    if (d.length > 10) f = d.slice(0, 6) + ' ' + d.slice(6, 10) + ' ' + d.slice(10);
    setIdNumber(f);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}><View style={{ width: 38 }} /><Text style={s.headerTitle}>ID Verification</Text><View style={{ width: 38 }} /></View>
      <View style={s.successWrap}>
        <View style={s.successCircle}>
          <Svg width={52} height={52} viewBox="0 0 24 24" fill="none"><Path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </View>
        <Text style={s.successTitle}>Submitted!</Text>
        <Text style={s.successSub}>Your {docType === 'sa_id' ? 'SA ID' : 'passport'} has been submitted. Verification usually takes a few minutes.</Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}><Text style={s.doneBtnText}>Back to Profile</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}><IconChevronLeft size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>ID Verification</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.introCard}>
          <Text style={s.introTitle}>Verify your identity</Text>
          <Text style={s.introSub}>Choose your document type. Required before you can accept your first trip.</Text>
        </View>

        {/* Toggle */}
        <View style={s.toggleCard}>
          <Text style={s.sectionLabel}>Document Type</Text>
          <View style={s.toggleRow}>
            <TouchableOpacity style={[s.toggleBtn, docType === 'sa_id' && s.toggleActive]} onPress={() => { setDocType('sa_id'); setPassport(''); setCountry(null); }} activeOpacity={0.8}>
              <Text style={s.toggleFlag}>🇿🇦</Text>
              <Text style={[s.toggleLabel, docType === 'sa_id' && s.toggleLabelActive]}>SA ID Book{'\n'}or Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.toggleBtn, docType === 'passport' && s.toggleActive]} onPress={() => { setDocType('passport'); setIdNumber(''); }} activeOpacity={0.8}>
              <Text style={s.toggleFlag}>🛂</Text>
              <Text style={[s.toggleLabel, docType === 'passport' && s.toggleLabelActive]}>Foreign{'\n'}Passport</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SA ID */}
        {docType === 'sa_id' && (
          <View style={s.inputCard}>
            <Text style={s.inputLabel}>SA ID Number</Text>
            <TextInput style={[s.bigInput, saIdValid && s.bigInputValid]} value={idNumber} onChangeText={formatSAId} placeholder="000000 0000 000" placeholderTextColor="#C0C0C0" keyboardType="number-pad" maxLength={15} />
            <Text style={s.hint}>{idNumber.replace(/\s/g, '').length}/13 digits</Text>
          </View>
        )}

        {/* Passport */}
        {docType === 'passport' && (
          <View style={s.inputCard}>
            <Text style={s.inputLabel}>Country of Issue</Text>
            <TouchableOpacity style={[s.countryBtn, country && s.countryBtnFilled]} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
              {country
                ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ fontSize: 24 }}>{country.flag}</Text><Text style={s.countryName}>{country.name}</Text></View>
                : <Text style={s.countryPlaceholder}>Select your country</Text>
              }
              <IconChevronDown size={18} color={country ? colors.primary : '#AAA'} />
            </TouchableOpacity>
            <Text style={[s.inputLabel, { marginTop: 18 }]}>Passport Number</Text>
            <TextInput style={[s.bigInput, passportValid && s.bigInputValid]} value={passport} onChangeText={v => setPassport(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))} placeholder="e.g. A12345678" placeholderTextColor="#C0C0C0" autoCapitalize="characters" maxLength={12} />
            <Text style={s.hint}>{passport.length} characters (min. 6)</Text>
          </View>
        )}

        <View style={s.privacyNote}>
          <IconShield size={15} color={colors.primary} />
          <Text style={s.privacyText}>Encrypted end-to-end. Never shared with passengers or third parties.</Text>
        </View>

        <TouchableOpacity style={[s.submitBtn, (!isValid || loading) && { opacity: 0.45 }]} onPress={handleSubmit} disabled={!isValid || loading} activeOpacity={0.85}>
          <Text style={s.submitText}>{loading ? 'Verifying…' : `Verify ${docType === 'sa_id' ? 'SA ID' : 'Passport'}`}</Text>
        </TouchableOpacity>
      </ScrollView>

      <CountryPicker visible={showPicker} onSelect={c => { setCountry(c); setShowPicker(false); }} onClose={() => setShowPicker(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },
  scroll: { padding: 20, paddingBottom: 48 },
  introCard: { backgroundColor: '#fff', borderRadius: 20, padding: 22, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  introTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  introSub: { fontSize: 13.5, color: '#888', lineHeight: 20 },
  toggleCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: { flex: 1, borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#F7F8FA', padding: 16, alignItems: 'center', gap: 8 },
  toggleActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  toggleFlag: { fontSize: 30 },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: '#888', textAlign: 'center', lineHeight: 18 },
  toggleLabelActive: { color: colors.primary },
  inputCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  bigInput: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', letterSpacing: 2, backgroundColor: '#F7F8FA', borderRadius: 14, borderWidth: 2, borderColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 14, textAlign: 'center' },
  bigInputValid: { borderColor: colors.primary, backgroundColor: '#fff' },
  hint: { fontSize: 12, color: '#AAA', textAlign: 'right', marginTop: 6 },
  countryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F8FA', borderRadius: 14, borderWidth: 2, borderColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 14 },
  countryBtnFilled: { borderColor: colors.primary, backgroundColor: '#fff' },
  countryName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  countryPlaceholder: { fontSize: 16, color: '#C0C0C0' },
  privacyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.primary + '10', borderRadius: 14, padding: 14, marginBottom: 20 },
  privacyText: { flex: 1, fontSize: 12.5, color: colors.primaryDark, lineHeight: 18 },
  submitBtn: { height: 54, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#1a1a2e', marginBottom: 12 },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  doneBtn: { height: 54, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});