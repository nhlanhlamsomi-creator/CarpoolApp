import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconShield     = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IconUser       = ({ size = 20, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none"/>
    <Path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
  </Svg>
);
const IconMail       = ({ size = 20, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none"/>
    <Path d="M3 7l9 6 9-6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);
const IconPhone      = ({ size = 20, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke={color} strokeWidth="1.8" fill="none"/>
  </Svg>
);
const IconCard       = ({ size = 20, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8" fill="none"/>
    <Path d="M2 10h20" stroke={color} strokeWidth="1.8"/>
    <Path d="M6 15h4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);
const IconId         = ({ size = 20, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.8" fill="none"/>
    <Circle cx="8" cy="11" r="2.5" stroke={color} strokeWidth="1.5" fill="none"/>
    <Path d="M13 9h5M13 13h3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Path d="M4 18c0-2 1.8-3 4-3s4 1 4 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </Svg>
);
const IconCamera     = ({ size = 20, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.8" fill="none"/>
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.8" fill="none"/>
  </Svg>
);
const IconLock       = ({ size = 20, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" fill="none"/>
    <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Circle cx="12" cy="16" r="1.5" fill={color}/>
  </Svg>
);
const IconTrash      = ({ size = 20, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);
const IconChevron    = ({ size = 16, color = '#CCC' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IconStar       = ({ size = 14, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </Svg>
);
const IconCheck      = ({ size = 14, color = '#16A34A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IconAlert      = ({ size = 14, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="1.8" fill="none"/>
    <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

// Inline Rect helper for SVG
function Rect({ x, y, width, height, rx, stroke, strokeWidth, fill }) {
  const r = rx || 0;
  return (
    <Path
      d={`M${+x+r},${y} H${+x + +width-r} Q${+x + +width},${y} ${+x + +width},${+y+r} V${+y + +height-r} Q${+x + +width},${+y + +height} ${+x + +width-r},${+y + +height} H${+x+r} Q${x},${+y + +height} ${x},${+y + +height-r} V${+y+r} Q${x},${y} ${+x+r},${y} Z`}
      stroke={stroke} strokeWidth={strokeWidth} fill={fill || 'none'}
    />
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ─── Menu row ─────────────────────────────────────────────────────────────────

function MenuRow({ icon: Icon, iconColor = colors.primary, iconBg, label, value, badge, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBox, { backgroundColor: iconBg || colors.primary + '15' }]}>
        <Icon size={18} color={iconColor || colors.primary} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {!!value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {badge && (
        <View style={[
          styles.badge,
          badge === 'Verified'   && styles.badgeGreen,
          badge === 'Pending'    && styles.badgeYellow,
          badge === 'Required'   && styles.badgeRed,
        ]}>
          {badge === 'Verified' && <IconCheck size={11} color="#16A34A" />}
          {badge === 'Pending'  && <IconAlert size={11} color="#F59E0B" />}
          {badge === 'Required' && <IconAlert size={11} color="#EF4444" />}
          <Text style={[
            styles.badgeText,
            badge === 'Verified' && { color: '#16A34A' },
            badge === 'Pending'  && { color: '#F59E0B' },
            badge === 'Required' && { color: '#EF4444' },
          ]}>{badge}</Text>
        </View>
      )}
      {!badge && <IconChevron size={16} color="#CCC" />}
    </TouchableOpacity>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PassengerProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  // Mock verification state — replace with real user data
  const idVerified      = user?.idVerified      || false;
  const selfieVerified  = user?.selfieVerified  || false;
  const paymentAdded    = user?.paymentAdded    || false;

  const verificationScore = [idVerified, selfieVerified, paymentAdded].filter(Boolean).length;
  const verificationPct   = Math.round((verificationScore / 3) * 100);

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: async () => { await logout(); navigation.replace('Splash'); },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently', style: 'destructive',
          onPress: () => Alert.alert('Request sent', 'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours.'),
        },
      ]
    );
  };

  const initials = (user?.fullName || 'P').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity style={styles.avatarEdit} activeOpacity={0.8}>
            <IconCamera size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerName}>{user?.fullName || 'Passenger'}</Text>
        <Text style={styles.headerEmail}>{user?.email || 'No email'}</Text>

        {/* Rating + trips */}
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconStar size={14} color="#F59E0B" />
              <Text style={styles.headerStatVal}>{user?.rating || '5.0'}</Text>
            </View>
            <Text style={styles.headerStatLabel}>Rating</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatVal}>{user?.tripCount || '0'}</Text>
            <Text style={styles.headerStatLabel}>Trips</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatVal}>{verificationPct}%</Text>
            <Text style={styles.headerStatLabel}>Verified</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Identity Verification banner ── */}
        {verificationScore < 3 && (
          <TouchableOpacity style={styles.verifyBanner} activeOpacity={0.85}>
            <View style={styles.verifyBannerIcon}>
              <IconShield size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyBannerTitle}>Complete your verification</Text>
              <Text style={styles.verifyBannerSub}>
                {3 - verificationScore} step{3 - verificationScore > 1 ? 's' : ''} remaining — verified passengers get priority booking
              </Text>
              {/* Progress bar */}
              <View style={styles.verifyProgressBg}>
                <View style={[styles.verifyProgressFill, { width: `${verificationPct}%` }]} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Identity & Security ── */}
        <SectionHeader title="Identity & Security" />
        <Card>
          <MenuRow
            icon={IconId}
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
            label="SA ID Number"
            value={idVerified ? '•••••••••••••' : 'Not submitted'}
            badge={idVerified ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('IDVerification')}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon={IconCamera}
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            label="Selfie Verification"
            value={selfieVerified ? 'Photo on file' : 'Take a selfie to verify'}
            badge={selfieVerified ? 'Verified' : 'Required'}
            onPress={() => navigation.navigate('SelfieVerification')}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon={IconLock}
            iconBg="#FFF7ED"
            iconColor="#F97316"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </Card>

        {/* ── Personal Information ── */}
        <SectionHeader title="Personal Information" />
        <Card>
          <MenuRow
            icon={IconUser}
            iconBg={colors.primary + '15'}
            iconColor={colors.primary}
            label="Full Name"
            value={user?.fullName || '—'}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon={IconMail}
            iconBg={colors.primary + '15'}
            iconColor={colors.primary}
            label="Email Address"
            value={user?.email || '—'}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon={IconPhone}
            iconBg={colors.primary + '15'}
            iconColor={colors.primary}
            label="Phone Number"
            value={user?.phone || '—'}
            onPress={() => navigation.navigate('EditProfile')}
          />
        </Card>

        {/* ── Payment Methods ── */}
        <SectionHeader title="Payment" />
        <Card>
          <MenuRow
            icon={IconCard}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            label="Payment Methods"
            value={paymentAdded ? 'Visa •••• 4242' : 'No payment method added'}
            badge={!paymentAdded ? 'Required' : undefined}
            onPress={() => navigation.navigate('PaymentMethods')}
          />
          {paymentAdded && (
            <>
              <View style={styles.rowDivider} />
              <MenuRow
                icon={IconCard}
                iconBg="#F5F3FF"
                iconColor="#7C3AED"
                label="Add Payment Method"
                onPress={() => navigation.navigate('PaymentMethods')}
              />
            </>
          )}
        </Card>

        {/* ── Account ── */}
        <SectionHeader title="Account" />
        <Card>
          <MenuRow
            icon={IconLock}
            iconBg="#F9FAFB"
            iconColor="#666"
            label="Privacy Settings"
            onPress={() => Alert.alert('Privacy', 'Manage what data is shared with drivers and Lyft.')}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon={IconLock}
            iconBg="#F9FAFB"
            iconColor="#666"
            label="Do Not Sell My Data"
            onPress={() => Alert.alert('Data Privacy', 'Your data will not be sold to third parties.')}
          />
        </Card>

        {/* ── Danger zone ── */}
        <SectionHeader title="Danger Zone" />
        <Card>
          <MenuRow
            icon={({ size }) => <IconLock size={size} color="#F97316" />}
            iconBg="#FFF7ED"
            iconColor="#F97316"
            label="Log Out"
            danger={false}
            onPress={handleLogout}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon={({ size }) => <IconTrash size={size} color="#EF4444" />}
            iconBg="#FEF2F2"
            iconColor="#EF4444"
            label="Delete Account"
            value="Permanently removes all your data"
            danger
            onPress={handleDeleteAccount}
          />
        </Card>

        <Text style={styles.versionText}>Lyft v1.0.0 · by DevSphere Inc.</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 28,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  headerEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 20,
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 0,
  },
  headerStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  headerStatVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },

  // Verification banner
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1a1a2e',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  verifyBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  verifyBannerSub: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
    marginBottom: 8,
  },
  verifyProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
  },
  verifyProgressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Section header
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Menu row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 1,
  },
  menuValue: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 66,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeGreen:  { backgroundColor: '#DCFCE7' },
  badgeYellow: { backgroundColor: '#FEF3C7' },
  badgeRed:    { backgroundColor: '#FEE2E2' },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Footer
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#CCC',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});