import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Alert, Linking,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { listenToTrip, updateTripStatus } from '../../services/trips.service';
import { colors, typography, spacing, radius, shadows } from '../../theme';

const BackIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CarIcon = ({ color = colors.primary, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 11l1.5-4.5h11L19 11M3 16h18M5 16v3M19 16v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="7.5" cy="16" r="1.5" fill={color}/>
    <Circle cx="16.5" cy="16" r="1.5" fill={color}/>
  </Svg>
);

const PhoneIcon = ({ color = colors.primary }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.82 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ShieldIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 12l2 2 4-4" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MapIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 4v13M15 7v13" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
  </Svg>
);

const LocationDotIcon = ({ color }) => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8" fill={color}/>
    <Circle cx="12" cy="12" r="3" fill="white"/>
  </Svg>
);

const ClockIcon = ({ color = colors.textMuted, size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const PlayIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={colors.white} stroke={colors.white} strokeWidth="1" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={colors.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const XIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const CurrencyIcon = ({ color = colors.primary, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

export default function ActiveRideScreen({ navigation, route }) {
  const { user, isDriver } = useAuth();
  const { tripId, driverName, from, to, pricePerSeat } = route?.params || {};

  const [tripStatus, setTripStatus]     = useState('active');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);

  const timerRef    = useRef(null);
  const locationRef = useRef(null);
  const slideAnim   = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, tension: 55, friction: 11, useNativeDriver: true,
    }).start();

    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);

    if (isDriver) startLocationTracking();

    const unsubscribe = listenToTrip(tripId, (trip) => {
      setTripStatus(trip.status);
      if (trip.status === 'completed') {
        clearInterval(timerRef.current);
        if (!isDriver) navigation.replace('RateDriver', { tripId, driverName });
        else navigation.replace('DriverTabs');
      }
    });

    return () => {
      clearInterval(timerRef.current);
      locationRef.current?.remove();
      unsubscribe();
    };
  }, []);

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    locationRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 20 },
      (loc) => setDriverLocation(loc.coords)
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndTrip = () => {
    Alert.alert('End Trip?', 'Confirm that you have arrived at the destination.', [
      { text: 'Not Yet', style: 'cancel' },
      { text: 'Yes, End Trip', onPress: async () => await updateTripStatus(tripId, 'completed') },
    ]);
  };

  const statusConfig = {
    active:      { label: 'Waiting for driver', color: colors.warning,  bg: '#FFF8E1' },
    in_progress: { label: 'Trip in progress',   color: colors.primary,  bg: colors.primaryLight },
    completed:   { label: 'Arrived',            color: '#2E7D32',       bg: '#E8F5E9' },
  };
  const status = statusConfig[tripStatus] || statusConfig.active;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Map placeholder */}
      <View style={styles.mapArea}>
        {/* Simulated map grid */}
        <View style={styles.mapGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.mapGridLine, styles.mapGridLineH, { top: `${(i + 1) * 14}%` }]} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.mapGridLine, styles.mapGridLineV, { left: `${(i + 1) * 18}%` }]} />
          ))}
        </View>

        {/* Fake road */}
        <View style={styles.mapRoadH} />
        <View style={styles.mapRoadV} />

        {/* Center content */}
        <View style={styles.mapCenter}>
          <MapIcon />
          <Text style={styles.mapLabel}>Live Map</Text>
          <Text style={styles.mapSub}>
            {isDriver ? 'Location shared with passengers' : 'Tracking driver location'}
          </Text>
        </View>

        {/* Route dots on map */}
        <View style={[styles.mapDot, { top: '30%', left: '20%' }]}>
          <LocationDotIcon color={colors.primary} />
        </View>
        <View style={[styles.mapDot, { top: '60%', right: '20%' }]}>
          <LocationDotIcon color={colors.error} />
        </View>

        {/* Top bar overlay */}
        <View style={styles.mapTopBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.mapBackBtn}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.mapTitleBox}>
            <Text style={styles.mapTitleText}>Active Ride</Text>
          </View>
          <TouchableOpacity style={styles.sosBtn} onPress={() => navigation.navigate('SOS', { tripId })}>
            <Text style={styles.sosBtnText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom panel */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        {/* Status pill */}
        <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          <View style={styles.timerPill}>
            <ClockIcon color={status.color} size={12} />
            <Text style={[styles.timerText, { color: status.color }]}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeRow}>
          <View style={styles.routeDots}>
            <View style={styles.dotGreen} />
            <View style={styles.routeLine} />
            <View style={styles.dotRed} />
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeFrom}>{from || 'Pickup'}</Text>
            <Text style={styles.routeTo}>{to || 'Destination'}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Driver info row (passenger only) */}
        {!isDriver && (
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>{driverName?.[0] || 'D'}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverName || 'Your Driver'}</Text>
              <View style={styles.driverStatusRow}>
                <View style={[styles.statusDotSm, {
                  backgroundColor: tripStatus === 'in_progress' ? colors.primary : colors.warning
                }]} />
                <Text style={styles.driverStatusText}>
                  {tripStatus === 'in_progress' ? 'On the way' : 'Heading to pickup'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert('In-app call', 'Call feature coming in Sprint 3')}
            >
              <PhoneIcon />
            </TouchableOpacity>
          </View>
        )}

        {/* Fare row */}
        <View style={styles.fareRow}>
          <View style={styles.fareLeft}>
            <CurrencyIcon color={colors.primary} size={16} />
            <Text style={styles.fareLabel}>Trip fare</Text>
          </View>
          <Text style={styles.fareValue}>R{pricePerSeat || '0'}</Text>
        </View>

        {/* Action buttons */}
        {isDriver && tripStatus === 'active' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => updateTripStatus(tripId, 'in_progress')}
          >
            <PlayIcon />
            <Text style={styles.primaryBtnText}>Start Trip</Text>
          </TouchableOpacity>
        )}

        {isDriver && tripStatus === 'in_progress' && (
          <TouchableOpacity style={[styles.primaryBtn, styles.endBtn]} onPress={handleEndTrip}>
            <CheckIcon />
            <Text style={styles.primaryBtnText}>End Trip — Arrived</Text>
          </TouchableOpacity>
        )}

        {!isDriver && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <XIcon />
            <Text style={styles.cancelBtnText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#2A4A3A' },
  mapArea:         { flex: 1, backgroundColor: '#3A5C4A', overflow: 'hidden', position: 'relative' },
  mapGrid:         { ...StyleSheet.absoluteFillObject },
  mapGridLine:     { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.06)' },
  mapGridLineH:    { left: 0, right: 0, height: 1 },
  mapGridLineV:    { top: 0, bottom: 0, width: 1 },
  mapRoadH:        { position: 'absolute', top: '50%', left: 0, right: 0, height: 18, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: -9 },
  mapRoadV:        { position: 'absolute', left: '35%', top: 0, bottom: 0, width: 18, backgroundColor: 'rgba(255,255,255,0.12)', marginLeft: -9 },
  mapCenter:       { alignItems: 'center', justifyContent: 'center' },
  mapLabel:        { fontSize: typography.fontSize.lg, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: spacing.sm },
  mapSub:          { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4, paddingHorizontal: 32 },
  mapDot:          { position: 'absolute' },
  mapTopBar:       { position: 'absolute', top: 52, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mapBackBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  mapTitleBox:     { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8 },
  mapTitleText:    { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.sm },
  sosBtn:          { backgroundColor: colors.error, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  sosBtnText:      { color: colors.white, fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  panel:           { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.lg, paddingBottom: 36, ...shadows.lg },
  dragHandle:      { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  statusPill:      { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8, marginBottom: spacing.md, gap: 6, alignSelf: 'flex-start' },
  statusDot:       { width: 8, height: 8, borderRadius: 4 },
  statusDotSm:     { width: 6, height: 6, borderRadius: 3 },
  statusLabel:     { fontWeight: '700', fontSize: typography.fontSize.sm },
  timerPill:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 4 },
  timerText:       { fontSize: typography.fontSize.xs, fontWeight: '700' },
  routeRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  routeDots:       { alignItems: 'center', marginRight: spacing.md },
  dotGreen:        { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  routeLine:       { width: 2, height: 26, backgroundColor: colors.border, marginVertical: 3 },
  dotRed:          { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  routeLabels:     { flex: 1 },
  routeFrom:       { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  routeTo:         { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary, marginTop: 20 },
  divider:         { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  driverRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.md },
  driverAvatar:    { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  driverInitial:   { color: colors.primary, fontWeight: '800', fontSize: 20 },
  driverInfo:      { flex: 1 },
  driverName:      { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  driverStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  driverStatusText:{ fontSize: typography.fontSize.sm, color: colors.textMuted },
  callBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  fareRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  fareLeft:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fareLabel:       { color: colors.textSecondary, fontWeight: '500', fontSize: typography.fontSize.base },
  fareValue:       { color: colors.primary, fontWeight: '800', fontSize: typography.fontSize.xl },
  primaryBtn:      { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  endBtn:          { backgroundColor: colors.primaryDark },
  primaryBtnText:  { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  cancelBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.full, paddingVertical: 14 },
  cancelBtnText:   { color: colors.textSecondary, fontWeight: '600', fontSize: typography.fontSize.base },
});