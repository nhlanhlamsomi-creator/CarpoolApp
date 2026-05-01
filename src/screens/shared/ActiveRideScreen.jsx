import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Alert, Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { listenToTrip, updateTripStatus } from '../../services/trips.service';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function ActiveRideScreen({ navigation, route }) {
  const { user, isDriver } = useAuth();
  const { tripId, driverName, from, to, pricePerSeat } = route?.params || {};

  const [tripStatus, setTripStatus] = useState('active');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);

  const timerRef = useRef(null);
  const locationRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Animate panel up
    Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }).start();

    // Start elapsed timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // For driver: track their own location and update Firestore
    if (isDriver) {
      startLocationTracking();
    }

    // Listen to trip status in real-time
    const unsubscribe = listenToTrip(tripId, (trip) => {
      setTripStatus(trip.status);
      if (trip.status === 'completed') {
        clearInterval(timerRef.current);
        if (!isDriver) {
          navigation.replace('RateDriver', { tripId, driverName });
        } else {
          navigation.replace('DriverTabs');
        }
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
      async (loc) => {
        setDriverLocation(loc.coords);
        // TODO: Update driver's location in Firestore for passenger to see on map
        // await updateDoc(doc(db, 'trips', tripId), { driverLocation: { lat, lng } })
      }
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip?',
      'Confirm that you have arrived at the destination.',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, End Trip',
          onPress: async () => {
            await updateTripStatus(tripId, 'completed');
          },
        },
      ]
    );
  };

  const handleSOS = () => {
    navigation.navigate('SOS', { tripId, driverUid: null });
  };

  const statusConfig = {
    active: { label: 'Waiting for driver', color: colors.warning },
    in_progress: { label: 'Trip in progress', color: colors.success },
    completed: { label: 'Arrived', color: colors.primary },
  };

  const status = statusConfig[tripStatus] || statusConfig.active;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Map placeholder — replace with react-native-maps MapView */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺</Text>
        <Text style={styles.mapText}>Live Map</Text>
        <Text style={styles.mapSub}>
          {isDriver
            ? 'Your location is being shared with your passenger'
            : 'Tracking driver location'}
        </Text>

        {/* SOS button overlaid on map */}
        <TouchableOpacity style={styles.sosOverlay} onPress={handleSOS}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom trip panel */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        {/* Status pill */}
        <View style={[styles.statusPill, { backgroundColor: status.color + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
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
          <View style={styles.timerBox}>
            <Text style={styles.timerLabel}>Elapsed</Text>
            <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        {/* Driver info (for passenger) */}
        {!isDriver && (
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>{driverName?.[0] || 'D'}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverName || 'Your Driver'}</Text>
              <Text style={styles.driverStatus}>
                {tripStatus === 'in_progress' ? '🚗 On the way' : '⏳ Heading to pickup'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert('In-app call', 'Call feature coming in Sprint 3')}
            >
              <Text style={styles.callBtnIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Price */}
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Trip fare</Text>
          <Text style={styles.fareValue}>R{pricePerSeat || '0'}</Text>
        </View>

        {/* Action buttons */}
        {isDriver && tripStatus === 'active' && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => updateTripStatus(tripId, 'in_progress')}
          >
            <Text style={styles.startBtnText}>🚗 Start Trip</Text>
          </TouchableOpacity>
        )}

        {isDriver && tripStatus === 'in_progress' && (
          <TouchableOpacity style={styles.endBtn} onPress={handleEndTrip}>
            <Text style={styles.endBtnText}>✓ End Trip — Arrived</Text>
          </TouchableOpacity>
        )}

        {!isDriver && (
          <TouchableOpacity
            style={styles.cancelRideBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelRideBtnText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#C8D8C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapEmoji: { fontSize: 64, marginBottom: spacing.sm },
  mapText: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.primaryDark },
  mapSub: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  sosOverlay: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    backgroundColor: colors.error,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  sosText: { color: colors.white, fontWeight: '900', fontSize: 16 },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    paddingBottom: 40,
    ...shadows.lg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.md,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontWeight: '700', fontSize: typography.fontSize.sm },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  routeDots: { alignItems: 'center', marginRight: spacing.md },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  routeLine: { width: 2, height: 24, backgroundColor: colors.border, marginVertical: 3 },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  routeLabels: { flex: 1 },
  routeFrom: { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  routeTo: { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary, marginTop: 18 },
  timerBox: { alignItems: 'flex-end' },
  timerLabel: { fontSize: typography.fontSize.xs, color: colors.textMuted },
  timerValue: { fontSize: typography.fontSize.xl, fontWeight: '800', color: colors.primary },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  driverAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  driverInitial: { color: colors.primary, fontWeight: '800', fontSize: 20 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  driverStatus: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 2 },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  callBtnIcon: { fontSize: 18 },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fareLabel: { color: colors.textSecondary, fontWeight: '500' },
  fareValue: { color: colors.primary, fontWeight: '800', fontSize: typography.fontSize.lg },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  endBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  endBtnText: { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  cancelRideBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelRideBtnText: { color: colors.textSecondary, fontWeight: '600' },
});
