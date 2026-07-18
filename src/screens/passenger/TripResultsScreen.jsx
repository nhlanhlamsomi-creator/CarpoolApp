import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { MOCK_TRIPS } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import Svg, { Path, Circle, Polyline, Rect } from 'react-native-svg';

const BackIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ClockIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={colors.textSecondary} strokeWidth="1.8"/>
    <Path d="M12 7v5l3 3" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const SeatIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Path d="M6 2v10a2 2 0 002 2h8a2 2 0 002-2V2" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round"/>
    <Path d="M6 14v6M18 14v6M4 20h16" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const CarIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Path d="M5 11l1.5-4.5h11L19 11M3 16h18M5 16v3M19 16v3" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="7.5" cy="16" r="1.5" fill={colors.textSecondary}/>
    <Circle cx="16.5" cy="16" r="1.5" fill={colors.textSecondary}/>
  </Svg>
);

const RepeatIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Polyline points="17 1 21 5 17 9" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const StarIcon = () => (
  <Svg width="11" height="11" viewBox="0 0 24 24" fill={colors.warning}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" fill={colors.warning}/>
  </Svg>
);

const SortTimeIcon = ({ active }) => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={active ? colors.white : colors.textMuted} strokeWidth="1.8"/>
    <Path d="M12 7v5l3 3" stroke={active ? colors.white : colors.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const SortPriceIcon = ({ active }) => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={active ? colors.white : colors.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

export default function TripResultsScreen({ navigation, route }) {
  const { from = '', to = '', date = '' } = route?.params || {};
  const [sortBy, setSortBy] = useState('time');

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
          <View style={styles.ratingRow}>
            <StarIcon />
            <Text style={styles.driverMeta}>{item.driverRating} · {item.driverReviews}</Text>
          </View>
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
          <View style={styles.metaPill}>
            <ClockIcon />
            <Text style={styles.metaItem}>{item.departureTime}</Text>
          </View>
          <View style={styles.metaPill}>
            <SeatIcon />
            <Text style={styles.metaItem}>{item.availableSeats} seats</Text>
          </View>
          <View style={styles.metaPill}>
            <CarIcon />
            <Text style={styles.metaItem}>{item.vehicleMake} {item.vehicleModel}</Text>
          </View>
          {item.recurring && (
            <View style={styles.metaPill}>
              <RepeatIcon />
              <Text style={styles.metaItem}>{item.recurringDays}</Text>
            </View>
          )}
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
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Find a Ride</Text>
          <Text style={styles.headerSub}>{from || 'Any'} → {to || 'Any'}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>{results.length} rides found</Text>
        <View style={styles.sortBtns}>
          {['time', 'price'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
              onPress={() => setSortBy(s)}
            >
              {s === 'time' ? <SortTimeIcon active={sortBy === s} /> : <SortPriceIcon active={sortBy === s} />}
              <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
                {s === 'time' ? 'Time' : 'Price'}
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
            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: spacing.md }}>
              <Circle cx="11" cy="11" r="7" stroke={colors.textMuted} strokeWidth="1.5"/>
              <Path d="M16.5 16.5L21 21" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round"/>
              <Path d="M8 11h6M11 8v6" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round"/>
            </Svg>
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptySub}>Try a different route or date</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.background },
  header:             { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  backBtn:            { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter:       { flex: 1, alignItems: 'center' },
  headerTitle:        { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.white },
  headerSub:          { fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sortBar:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultCount:        { fontSize: typography.fontSize.sm, color: colors.textMuted },
  sortBtns:           { flexDirection: 'row', gap: spacing.sm },
  sortBtn:            { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1.5, borderColor: colors.border },
  sortBtnActive:      { backgroundColor: colors.primary, borderColor: colors.primary },
  sortBtnText:        { fontSize: typography.fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  sortBtnTextActive:  { color: colors.white },
  list:               { padding: spacing.lg, paddingBottom: 48 },
  card:               { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.md },
  driverRow:          { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  driverAvatar:       { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  driverInitial:      { color: colors.primary, fontWeight: '800', fontSize: 22 },
  driverInfo:         { flex: 1 },
  driverName:         { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary },
  ratingRow:          { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  driverMeta:         { fontSize: typography.fontSize.sm, color: colors.textMuted },
  price:              { fontSize: typography.fontSize.xl, fontWeight: '800', color: colors.primary },
  tripDetails:        { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  routeVisual:        { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  dotCol:             { alignItems: 'center', paddingTop: 2 },
  dotGreen:           { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  routeLine:          { width: 2, height: 22, backgroundColor: colors.border, marginVertical: 3 },
  dotRed:             { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  routeLabels:        { flex: 1, justifyContent: 'space-between' },
  routeFrom:          { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  routeTo:            { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary, marginTop: 18 },
  metaRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  metaPill:           { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.white, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  metaItem:           { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  cardBottom:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seatsBadge:         { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  seatsLow:           { backgroundColor: '#FFF3E0' },
  seatsText:          { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: '600' },
  seatsTextLow:       { color: '#E65100' },
  bookBtn:            { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 12 },
  bookBtnText:        { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.sm },
  emptyBox:           { alignItems: 'center', paddingTop: 80 },
  emptyTitle:         { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  emptySub:           { color: colors.textMuted, marginTop: spacing.sm },
});