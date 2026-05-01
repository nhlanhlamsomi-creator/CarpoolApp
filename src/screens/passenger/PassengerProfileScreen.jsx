import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius, shadows } from '../../theme';

export default function PassengerProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => {
        await logout();
        navigation.replace('Splash');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.sub}>Manage your account information</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.[0] || 'P'}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName || 'Passenger'}</Text>
          <View style={styles.ratingRow}>
            <Text>⭐</Text>
            <Text style={styles.rating}>{user?.rating || '5.0'}</Text>
          </View>
        </View>

        {[
          { icon: '🗓', label: 'Active Trips',   value: '0' },
          { icon: '📋', label: 'All Bookings',   value: '0' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          {[
            { l: 'Name',   v: user?.fullName || '-' },
            { l: 'Email',  v: user?.email    || '-' },
            { l: 'Phone',  v: user?.phone    || '-' },
          ].map(r => (
            <View key={r.l} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{r.l}</Text>
              <Text style={styles.infoValue}>{r.v}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg },
  title:        { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white },
  sub:          { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:      { padding: spacing.lg, paddingBottom: 48 },
  avatarSection:{ alignItems: 'center', marginBottom: spacing.xl },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText:   { color: colors.white, fontSize: 32, fontWeight: '800' },
  name:         { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating:       { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  statCard:     { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.sm, ...shadows.sm },
  statIcon:     { fontSize: 28, marginBottom: 4 },
  statValue:    { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.primary },
  statLabel:    { fontSize: typography.fontSize.sm, color: colors.textMuted },
  infoCard:     { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardTitle:    { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel:    { color: colors.textMuted, fontSize: typography.fontSize.sm },
  infoValue:    { color: colors.textPrimary, fontWeight: '500', fontSize: typography.fontSize.sm },
  logoutBtn:    { backgroundColor: '#FFF0F0', borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2' },
  logoutText:   { color: colors.error, fontWeight: '700', fontSize: typography.fontSize.base },
});
