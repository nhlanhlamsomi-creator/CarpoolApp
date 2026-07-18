import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Platform, ScrollView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

function Field({ label, value, onChangeText, placeholder, keyboardType, hint, autoCapitalize = 'words' }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.fieldInput, focused && s.fieldFocused]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor="#C0C0C0" keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {!!hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

const VEHICLE_TYPES = ['Sedan', 'Hatchback', 'SUV', 'Minivan', 'Bakkie', 'Bus'];
const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Other'];
const YEARS = Array.from({ length: 20 }, (_, i) => String(2025 - i));

export default function DriverVehicleDetailsScreen({ navigation }) {
  const [form, setForm] = useState({
    make: '', model: '', year: '', color: '', licensePlate: '', seats: '', vehicleType: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isValid = form.make.trim() && form.model.trim() && form.licensePlate.trim() && form.year && form.color && form.seats;

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}><View style={{ width: 38 }} /><Text style={s.headerTitle}>Vehicle Details</Text><View style={{ width: 38 }} /></View>
      <View style={s.successWrap}>
        <View style={s.successCircle}>
          <Svg width={52} height={52} viewBox="0 0 24 24" fill="none"><Path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </View>
        <Text style={s.successTitle}>Vehicle Saved!</Text>
        <Text style={s.successSub}>Your vehicle details have been submitted. Our team will verify them within 24 hours.</Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}><Text style={s.doneBtnText}>Back to Profile</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}><IconChevronLeft size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>Vehicle Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Basic info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Vehicle Information</Text>
          <View style={s.twoCol}>
            <View style={{ flex: 1 }}><Field label="Make" value={form.make} onChangeText={v => set('make', v)} placeholder="e.g. Toyota" /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><Field label="Model" value={form.model} onChangeText={v => set('model', v)} placeholder="e.g. Corolla" /></View>
          </View>

          {/* Year selector */}
          <Text style={s.fieldLabel}>Year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {YEARS.map(y => (
                <TouchableOpacity key={y} style={[s.chip, form.year === y && s.chipActive]} onPress={() => set('year', y)} activeOpacity={0.8}>
                  <Text style={[s.chipText, form.year === y && s.chipTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Vehicle type */}
          <Text style={s.fieldLabel}>Vehicle Type</Text>
          <View style={s.chipRow}>
            {VEHICLE_TYPES.map(t => (
              <TouchableOpacity key={t} style={[s.chip, form.vehicleType === t && s.chipActive]} onPress={() => set('vehicleType', t)} activeOpacity={0.8}>
                <Text style={[s.chipText, form.vehicleType === t && s.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Colour & plate */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Colour & Registration</Text>

          {/* Colour */}
          <Text style={s.fieldLabel}>Vehicle Colour</Text>
          <View style={s.chipRow}>
            {COLORS.map(c => (
              <TouchableOpacity key={c} style={[s.chip, form.color === c && s.chipActive]} onPress={() => set('color', c)} activeOpacity={0.8}>
                <Text style={[s.chipText, form.color === c && s.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field label="Licence Plate" value={form.licensePlate} onChangeText={v => set('licensePlate', v.toUpperCase())} placeholder="e.g. CA 123-456" autoCapitalize="characters" hint="As it appears on your number plate" />
        </View>

        {/* Capacity */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Passenger Capacity</Text>
          <Text style={s.cardSub}>Excluding yourself as the driver.</Text>
          <View style={s.seatsRow}>
            {['1', '2', '3', '4', '5', '6', '7', '8'].map(n => (
              <TouchableOpacity key={n} style={[s.seatBtn, form.seats === n && s.seatBtnActive]} onPress={() => set('seats', n)} activeOpacity={0.8}>
                <Text style={[s.seatBtnText, form.seats === n && s.seatBtnTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.privacyNote}>
          <Text style={s.privacyText}>🔒  Vehicle details are verified against eNaTIS records. Passengers will see your plate, make, model and colour.</Text>
        </View>

        <TouchableOpacity style={[s.submitBtn, (!isValid || loading) && { opacity: 0.45 }]} onPress={handleSubmit} disabled={!isValid || loading} activeOpacity={0.85}>
          <Text style={s.submitText}>{loading ? 'Saving…' : 'Save Vehicle Details'}</Text>
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
  cardSub: { fontSize: 13, color: '#888', marginBottom: 16 },
  twoCol: { flexDirection: 'row' },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  fieldInput: { fontSize: 16, color: '#1a1a2e', backgroundColor: '#F7F8FA', borderRadius: 13, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 13 },
  fieldFocused: { borderColor: colors.primary, backgroundColor: '#fff' },
  hint: { fontSize: 11.5, color: '#AAA', marginTop: 5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F7F8FA' },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#888' },
  chipTextActive: { color: colors.primary },
  seatsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  seatBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#F7F8FA', alignItems: 'center', justifyContent: 'center' },
  seatBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  seatBtnText: { fontSize: 18, fontWeight: '800', color: '#888' },
  seatBtnTextActive: { color: '#fff' },
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