import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { MOCK_EARNINGS } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

const CurrencyIcon = ({ color = colors.primary, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const ClockIcon = ({ color = colors.warning, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const CarIcon = ({ color = colors.primary, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 11l1.5-4.5h11L19 11M3 16h18M5 16v3M19 16v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="7.5" cy="16" r="1.5" fill={color}/>
    <Circle cx="16.5" cy="16" r="1.5" fill={color}/>
  </Svg>
);

const CheckIcon = ({ color = '#2E7D32', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const WithdrawIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v13M8 11l4 4 4-4" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={colors.white} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const MapPinIcon = ({ color = colors.textMuted, size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth="1.8"/>
    <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.8"/>
  </Svg>
);

export default function EarningsScreen({ navigation }) {
  const paid         = MOCK_EARNINGS.filter(e => e.status === 'paid');
  const pending      = MOCK_EARNINGS.filter(e => e.status === 'pending');
  const total        = paid.reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = pending.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <Text style={styles.title}>Driver Earnings</Text>
        <Text style={styles.sub}>Manage your income from shared trips</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <CarIcon color={colors.primary} size={18} />
            </View>
            <Text style={styles.statValue}>{MOCK_EARNINGS.length}</Text>
            <Text style={styles.statLabel}>All Trips</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <CheckIcon color="#2E7D32" size={18} />
            </View>
            <Text style={styles.statValue}>{paid.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Earning cards */}
        <View style={styles.earningCard}>
          <View style={styles.earningIconWrap}>
            <CurrencyIcon color={colors.primary} size={28} />
          </View>
          <Text style={styles.earningBig}>R {total}.00</Text>
          <Text style={styles.earningLabel}>All-time & Current Earnings</Text>
        </View>

        <View style={[styles.earningCard, styles.earningCardPending]}>
          <View style={[styles.earningIconWrap, { backgroundColor: '#FFF8E1' }]}>
            <ClockIcon color={colors.warning} size={28} />
          </View>
          <Text style={[styles.earningBig, { color: colors.warning }]}>R {pendingTotal}.00</Text>
          <Text style={styles.earningLabel}>Pending Payment</Text>
        </View>

        {/* Withdraw */}
        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => Alert.alert(
            'Withdraw Funds',
            'Paystack integration coming in Sprint 3. Your balance will be transferred to your bank account.'
          )}
        >
          <WithdrawIcon />
          <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
        </TouchableOpacity>

        {/* Transaction history */}
        <Text style={styles.sectionLabel}>Transaction History</Text>
        {MOCK_EARNINGS.map(item => (
          <View key={item.id} style={styles.txRow}>
            <View style={styles.txLeft}>
              <View style={styles.txRouteRow}>
                <MapPinIcon color={colors.primary} />
                <Text style={styles.txRoute}>{item.from} → {item.to}</Text>
              </View>
              <Text style={styles.txDate}>{item.date}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>+R{item.amount}</Text>
              <View style={[styles.txBadge, item.status === 'pending' && styles.txBadgePending]}>
                <View style={[styles.txDot, item.status === 'pending' ? styles.txDotPending : styles.txDotPaid]} />
                <Text style={[styles.txBadgeText, item.status === 'pending' && styles.txBadgeTextPending]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: colors.background },
  header:              { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg },
  title:               { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white },
  sub:                 { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:             { padding: spacing.lg, paddingBottom: 48 },
  statsRow:            { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statCard:            { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statIconWrap:        { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue:           { fontSize: typography.fontSize.xl, fontWeight: '800', color: colors.primary },
  statLabel:           { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },
  earningCard:         { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md, ...shadows.md },
  earningCardPending:  { borderWidth: 1, borderColor: '#FFE082' },
  earningIconWrap:     { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  earningBig:          { fontSize: typography.fontSize.display, fontWeight: '900', color: colors.primary },
  earningLabel:        { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 4 },
  withdrawBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 18, marginBottom: spacing.xl },
  withdrawBtnText:     { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  sectionLabel:        { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  txRow:               { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, ...shadows.sm },
  txLeft:              { flex: 1 },
  txRouteRow:          { flexDirection: 'row', alignItems: 'center', gap: 5 },
  txRoute:             { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  txDate:              { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 3 },
  txRight:             { alignItems: 'flex-end' },
  txAmount:            { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.primary },
  txBadge:             { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, marginTop: 4 },
  txBadgePending:      { backgroundColor: '#FFF8E1' },
  txDot:               { width: 6, height: 6, borderRadius: 3 },
  txDotPaid:           { backgroundColor: '#2E7D32' },
  txDotPending:        { backgroundColor: '#F57F17' },
  txBadgeText:         { fontSize: 10, fontWeight: '700', color: '#2E7D32' },
  txBadgeTextPending:  { color: '#F57F17' },
});