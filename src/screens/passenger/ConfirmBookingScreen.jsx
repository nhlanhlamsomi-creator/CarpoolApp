import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function ConfirmBookingScreen({ navigation, route }) {
  const trip = route?.params?.trip || {
    driver: 'Thabo Mbeki',
    rating: 4.8,
    from: 'Sandton',
    to: 'Mall of Africa',
    time: 'Thu 06 March 2024 · 08:00',
    price: 'R25',
    seats: 2,
  };

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // TODO: call bookingService.createBooking(trip.id, userId)
      // TODO: call paymentService.processPayment(amount)
      await new Promise((r) => setTimeout(r, 1200));
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your seat to ${trip.to} has been booked. The driver has been notified.`,
        [{ text: 'View My Trips', onPress: () => navigation.replace('PassengerTabs') }]
      );
    } catch {
      Alert.alert('Booking Failed', 'Please try again or choose a different ride.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking?',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No, Keep It', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Trip summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Trip with {trip.driver}</Text>

          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>{trip.driver?.[0]}</Text>
            </View>
            <View>
              <Text style={styles.driverName}>{trip.driver}</Text>
              <Text style={styles.driverRating}>⭐ {trip.rating} Rating</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.routeVisual}>
            <View style={styles.routeDot}>
              <View style={styles.dotGreen} />
              <View style={styles.routeLine} />
              <View style={styles.dotRed} />
            </View>
            <View style={styles.routeLabels}>
              <Text style={styles.routeFrom}>{trip.from}</Text>
              <Text style={styles.routeTo}>{trip.to}</Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={styles.detailLabel}>Departure</Text>
              <Text style={styles.detailValue}>{trip.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🪑</Text>
              <Text style={styles.detailLabel}>Your Seats</Text>
              <Text style={styles.detailValue}>1 seat</Text>
            </View>
          </View>
        </View>

        {/* Payment section */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment</Text>

          <View style={styles.paymentOption}>
            <Text style={styles.payEmoji}>💳</Text>
            <Text style={styles.payLabel}>Pay with Card</Text>
            <Text style={styles.paySelected}>✓</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Trip cost</Text>
            <Text style={styles.priceValue}>{trip.price}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform fee</Text>
            <Text style={styles.priceValue}>R2</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              R{Number((trip.price || 'R25').replace('R', '')) + 2}
            </Text>
          </View>
        </View>

        {/* Safety notice */}
        <View style={styles.safetyCard}>
          <Text style={styles.safetyIcon}>🛡</Text>
          <View style={styles.safetyText}>
            <Text style={styles.safetyTitle}>Ride Safety Monitoring</Text>
            <Text style={styles.safetySub}>
              This trip is GPS-monitored for your safety. An emergency SOS button is available during the ride.
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmBtnText}>
            {loading ? 'Processing...' : `Pay & Confirm  ${trip.price}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>✕ Cancel Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 32 },
  backIcon: { color: colors.white, fontSize: 22 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.white,
  },
  content: { padding: spacing.lg, paddingBottom: 48 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  driverAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  driverInitial: { color: colors.primary, fontWeight: '800', fontSize: 22 },
  driverName: { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  driverRating: { fontSize: typography.fontSize.sm, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  routeVisual: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  routeDot: { alignItems: 'center', paddingTop: 4 },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  routeLine: { width: 2, height: 28, backgroundColor: colors.border, marginVertical: 4 },
  dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error },
  routeLabels: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  routeFrom: { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  routeTo: { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary, marginTop: 20 },
  detailGrid: { flexDirection: 'row', gap: spacing.md },
  detailItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  detailIcon: { fontSize: 20, marginBottom: 4 },
  detailLabel: { fontSize: typography.fontSize.xs, color: colors.textMuted },
  detailValue: { fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginTop: 2 },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  payEmoji: { fontSize: 20 },
  payLabel: { flex: 1, fontSize: typography.fontSize.base, fontWeight: '500', color: colors.textPrimary },
  paySelected: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  priceLabel: { color: colors.textSecondary, fontSize: typography.fontSize.base },
  priceValue: { color: colors.textPrimary, fontWeight: '600' },
  totalRow: { borderBottomWidth: 0, marginTop: 4 },
  totalLabel: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.fontSize.base },
  totalValue: { color: colors.primary, fontWeight: '800', fontSize: typography.fontSize.lg },
  safetyCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  safetyIcon: { fontSize: 24 },
  safetyText: { flex: 1 },
  safetyTitle: { fontWeight: '700', color: colors.primaryDark, fontSize: typography.fontSize.sm },
  safetySub: { color: colors.textSecondary, fontSize: typography.fontSize.xs, marginTop: 2, lineHeight: 18 },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confirmBtnText: { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base, letterSpacing: 0.3 },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.error, fontWeight: '700' },
});
