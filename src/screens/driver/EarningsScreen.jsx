import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { MOCK_EARNINGS } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function EarningsScreen({ navigation }) {
  const paid    = MOCK_EARNINGS.filter(e => e.status === 'paid');
  const pending = MOCK_EARNINGS.filter(e => e.status === 'pending');
  const total   = paid.reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = pending.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Driver Earnings</Text>
        <Text style={styles.sub}>Manage your income from shared trips</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {[
            { icon: '🚗', label: 'All Trips', value: MOCK_EARNINGS.length.toString() },
            { icon: '✅', label: 'Completed', value: paid.length.toString() },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.earningCard}>
          <Text style={styles.earningIcon}>💰</Text>
          <Text style={styles.earningBig}>R {total}.00</Text>
          <Text style={styles.earningLabel}>All-time & Current Earnings</Text>
        </View>

        <View style={styles.earningCard}>
          <Text style={styles.earningIcon}>⏳</Text>
          <Text style={[styles.earningBig, { color: colors.warning }]}>R {pendingTotal}.00</Text>
          <Text style={styles.earningLabel}>Pending Payment</Text>
        </View>

        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => Alert.alert('Withdraw Funds', 'Paystack integration coming in Sprint 3. Your balance will be transferred to your bank account.')}
        >
          <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Transaction History</Text>
        {MOCK_EARNINGS.map(item => (
          <View key={item.id} style={styles.txRow}>
            <View>
              <Text style={styles.txRoute}>{item.from} → {item.to}</Text>
              <Text style={styles.txDate}>{item.date}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>+R{item.amount}</Text>
              <View style={[styles.txBadge, item.status === 'pending' && styles.txBadgePending]}>
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
  container:        { flex: 1, backgroundColor: colors.background },
  header:           { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg },
  title:            { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white },
  sub:              { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:          { padding: spacing.lg, paddingBottom: 48 },
  statsRow:         { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statCard:         { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statIcon:         { fontSize: 24, marginBottom: 4 },
  statValue:        { fontSize: typography.fontSize.xl, fontWeight: '800', color: colors.primary },
  statLabel:        { fontSize: typography.fontSize.xs, color: colors.textMuted },
  earningCard:      { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md, ...shadows.md },
  earningIcon:      { fontSize: 36, marginBottom: spacing.sm },
  earningBig:       { fontSize: typography.fontSize.display, fontWeight: '900', color: colors.primary },
  earningLabel:     { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 4 },
  withdrawBtn:      { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 18, alignItems: 'center', marginBottom: spacing.xl },
  withdrawBtnText:  { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  sectionLabel:     { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  txRow:            { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, ...shadows.sm },
  txRoute:          { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.textPrimary },
  txDate:           { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },
  txRight:          { alignItems: 'flex-end' },
  txAmount:         { fontSize: typography.fontSize.lg, fontWeight: '800', color: colors.primary },
  txBadge:          { backgroundColor: '#E8F5E9', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: 4 },
  txBadgePending:   { backgroundColor: '#FFF8E1' },
  txBadgeText:      { fontSize: 10, fontWeight: '700', color: '#2E7D32' },
  txBadgeTextPending:{ color: '#F57F17' },
});
