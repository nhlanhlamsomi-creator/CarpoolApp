import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius, shadows } from '../../theme';

const RECENT = [
  { from: 'Sandton', to: 'UJ Kingsway Campus', time: 'Mon 06 May 2026', price: 'R25' },
  { from: 'Randburg', to: 'Wits University', time: 'Fri 03 May 2026', price: 'R18' },
  { from: 'Fourways', to: 'UJ Kingsway Campus', time: 'Thu 02 May 2026', price: 'R30' },
];

export default function HomeSearchScreen({ navigation }) {
  const { user }          = useAuth();
  const [from, setFrom]   = useState('');
  const [to, setTo]       = useState('');
  const [date, setDate]   = useState('');

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) return;
    navigation.navigate('TripResults', { from, to, date });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Find a Ride 🔍</Text>
          <Text style={styles.greetingSub}>
            Good morning, {user?.fullName?.split(' ')[0] || 'there'}!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('PassengerProfile')}
        >
          <Text style={styles.avatarInitial}>{user?.fullName?.[0] || 'P'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search card */}
      <View style={styles.searchCard}>
        <View style={styles.routeInputs}>
          <View style={styles.dotTrack}>
            <View style={[styles.dot, styles.dotGreen]} />
            <View style={styles.dotLine} />
            <View style={[styles.dot, styles.dotRed]} />
          </View>
          <View style={styles.inputs}>
            <TextInput
              style={styles.routeInput}
              placeholder="From (e.g. Sandton)"
              placeholderTextColor={colors.textMuted}
              value={from}
              onChangeText={setFrom}
            />
            <View style={styles.inputDivider} />
            <TextInput
              style={styles.routeInput}
              placeholder="To (e.g. UJ Kingsway)"
              placeholderTextColor={colors.textMuted}
              value={to}
              onChangeText={setTo}
            />
          </View>
        </View>
        <TextInput
          style={styles.dateInput}
          placeholder="Date (e.g. 06 May 2026)"
          placeholderTextColor={colors.textMuted}
          value={date}
          onChangeText={setDate}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search Rides</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick searches */}
        <Text style={styles.sectionLabel}>Popular Routes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {['Sandton → UJ', 'Randburg → Wits', 'Fourways → UJ', 'Soweto → CBD'].map(route => (
            <TouchableOpacity
              key={route}
              style={styles.chip}
              onPress={() => {
                const [f, t] = route.split(' → ');
                setFrom(f); setTo(t);
              }}
            >
              <Text style={styles.chipText}>{route}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent searches */}
        <Text style={styles.sectionLabel}>Recent Searches</Text>
        {RECENT.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.recentCard}
            onPress={() => { setFrom(item.from); setTo(item.to); }}
          >
            <View style={styles.recentRoute}>
              <View style={styles.recentDots}>
                <View style={[styles.dot, styles.dotGreen, { width: 8, height: 8 }]} />
                <View style={styles.dotLineSm} />
                <View style={[styles.dot, styles.dotRed, { width: 8, height: 8 }]} />
              </View>
              <View>
                <Text style={styles.recentFrom}>{item.from}</Text>
                <Text style={styles.recentTo}>{item.to}</Text>
              </View>
            </View>
            <View style={styles.recentMeta}>
              <Text style={styles.recentTime}>{item.time}</Text>
              <Text style={styles.recentPrice}>{item.price}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Promo banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoEmoji}>🎉</Text>
          <View>
            <Text style={styles.promoTitle}>First ride discount!</Text>
            <Text style={styles.promoSub}>Save R15 on your first booking</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:     { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white, letterSpacing: -0.3 },
  greetingSub:  { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  avatarBtn:    { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:{ color: colors.white, fontWeight: '800', fontSize: 18 },
  searchCard:   { backgroundColor: colors.white, borderRadius: radius.xl, margin: spacing.lg, marginTop: -spacing.lg, padding: spacing.md, ...shadows.lg },
  routeInputs:  { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  dotTrack:     { alignItems: 'center', marginRight: spacing.md, paddingVertical: 4 },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  dotGreen:     { backgroundColor: colors.primary },
  dotRed:       { backgroundColor: colors.error },
  dotLine:      { width: 2, height: 28, backgroundColor: colors.border, marginVertical: 4 },
  dotLineSm:    { width: 2, height: 14, backgroundColor: colors.border, marginVertical: 2 },
  inputs:       { flex: 1 },
  routeInput:   { fontSize: typography.fontSize.base, color: colors.textPrimary, paddingVertical: 10 },
  inputDivider: { height: 1, backgroundColor: colors.border },
  dateInput:    { fontSize: typography.fontSize.base, color: colors.textPrimary, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: spacing.sm },
  searchBtn:    { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 14, alignItems: 'center' },
  searchBtnText:{ color: colors.white, fontSize: typography.fontSize.base, fontWeight: '700' },
  content:      { paddingHorizontal: spacing.lg, paddingBottom: 48 },
  sectionLabel: { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.lg },
  chips:        { marginBottom: spacing.sm },
  chip:         { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  chipText:     { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: '600' },
  recentCard:   { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...shadows.sm },
  recentRoute:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recentDots:   { alignItems: 'center', marginRight: spacing.md },
  recentFrom:   { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  recentTo:     { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  recentMeta:   { alignItems: 'flex-end' },
  recentTime:   { fontSize: typography.fontSize.xs, color: colors.textMuted },
  recentPrice:  { fontSize: typography.fontSize.md, fontWeight: '800', color: colors.primary, marginTop: 4 },
  promoBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  promoEmoji:   { fontSize: 28 },
  promoTitle:   { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.primaryDark },
  promoSub:     { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
});
