import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform, Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconChevron    = ({ size = 16, color = '#CCC' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconStar       = ({ size = 14, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);
const IconCheck      = ({ size = 12, color = '#16A34A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconAlert      = ({ size = 12, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const IconUser       = ({ size = 18, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </Svg>
);
const IconCar        = ({ size = 18, color = '#7C3AED' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 17H3V9l2-5h14l2 5v8h-2" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <Path d="M3 12h18" stroke={color} strokeWidth="1.8" />
    <Circle cx="7.5" cy="17" r="2" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="16.5" cy="17" r="2" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);
const IconId         = ({ size = 18, color = '#3B82F6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 7h20v13H2z" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="8" cy="12" r="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M13 10h5M13 14h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M4 18c0-1.5 1.8-2.5 4-2.5s4 1 4 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);
const IconLicense    = ({ size = 18, color = '#0369A1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);
const IconCamera     = ({ size = 18, color = '#16A34A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);
const IconCard       = ({ size = 18, color = '#7C3AED' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M2 10h20M6 14h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);
const IconLock       = ({ size = 18, color = '#F97316' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 11V7a7 7 0 0 1 14 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <Path d="M3 11h18v11H3z" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
  </Svg>
);
const IconTrash      = ({ size = 18, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);
const IconShield     = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

function MenuRow({ icon: Icon, iconBg, iconColor, label, value, badge, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBox, { backgroundColor: iconBg || '#F3F4F6' }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {!!value && <Text style={styles.menuValue} numberOfLines={1}>{value}</Text>}
      </View>
      {badge && (
        <View style={[
          styles.badge,
          badge === 'Verified'  && styles.badgeGreen,
          badge === 'Pending'   && styles.badgeYellow,
          badge === 'Required'  && styles.badgeRed,
        ]}>
          {badge === 'Verified' && <IconCheck size={11} color="#16A34A" />}
          {(badge === 'Pending' || badge === 'Required') && <IconAlert size={11} color={badge === 'Required' ? '#EF4444' : '#F59E0B'} />}
          <Text style={[
            styles.badgeText,
            badge === 'Verified' && { color: '#16A34A' },
            badge === 'Pending'  && { color: '#D97706' },
            badge === 'Required' && { color: '#EF4444' },
          ]}>{badge}</Text>
        </View>
      )}
      {!badge && <IconChevron size={16} color="#CCC" />}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DriverProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const d = user?.driverDetails || {};

  // Verification states — replace with real user data fields
  const idVerified       = user?.idVerified       || false;
  const licenseVerified  = user?.licenseVerified  || false;
  const selfieVerified   = user?.selfieVerified   || false;
  const vehicleVerified  = user?.vehicleVerified  || false;
  const bankAdded        = user?.bankAdded        || false;

  const totalSteps   = 5;
  const doneSteps    = [idVerified, licenseVerified, selfieVerified, vehicleVerified, bankAdded].filter(Boolean).length;
  const verifyPct    = Math.round((doneSteps / totalSteps) * 100);
  const fullyVerified = doneSteps === totalSteps;

  const initials = (user?.fullName || 'D').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => { await logout(); navigation.replace('Splash'); } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your driver account and all trip history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete permanently', style: 'destructive', onPress: () =>
            Alert.alert('Request Submitted', 'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours.')
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity style={styles.avatarEdit} onPress={() => navigation.navigate('DriverSelfieVerification')} activeOpacity={0.8}>
            <IconCamera size={13} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerName}>{user?.fullName || 'Driver'}</Text>
        <Text style={styles.headerEmail}>{user?.email || ''}</Text>

        {/* Verified badge */}
        <View style={[styles.verifiedPill, fullyVerified && styles.verifiedPillGreen]}>
          {fullyVerified
            ? <><IconCheck size={12} color="#16A34A" /><Text style={[styles.verifiedPillText, { color: '#16A34A' }]}>Verified Driver</Text></>
            : <><IconAlert size={12} color="#F59E0B" /><Text style={[styles.verifiedPillText, { color: '#D97706' }]}>Verification Pending</Text></>
          }
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <IconStar size={13} color="#F59E0B" />
              <Text style={styles.statVal}>{user?.rating || '5.0'}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{user?.tripCount || '0'}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{verifyPct}%</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Verification banner ── */}
        {!fullyVerified && (
          <View style={styles.verifyBanner}>
            <View style={styles.verifyBannerIcon}>
              <IconShield size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyBannerTitle}>Complete driver verification</Text>
              <Text style={styles.verifyBannerSub}>
                {totalSteps - doneSteps} step{totalSteps - doneSteps !== 1 ? 's' : ''} remaining — verified drivers can start accepting trips
              </Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${verifyPct}%` }]} />
              </View>
            </View>
          </View>
        )}

        {/* ── Identity Verification ── */}
        <SectionHeader title="Identity Verification" />
        <Card>
          <MenuRow
            icon={IconId}
            iconBg="#EFF6FF" iconColor="#3B82F6"
            label="SA ID or Passport"
            value={idVerified ? 'Verified ✓' : 'Not submitted'}
            badge={idVerified ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('DriverIDVerification')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconCamera}
            iconBg="#F0FDF4" iconColor="#16A34A"
            label="Selfie Verification"
            value={selfieVerified ? 'Photo on file' : 'Take a selfie to verify'}
            badge={selfieVerified ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('DriverSelfieVerification')}
          />
        </Card>

        {/* ── Driver Licence ── */}
        <SectionHeader title="Driver's Licence" />
        <Card>
          <MenuRow
            icon={IconLicense}
            iconBg="#EFF6FF" iconColor="#0369A1"
            label="Driver's Licence"
            value={licenseVerified ? d.licenceNumber || 'On file' : 'Not submitted'}
            badge={licenseVerified ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('DriverLicenceVerification')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconLicense}
            iconBg="#EFF6FF" iconColor="#0369A1"
            label="PDP (Professional Driving Permit)"
            value={d.pdpNumber || 'Not submitted'}
            badge={d.pdpNumber ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('DriverLicenceVerification')}
          />
        </Card>

        {/* ── Vehicle Details ── */}
        <SectionHeader title="Vehicle Details" />
        <Card>
          <MenuRow
            icon={IconCar}
            iconBg="#F5F3FF" iconColor="#7C3AED"
            label="Vehicle Make & Model"
            value={d.vehicleMake ? `${d.vehicleMake} ${d.vehicleModel}` : 'Not entered'}
            badge={vehicleVerified ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('DriverVehicleDetails')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconCar}
            iconBg="#F5F3FF" iconColor="#7C3AED"
            label="Licence Plate"
            value={d.licensePlate || 'Not entered'}
            onPress={() => navigation.navigate('DriverVehicleDetails')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconCar}
            iconBg="#F5F3FF" iconColor="#7C3AED"
            label="Vehicle Colour"
            value={d.vehicleColor || 'Not entered'}
            onPress={() => navigation.navigate('DriverVehicleDetails')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconCamera}
            iconBg="#F5F3FF" iconColor="#7C3AED"
            label="Vehicle Photos"
            value={vehicleVerified ? 'Photos uploaded' : 'Upload front, back & interior'}
            badge={vehicleVerified ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('DriverVehicleDetails')}
          />
        </Card>

        {/* ── Personal Info ── */}
        <SectionHeader title="Personal Information" />
        <Card>
          <MenuRow
            icon={IconUser}
            iconBg={colors.primary + '15'} iconColor={colors.primary}
            label="Full Name"
            value={user?.fullName || '—'}
            onPress={() => navigation.navigate('DriverEditProfile')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconUser}
            iconBg={colors.primary + '15'} iconColor={colors.primary}
            label="Email Address"
            value={user?.email || '—'}
            onPress={() => navigation.navigate('DriverEditProfile')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconUser}
            iconBg={colors.primary + '15'} iconColor={colors.primary}
            label="Phone Number"
            value={user?.phone || '—'}
            onPress={() => navigation.navigate('DriverEditProfile')}
          />
        </Card>

        {/* ── Banking ── */}
        <SectionHeader title="Banking & Payouts" />
        <Card>
          <MenuRow
            icon={IconCard}
            iconBg="#F5F3FF" iconColor="#7C3AED"
            label="Bank Account"
            value={bankAdded ? '•••• •••• 4321' : 'Add your bank account to receive payouts'}
            badge={bankAdded ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('DriverBankDetails')}
          />
        </Card>

        {/* ── Account ── */}
        <SectionHeader title="Account" />
        <Card>
          <MenuRow
            icon={IconLock}
            iconBg="#FFF7ED" iconColor="#F97316"
            label="Change Password"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={IconLock}
            iconBg="#F9FAFB" iconColor="#666"
            label="Privacy Settings"
            onPress={() => Alert.alert('Privacy', 'Manage what data is shared with passengers and Lyft.')}
          />
        </Card>

        {/* ── Danger zone ── */}
        <SectionHeader title="Danger Zone" />
        <Card>
          <MenuRow
            icon={({ size }) => <IconLock size={size} color="#F97316" />}
            iconBg="#FFF7ED" iconColor="#F97316"
            label="Log Out"
            onPress={handleLogout}
          />
          <View style={styles.rowDiv} />
          <MenuRow
            icon={({ size }) => <IconTrash size={size} color="#EF4444" />}
            iconBg="#FEF2F2" iconColor="#EF4444"
            label="Delete Account"
            value="Permanently removes your driver account"
            danger
            onPress={handleDeleteAccount}
          />
        </Card>

        <Text style={styles.version}>Lyft v1.0.0 · by DevSphere Inc.</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 28, alignItems: 'center', paddingHorizontal: 24,
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primary,
  },
  headerName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 3 },
  headerEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 12 },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FEF3C7', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, marginBottom: 18,
  },
  verifiedPillGreen: { backgroundColor: '#DCFCE7' },
  verifiedPillText: { fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18, paddingVertical: 12, paddingHorizontal: 24,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },

  // Banner
  verifyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a2e', borderRadius: 18, padding: 16, marginBottom: 20,
  },
  verifyBannerIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  verifyBannerTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
  verifyBannerSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.6)', lineHeight: 16, marginBottom: 8 },
  progressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },

  // Section
  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: '#999',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },

  // Menu row
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuTextCol: { flex: 1 },
  menuLabel: { fontSize: 14.5, fontWeight: '600', color: '#1a1a2e', marginBottom: 1 },
  menuValue: { fontSize: 12, color: '#999', marginTop: 1 },
  rowDiv: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 66 },

  // Badge
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  badgeGreen:  { backgroundColor: '#DCFCE7' },
  badgeYellow: { backgroundColor: '#FEF3C7' },
  badgeRed:    { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 11, fontWeight: '700' },

  version: { textAlign: 'center', fontSize: 11, color: '#CCC', marginTop: 4, letterSpacing: 0.5 },
});