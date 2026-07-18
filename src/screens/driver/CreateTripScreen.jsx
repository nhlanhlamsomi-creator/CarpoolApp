import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, StatusBar, Switch,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { createTrip } from '../../services/trips.service';
import { sanitiseText, sanitisePrice } from '../../utils/sanitise';
import { colors, typography, spacing, radius, shadows } from '../../theme';

const INITIAL = {
  from: '', to: '', departureDate: '', departureTime: '',
  seats: '3', price: '', recurring: false, recurringDays: '',
};

const BackIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MapPinIcon = ({ color = colors.textMuted }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth="1.8"/>
    <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.8"/>
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v3M16 2v3M3.5 9h17M4 5h16a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke={colors.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const ClockIcon = ({ color = colors.textMuted }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const RepeatIcon = ({ color = colors.textSecondary }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M17 1l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 11V9a4 4 0 014-4h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 23l-4-4 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SeatIcon = ({ color = colors.textMuted }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M6 2v10a2 2 0 002 2h8a2 2 0 002-2V2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Path d="M6 14v6M18 14v6M4 20h16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const CurrencyIcon = ({ color = colors.textMuted }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const InfoIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={colors.primary} strokeWidth="1.8"/>
    <Path d="M12 8v1M12 11v5" stroke={colors.primary} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const SectionIcon = ({ children }) => (
  <View style={sectionIconStyle}>{children}</View>
);
const sectionIconStyle = {
  width: 28, height: 28, borderRadius: 8,
  backgroundColor: colors.primaryLight,
  alignItems: 'center', justifyContent: 'center',
};

export default function CreateTripScreen({ navigation }) {
  const { user }              = useAuth();
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.from.trim())          e.from = 'Starting point is required';
    if (!form.to.trim())            e.to   = 'Destination is required';
    if (!form.departureTime.trim()) e.departureTime = 'Departure time is required';
    if (!form.price.trim())         e.price = 'Price per seat is required';
    else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
      e.price = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await createTrip({
        driverUid:     user.uid,
        from:          sanitiseText(form.from),
        to:            sanitiseText(form.to),
        departureDate: sanitiseText(form.departureDate),
        departureTime: sanitiseText(form.departureTime),
        seats:         form.seats,
        pricePerSeat:  sanitisePrice(form.price),
        recurring:     form.recurring,
        recurringDays: sanitiseText(form.recurringDays),
      });
      Alert.alert(
        'Trip Created!',
        'Your trip is now listed. Passengers can book seats.',
        [{ text: 'View Trips', onPress: () => navigation.navigate('DriverHome') }]
      );
      setForm(INITIAL);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not create trip. Please try again.');
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
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a Trip</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Route */}
        <View style={styles.sectionHeader}>
          <SectionIcon><MapPinIcon color={colors.primary} /></SectionIcon>
          <Text style={styles.section}>Route</Text>
        </View>
        <Input
          label="Starting point *"
          placeholder="e.g. Sandton, Fourways"
          value={form.from}
          onChangeText={v => set('from', v)}
          error={errors.from}
        />
        <Input
          label="Destination *"
          placeholder="e.g. UJ Kingsway Campus"
          value={form.to}
          onChangeText={v => set('to', v)}
          error={errors.to}
        />

        {/* Date & Time */}
        <View style={styles.sectionHeader}>
          <SectionIcon><CalendarIcon /></SectionIcon>
          <Text style={styles.section}>Date & Time</Text>
        </View>
        <Input
          label="Departure date"
          placeholder="e.g. 06 May 2026"
          value={form.departureDate}
          onChangeText={v => set('departureDate', v)}
        />
        <Input
          label="Departure time *"
          placeholder="e.g. 07:30"
          value={form.departureTime}
          onChangeText={v => set('departureTime', v)}
          error={errors.departureTime}
        />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <RepeatIcon color={form.recurring ? colors.primary : colors.textSecondary} />
            <View>
              <Text style={styles.toggleLabel}>Recurring trip</Text>
              <Text style={styles.toggleSub}>Repeat on selected days</Text>
            </View>
          </View>
          <Switch
            value={form.recurring}
            onValueChange={v => set('recurring', v)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        {form.recurring && (
          <Input
            label="Recurring days"
            placeholder="e.g. Monday, Wednesday, Friday"
            value={form.recurringDays}
            onChangeText={v => set('recurringDays', v)}
          />
        )}

        {/* Pricing */}
        <View style={styles.sectionHeader}>
          <SectionIcon><CurrencyIcon color={colors.primary} /></SectionIcon>
          <Text style={styles.section}>Pricing & Seats</Text>
        </View>
        <Input
          label="Available seats"
          placeholder="e.g. 3"
          value={form.seats}
          onChangeText={v => set('seats', v)}
          keyboardType="numeric"
        />
        <Input
          label="Price per seat (R) *"
          placeholder="e.g. 25"
          value={form.price}
          onChangeText={v => set('price', v)}
          error={errors.price}
          keyboardType="numeric"
        />

        {/* Info box */}
        <View style={styles.infoBox}>
          <InfoIcon />
          <Text style={styles.infoText}>
            Passengers will see your rating and trip details before booking.
            Make sure your information is accurate.
          </Text>
        </View>

        <Button
          title="Create Trip"
          onPress={handleCreate}
          size="full"
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.white },
  header:         { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.white },
  content:        { padding: spacing.lg, paddingBottom: 60 },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.lg },
  section:        { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  toggleRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  toggleLeft:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleLabel:    { fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.textPrimary },
  toggleSub:      { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },
  infoBox:        { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  infoText:       { flex: 1, fontSize: typography.fontSize.sm, color: colors.primary, lineHeight: 20 },
  submitBtn:      { borderRadius: radius.full },
});