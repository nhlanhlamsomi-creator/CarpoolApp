import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MOCK_DRIVER_TRIPS } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function DriverHomeScreen({ navigation }) {
  const { user }                    = useAuth();
  const [available, setAvailable]   = useState(false);
  const [trips, setTrips]           = useState(MOCK_DRIVER_TRIPS);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Offer a Ride 🚗</Text>
          <Text style={styles.greetingSub}>Hi {user?.fullName?.split(' ')[0] || 'Driver'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('DriverProfile')}>
          <Text style={styles.avatarInitial}>{user?.fullName?.[0] || 'D'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Availability */}
        <View style={styles.availCard}>
          <View>
            <Text style={styles.availTitle}>Driver Availability</Text>
            <Text style={[styles.availStatus, available ? styles.statusOn : styles.statusOff]}>
              {available ? '🟢 Online — accepting bookings' : '🔴 Offline'}
            </Text>
          </View>
          <Switch value={available} onValueChange={setAvailable} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: '💰', label: 'Total Earned', value: 'R 90.00' },
            { icon: '⏳', label: 'Pending', value: 'R 25.00' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Active trips */}
        <Text style={styles.sectionLabel}>Your Active Trips ({trips.length})</Text>
        {trips.map(trip => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripTop}>
              <View style={styles.tripRoute}>
                <Text style={styles.tripFrom}>{trip.from}</Text>
                <Text style={styles.tripArrow}>→</Text>
                <Text style={styles.tripTo}>{trip.to}</Text>
              </View>
              <Text style={styles.tripPrice}>R{trip.pricePerSeat}</Text>
            </View>
            <Text style={styles.tripMeta}>
              {trip.departureTime} · {trip.availableSeats} seats left
              {trip.recurring ? ` · 🔄 ${trip.recurringDays}` : ''}
            </Text>
            <View style={styles.tripActions}>
              <TouchableOpacity
                style={styles.chatTripBtn}
                onPress={() => navigation.navigate('TripChat', {
                  tripId: trip.id,
                  tripRoute: `${trip.from} → ${trip.to}`,
                })}
              >
                <Text style={styles.chatTripBtnText}>💬 Chat with passengers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => navigation.navigate('ActiveRide', {
                  tripId: trip.id,
                  from: trip.from,
                  to: trip.to,
                  pricePerSeat: trip.pricePerSeat,
                })}
              >
                <Text style={styles.startBtnText}>Start →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateTrip')}>
          <Text style={styles.createBtnText}>+ Create New Trip</Text>
        </TouchableOpacity>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips to maximise earnings</Text>
          <Text style={styles.tip}>• Offer trips for regular routes to university campuses</Text>
          <Text style={styles.tip}>• Keep your schedule consistent for repeat bookings</Text>
          <Text style={styles.tip}>• Maintain a high rating — passengers filter by rating</Text>
          <Text style={styles.tip}>• Use the chat to confirm pickup points with passengers</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:       { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white },
  greetingSub:    { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  avatarBtn:      { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { color: colors.white, fontWeight: '800', fontSize: 18 },
  content:        { padding: spacing.lg, paddingBottom: 48 },
  availCard:      { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, ...shadows.sm },
  availTitle:     { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  availStatus:    { fontSize: typography.fontSize.sm, marginTop: 4 },
  statusOn:       { color: colors.primary },
  statusOff:      { color: colors.error },
  statsRow:       { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard:       { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statIcon:       { fontSize: 24, marginBottom: 4 },
  statValue:      { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.primary },
  statLabel:      { fontSize: typography.fontSize.xs, color: colors.textMuted },
  sectionLabel:   { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  tripCard:       { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  tripTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tripRoute:      { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  tripFrom:       { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  tripArrow:      { color: colors.textMuted },
  tripTo:         { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  tripPrice:      { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.primary },
  tripMeta:       { fontSize: typography.fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
  tripActions:    { flexDirection: 'row', gap: spacing.sm },
  chatTripBtn:    { flex: 1, backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingVertical: 10, alignItems: 'center' },
  chatTripBtnText:{ color: colors.primary, fontWeight: '700', fontSize: typography.fontSize.sm },
  startBtn:       { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  startBtnText:   { color: colors.white, fontWeight: '700' },
  createBtn:      { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 18, alignItems: 'center', marginBottom: spacing.md },
  createBtnText:  { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  tipsCard:       { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg },
  tipsTitle:      { fontWeight: '700', color: colors.primaryDark, marginBottom: spacing.sm },
  tip:            { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 20 },
});
