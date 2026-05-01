import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { MOCK_TRIPS } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function TripResultsScreen({ navigation, route }) {
  const { from = '', to = '', date = '' } = route?.params || {};
  const [sortBy, setSortBy] = useState('time');

  // Filter mock trips by search terms
  const results = MOCK_TRIPS.filter(t =>
    t.from.toLowerCase().includes(from.toLowerCase()) ||
    t.to.toLowerCase().includes(to.toLowerCase()) ||
    from === '' || to === ''
  ).sort((a, b) => sortBy === 'price'
    ? a.pricePerSeat - b.pricePerSeat
    : a.departureTime.localeCompare(b.departureTime)
  );

  const TripCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.driverRow}>
        <View style={styles.driverAvatar}>
          <Text style={styles.driverInitial}>{item.driverName[0]}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.driverName}</Text>
          <Text style={styles.driverMeta}>⭐ {item.driverRating} · {item.driverReviews}</Text>
        </View>
        <Text style={styles.price}>R{item.pricePerSeat}</Text>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.routeVisual}>
          <View style={styles.dotCol}>
            <View style={styles.dotGreen} />
            <View style={styles.routeLine} />
            <View style={styles.dotRed} />
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeFrom}>{item.from}</Text>
            <Text style={styles.routeTo}>{item.to}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>🕐 {item.departureTime}</Text>
          <Text style={styles.metaItem}>🪑 {item.availableSeats} seats left</Text>
          <Text style={styles.metaItem}>🚗 {item.vehicleMake} {item.vehicleModel}</Text>
          {item.recurring && <Text style={styles.metaItem}>🔄 {item.recurringDays}</Text>}
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View style={[styles.seatsBadge, item.availableSeats === 1 && styles.seatsLow]}>
          <Text style={[styles.seatsText, item.availableSeats === 1 && styles.seatsTextLow]}>
            {item.availableSeats === 1 ? 'Last seat!' : `${item.availableSeats} seats available`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('ConfirmBooking', { trip: item })}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Find a Ride</Text>
          <Text style={styles.headerSub}>{from || 'Any'} → {to || 'Any'}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>{results.length} rides found</Text>
        <View style={styles.sortBtns}>
          {['time', 'price'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
              onPress={() => setSortBy(s)}
            >
              <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
                {s === 'time' ? '🕐 Time' : '💰 Price'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TripCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptySub}>Try a different route or date</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  backBtn:        { width: 32 },
  backIcon:       { color: colors.white, fontSize: 22 },
  headerCenter:   { flex: 1, alignItems: 'center' },
  headerTitle:    { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.white },
  headerSub:      { fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sortBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultCount:    { fontSize: typography.fontSize.sm, color: colors.textMuted },
  sortBtns:       { flexDirection: 'row', gap: spacing.sm },
  sortBtn:        { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1.5, borderColor: colors.border },
  sortBtnActive:  { backgroundColor: colors.primary, borderColor: colors.primary },
  sortBtnText:    { fontSize: typography.fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  sortBtnTextActive: { color: colors.white },
  list:           { padding: spacing.lg, paddingBottom: 48 },
  card:           { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.md },
  driverRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  driverAvatar:   { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  driverInitial:  { color: colors.primary, fontWeight: '800', fontSize: 22 },
  driverInfo:     { flex: 1 },
  driverName:     { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  driverMeta:     { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 2 },
  price:          { fontSize: typography.fontSize.xl, fontWeight: '800', color: colors.primary },
  tripDetails:    { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  routeVisual:    { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  dotCol:         { alignItems: 'center', paddingTop: 2 },
  dotGreen:       { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  routeLine:      { width: 2, height: 22, backgroundColor: colors.border, marginVertical: 3 },
  dotRed:         { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  routeLabels:    { flex: 1, justifyContent: 'space-between' },
  routeFrom:      { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  routeTo:        { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary, marginTop: 18 },
  metaRow:        { gap: 4 },
  metaItem:       { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  cardBottom:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seatsBadge:     { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  seatsLow:       { backgroundColor: '#FFF3E0' },
  seatsText:      { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: '600' },
  seatsTextLow:   { color: '#E65100' },
  bookBtn:        { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 12 },
  bookBtnText:    { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.sm },
  emptyBox:       { alignItems: 'center', paddingTop: 80 },
  emptyEmoji:     { fontSize: 48, marginBottom: spacing.md },
  emptyTitle:     { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  emptySub:       { color: colors.textMuted, marginTop: spacing.sm },
});
