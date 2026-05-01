import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, StatusBar, Switch,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { createTrip } from '../../services/trips.service';
import { sanitiseText, sanitiseName, sanitisePrice } from '../../utils/sanitise';
import { colors, typography, spacing, radius, shadows } from '../../theme';

const INITIAL = {
  from: '', to: '', departureDate: '', departureTime: '',
  seats: '3', price: '', recurring: false, recurringDays: '',
  vehicleMake: '', vehicleModel: '', vehicleColor: '', licensePlate: '',
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
    if (!form.from.trim())         e.from = 'Starting point is required';
    if (!form.to.trim())           e.to   = 'Destination is required';
    if (!form.departureTime.trim()) e.departureTime = 'Departure time is required';
    if (!form.price.trim())        e.price = 'Price per seat is required';
    else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.vehicleMake.trim())  e.vehicleMake = 'Vehicle make is required';
    if (!form.licensePlate.trim()) e.licensePlate = 'Licence plate is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const tripId = await createTrip({
        driverUid:     user.uid,
        from:          sanitiseText(form.from),
        to:            sanitiseText(form.to),
        departureDate: sanitiseText(form.departureDate),
        departureTime: sanitiseText(form.departureTime),
        seats:         form.seats,
        pricePerSeat:  sanitisePrice(form.price),
        recurring:     form.recurring,
        recurringDays: sanitiseText(form.recurringDays),
        vehicleMake:   sanitiseName(form.vehicleMake),
        vehicleModel:  sanitiseName(form.vehicleModel),
        vehicleColor:  sanitiseName(form.vehicleColor),
        licensePlate:  form.licensePlate.toUpperCase().trim(),
      });
      Alert.alert('Trip Created! 🚗',
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a Trip</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Route Information</Text>
        <Input label="Starting point *" placeholder="e.g. Sandton, Fourways" value={form.from} onChangeText={v => set('from', v)} error={errors.from} />
        <Input label="Destination *" placeholder="e.g. UJ Kingsway Campus" value={form.to} onChangeText={v => set('to', v)} error={errors.to} />

        <Text style={styles.section}>Date & Time</Text>
        <Input label="Departure date" placeholder="e.g. 06 March 2024" value={form.departureDate} onChangeText={v => set('departureDate', v)} />
        <Input label="Departure time *" placeholder="e.g. 07:30" value={form.departureTime} onChangeText={v => set('departureTime', v)} error={errors.departureTime} />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>🔄 Recurring trip</Text>
          <Switch
            value={form.recurring}
            onValueChange={v => set('recurring', v)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        {form.recurring && (
          <Input label="Recurring days" placeholder="e.g. Monday, Wednesday, Friday" value={form.recurringDays} onChangeText={v => set('recurringDays', v)} />
        )}

        <Text style={styles.section}>Vehicle Information</Text>
        <Input label="Vehicle make *" placeholder="e.g. Toyota" value={form.vehicleMake} onChangeText={v => set('vehicleMake', v)} error={errors.vehicleMake} autoCapitalize="words" />
        <Input label="Vehicle model" placeholder="e.g. Corolla" value={form.vehicleModel} onChangeText={v => set('vehicleModel', v)} autoCapitalize="words" />
        <Input label="Vehicle colour" placeholder="e.g. White" value={form.vehicleColor} onChangeText={v => set('vehicleColor', v)} autoCapitalize="words" />
        <Input label="Licence plate *" placeholder="e.g. CA 123-456" value={form.licensePlate} onChangeText={v => set('licensePlate', v)} error={errors.licensePlate} autoCapitalize="characters" />

        <Text style={styles.section}>Pricing & Availability</Text>
        <Input label="Available seats" placeholder="e.g. 3" value={form.seats} onChangeText={v => set('seats', v)} keyboardType="numeric" />
        <Input label="Price per seat (R) *" placeholder="e.g. 25" value={form.price} onChangeText={v => set('price', v)} error={errors.price} keyboardType="numeric" />

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Passengers will see your vehicle details and rating before booking.
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
  container:  { flex: 1, backgroundColor: colors.white },
  header:     {
    backgroundColor: colors.primary,
    paddingTop: 52, paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn:    { width: 32 },
  backIcon:   { color: colors.white, fontSize: 22 },
  headerTitle:{ flex: 1, textAlign: 'center', fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.white },
  content:    { padding: spacing.lg, paddingBottom: 60 },
  section:    { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  toggleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  toggleLabel:{ fontSize: typography.fontSize.sm, color: colors.textSecondary },
  infoBox:    { flexDirection: 'row', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  infoIcon:   { fontSize: 14 },
  infoText:   { flex: 1, fontSize: typography.fontSize.sm, color: colors.primary, lineHeight: 20 },
  submitBtn:  { borderRadius: radius.full },
});
