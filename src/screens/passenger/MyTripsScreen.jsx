import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { MOCK_BOOKINGS } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function MyTripsScreen({ navigation }) {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);

  const handleCancel = (id) => {
    Alert.alert('Cancel Booking?', 'A R10 fee applies if cancelled more than 5 minutes after booking.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel Booking', style: 'destructive', onPress: () => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      }},
    ]);
  };

  const active   = bookings.filter(b => b.status === 'confirmed');
  const previous = bookings.filter(b => b.status !== 'confirmed');

  const BookingCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.routeRow}>
        <View style={styles.dotCol}>
          <View style={styles.dotGreen} />
          <View style={styles.dotLine} />
          <View style={styles.dotRed} />
        </View>
        <View style={styles.routeText}>
          <Text style={styles.routeFrom}>{item.from}</Text>
          <Text style={styles.routeTo}>{item.to}</Text>
        </View>
        <Text style={styles.price}>R{item.pricePerSeat}</Text>
      </View>

      <Text style={styles.tripTime}>{item.departureTime}</Text>
      <Text style={styles.driverText}>Driver: {item.driverName}</Text>

      <View style={styles.cardBottom}>
        <View style={[styles.badge,
          item.status === 'confirmed' && styles.badgeConfirmed,
          item.status === 'completed' && styles.badgeCompleted,
          item.status === 'cancelled' && styles.badgeCancelled,
        ]}>
          <Text style={[styles.badgeText,
            item.status === 'confirmed' && { color: colors.primary },
            item.status === 'completed' && { color: '#2E7D32' },
            item.status === 'cancelled' && { color: colors.error },
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>

        {item.status === 'confirmed' && (
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('TripChat', {
                tripId: item.tripId,
                tripRoute: `${item.from} → ${item.to}`,
                driverName: item.driverName,
              })}
            >
              <Text style={styles.chatBtnText}>💬 Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.sub}>All your trips in one place</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={styles.sectionLabel}>Active Bookings ({active.length})</Text>
        )}
        ListFooterComponent={() => (
          <>
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
              Previous & Cancelled ({previous.length})
            </Text>
            {previous.length === 0 && (
              <Text style={styles.emptyText}>No previous trips yet</Text>
            )}
          </>
        )}
        renderItem={({ item }) => <BookingCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg },
  title:          { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white },
  sub:            { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  list:           { padding: spacing.lg, paddingBottom: 48 },
  sectionLabel:   { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  card:           { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  routeRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  dotCol:         { alignItems: 'center' },
  dotGreen:       { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  dotLine:        { width: 2, height: 20, backgroundColor: colors.border, marginVertical: 2 },
  dotRed:         { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  routeText:      { flex: 1 },
  routeFrom:      { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  routeTo:        { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary, marginTop: 16 },
  price:          { fontSize: typography.fontSize.xl, fontWeight: '800', color: colors.primary },
  tripTime:       { fontSize: typography.fontSize.sm, color: colors.textMuted },
  driverText:     { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  cardBottom:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge:          { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  badgeConfirmed: { backgroundColor: colors.primaryLight },
  badgeCompleted: { backgroundColor: '#E8F5E9' },
  badgeCancelled: { backgroundColor: '#FFEBEE' },
  badgeText:      { fontSize: typography.fontSize.xs, fontWeight: '700' },
  actionBtns:     { flexDirection: 'row', gap: spacing.sm },
  chatBtn:        { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8 },
  chatBtnText:    { color: colors.primary, fontWeight: '700', fontSize: typography.fontSize.sm },
  cancelBtn:      { borderWidth: 1.5, borderColor: colors.error, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8 },
  cancelBtnText:  { color: colors.error, fontWeight: '700', fontSize: typography.fontSize.sm },
  emptyText:      { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});
