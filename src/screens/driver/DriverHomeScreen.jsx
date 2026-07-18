import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { MOCK_DRIVER_TRIPS } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

const CarIcon = ({ color = colors.white }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M5 11l1.5-4.5h11L19 11M3 16h18M5 16v3M19 16v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="7.5" cy="16" r="1.5" fill={color}/>
    <Circle cx="16.5" cy="16" r="1.5" fill={color}/>
  </Svg>
);

const ChatIcon = ({ color = colors.primary }) => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlayIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={colors.white} stroke={colors.white} strokeWidth="1.5" strokeLinejoin="round"/>
  </Svg>
);

const PlusIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={colors.white} strokeWidth="2.2" strokeLinecap="round"/>
  </Svg>
);

const RepeatIcon = ({ color = colors.textMuted }) => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path d="M17 1l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 11V9a4 4 0 014-4h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 23l-4-4 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ClockIcon = ({ color = colors.textMuted }) => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const SeatIcon = ({ color = colors.textMuted }) => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path d="M6 2v10a2 2 0 002 2h8a2 2 0 002-2V2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Path d="M6 14v6M18 14v6M4 20h16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const CurrencyIcon = ({ color = colors.primary }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const BulbIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a7 7 0 015 11.95V17a2 2 0 01-2 2H9a2 2 0 01-2-2v-3.05A7 7 0 0112 2z" stroke={colors.primaryDark} strokeWidth="1.8"/>
    <Path d="M9 21h6" stroke={colors.primaryDark} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const CheckDotIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" fill={colors.primary}/>
  </Svg>
);

export default function DriverHomeScreen({ navigation }) {
  const { user }                  = useAuth();
  const [available, setAvailable] = useState(false);
  const [trips, setTrips]         = useState(MOCK_DRIVER_TRIPS);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <View>
          <View style={styles.greetingRow}>
            <CarIcon />
            <Text style={styles.greeting}>Offer a Ride</Text>
          </View>
          <Text style={styles.greetingSub}>
            Hi {user?.fullName?.split(' ')[0] || 'Driver'}!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('DriverProfile')}
        >
          <Text style={styles.avatarInitial}>{user?.fullName?.[0] || 'D'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Availability toggle */}
        <View style={styles.availCard}>
          <View>
            <Text style={styles.availTitle}>Driver Availability</Text>
            <View style={styles.availStatusRow}>
              <View style={[styles.statusDot, available ? styles.statusDotOn : styles.statusDotOff]} />
              <Text style={[styles.availStatus, available ? styles.statusOn : styles.statusOff]}>
                {available ? 'Online — accepting bookings' : 'Offline'}
              </Text>
            </View>
          </View>
          <Switch
            value={available}
            onValueChange={setAvailable}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <CurrencyIcon color={colors.primary} />
            </View>
            <Text style={styles.statValue}>R 90.00</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <ClockIcon color={colors.primary} />
            </View>
            <Text style={styles.statValue}>R 25.00</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Active trips */}
        <Text style={styles.sectionLabel}>Your Active Trips ({trips.length})</Text>
        {trips.map(trip => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripTop}>
              <View style={styles.tripRouteCol}>
                <View style={styles.tripRouteDots}>
                  <View style={[styles.dot, styles.dotGreen]} />
                  <View style={styles.dotLine} />
                  <View style={[styles.dot, styles.dotRed]} />
                </View>
                <View>
                  <Text style={styles.tripFrom}>{trip.from}</Text>
                  <Text style={styles.tripTo}>{trip.to}</Text>
                </View>
              </View>
              <Text style={styles.tripPrice}>R{trip.pricePerSeat}</Text>
            </View>

            <View style={styles.tripMetaRow}>
              <View style={styles.metaPill}>
                <ClockIcon />
                <Text style={styles.metaText}>{trip.departureTime}</Text>
              </View>
              <View style={styles.metaPill}>
                <SeatIcon />
                <Text style={styles.metaText}>{trip.availableSeats} seats</Text>
              </View>
              {trip.recurring && (
                <View style={styles.metaPill}>
                  <RepeatIcon />
                  <Text style={styles.metaText}>{trip.recurringDays}</Text>
                </View>
              )}
            </View>

            <View style={styles.tripActions}>
              <TouchableOpacity
                style={styles.chatTripBtn}
                onPress={() => navigation.navigate('TripChat', {
                  tripId: trip.id,
                  tripRoute: `${trip.from} → ${trip.to}`,
                })}
              >
                <ChatIcon />
                <Text style={styles.chatTripBtnText}>Chat with passengers</Text>
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
                <PlayIcon />
                <Text style={styles.startBtnText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Create trip CTA */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateTrip')}
        >
          <PlusIcon />
          <Text style={styles.createBtnText}>Create New Trip</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <BulbIcon />
            <Text style={styles.tipsTitle}>Tips to maximise earnings</Text>
          </View>
          {[
            'Offer trips for regular routes to university campuses',
            'Keep your schedule consistent for repeat bookings',
            'Maintain a high rating — passengers filter by rating',
            'Use chat to confirm pickup points with passengers',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <CheckDotIcon />
              <Text style={styles.tip}>{tip}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetingRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greeting:       { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white, letterSpacing: -0.3 },
  greetingSub:    { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  avatarBtn:      { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { color: colors.white, fontWeight: '800', fontSize: 18 },
  content:        { padding: spacing.lg, paddingBottom: 48 },
  availCard:      { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, ...shadows.sm },
  availTitle:     { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  availStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot:      { width: 8, height: 8, borderRadius: 4 },
  statusDotOn:    { backgroundColor: colors.primary },
  statusDotOff:   { backgroundColor: colors.error },
  availStatus:    { fontSize: typography.fontSize.sm },
  statusOn:       { color: colors.primary },
  statusOff:      { color: colors.error },
  statsRow:       { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard:       { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statIconWrap:   { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue:      { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.primary },
  statLabel:      { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },
  sectionLabel:   { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  tripCard:       { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  tripTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  tripRouteCol:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  tripRouteDots:  { alignItems: 'center' },
  dot:            { width: 8, height: 8, borderRadius: 4 },
  dotGreen:       { backgroundColor: colors.primary },
  dotRed:         { backgroundColor: colors.error },
  dotLine:        { width: 1.5, height: 16, backgroundColor: colors.border, marginVertical: 2 },
  tripFrom:       { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  tripTo:         { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 10 },
  tripPrice:      { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.primary },
  tripMetaRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  metaPill:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  metaText:       { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  tripActions:    { flexDirection: 'row', gap: spacing.sm },
  chatTripBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingVertical: 10 },
  chatTripBtnText:{ color: colors.primary, fontWeight: '700', fontSize: typography.fontSize.sm },
  startBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  startBtnText:   { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.sm },
  createBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 18, marginBottom: spacing.md },
  createBtnText:  { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  tipsCard:       { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg },
  tipsHeader:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  tipsTitle:      { fontWeight: '700', color: colors.primaryDark, fontSize: typography.fontSize.base },
  tipRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  tip:            { flex: 1, fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
});