import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert, Vibration, StatusBar, Linking,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';

const CloseIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={colors.white} strokeWidth="2.2" strokeLinecap="round"/>
  </Svg>
);

const PhoneCallIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.82 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#27AE60" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ShieldAlertIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 9v4M12 17h.01" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const CheckIcon = () => (
  <Svg width="52" height="52" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)"/>
    <Path d="M8 12l3 3 5-5" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="12" r="10" stroke="#27AE60" strokeWidth="2"/>
  </Svg>
);

const PoliceIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round"/>
    <Path d="M12 13v9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

const AmbulanceIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M3 8h13l3 5v3H3V8zM8 16v2M17 16v2M10 11h3M11.5 9.5v3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="7" cy="18" r="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
    <Circle cx="17" cy="18" r="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
  </Svg>
);

const EmergencyIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
    <Path d="M12 8v4M12 16h.01" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const CONTACTS = [
  { name: 'SA Police (SAPS)', number: '10111', Icon: PoliceIcon },
  { name: 'Ambulance',        number: '10177', Icon: AmbulanceIcon },
  { name: 'Emergency (all)',  number: '112',   Icon: EmergencyIcon },
];

export default function SOSScreen({ navigation, route }) {
  const { tripId } = route?.params || {};

  const [alertSent, setAlertSent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sending, setSending]     = useState(false);

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;
  const timerRef   = useRef(null);

  useEffect(() => {
    // Double pulse rings
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(pulse2Anim, { toValue: 1.35, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse2Anim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Vibration.vibrate([0, 300, 200, 300]);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); sendSOSAlert(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => { Vibration.cancel(); clearInterval(timerRef.current); };
  }, []);

  const sendSOSAlert = async () => {
    if (alertSent || sending) return;
    setSending(true);
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    setTimeout(() => { setAlertSent(true); setSending(false); }, 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0000" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { clearInterval(timerRef.current); navigation.goBack(); }}
          style={styles.closeBtn}
        >
          <CloseIcon />
          <Text style={styles.closeBtnText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <View style={{ width: 88 }} />
      </View>

      <View style={styles.center}>
        {!alertSent ? (
          <>
            {/* Double pulse rings */}
            <Animated.View style={[styles.pulseRing1, { transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={[styles.pulseRing2, { transform: [{ scale: pulse2Anim }] }]} />

            <TouchableOpacity style={styles.sosBtn} onPress={sendSOSAlert} activeOpacity={0.85}>
              <View style={styles.sosBtnInner}>
                <ShieldAlertIcon />
                <Text style={styles.sosBtnText}>SOS</Text>
              </View>
            </TouchableOpacity>

            {countdown > 0 && (
              <View style={styles.countdownBox}>
                <Text style={styles.countdownLabel}>Auto-sending in</Text>
                <Text style={styles.countdownNum}>{countdown}</Text>
              </View>
            )}
            <Text style={styles.cancelHint}>Tap Cancel above to stop the alert</Text>
          </>
        ) : (
          <View style={styles.sentBox}>
            <CheckIcon />
            <Text style={styles.sentTitle}>Alert Sent!</Text>
            <Text style={styles.sentText}>
              Emergency services and our safety team have been notified with your location.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>Call Emergency Services Directly</Text>
        {CONTACTS.map(({ name, number, Icon }) => (
          <TouchableOpacity
            key={number}
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${number}`)}
            activeOpacity={0.75}
          >
            <View style={styles.callIconWrap}>
              <Icon />
            </View>
            <View style={styles.callInfo}>
              <Text style={styles.callName}>{name}</Text>
              <Text style={styles.callNumber}>{number}</Text>
            </View>
            <View style={styles.callActionWrap}>
              <PhoneCallIcon size={16} />
              <Text style={styles.callAction}>Call</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#1A0000' },
  header:           { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8 },
  closeBtnText:     { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.sm },
  headerTitle:      { color: colors.white, fontSize: typography.fontSize.lg, fontWeight: '800' },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  pulseRing1:       { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(231,76,60,0.18)' },
  pulseRing2:       { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(231,76,60,0.10)' },
  sosBtn:           { width: 168, height: 168, borderRadius: 84, backgroundColor: '#C0392B', borderWidth: 5, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  sosBtnInner:      { alignItems: 'center', gap: 6 },
  sosBtnText:       { color: colors.white, fontSize: 40, fontWeight: '900', letterSpacing: 3 },
  countdownBox:     { alignItems: 'center', marginBottom: spacing.md },
  countdownLabel:   { color: 'rgba(255,255,255,0.55)', fontSize: typography.fontSize.sm },
  countdownNum:     { color: colors.white, fontSize: typography.fontSize.display, fontWeight: '900', lineHeight: 56 },
  cancelHint:       { color: 'rgba(255,255,255,0.4)', fontSize: typography.fontSize.sm, textAlign: 'center' },
  sentBox:          { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  sentTitle:        { color: colors.white, fontSize: typography.fontSize.xxl, fontWeight: '800' },
  sentText:         { color: 'rgba(255,255,255,0.7)', fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 22 },
  emergencySection: { backgroundColor: 'rgba(255,255,255,0.05)', margin: spacing.lg, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  emergencyTitle:   { color: 'rgba(255,255,255,0.5)', fontSize: typography.fontSize.xs, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center', letterSpacing: 0.8, textTransform: 'uppercase' },
  callBtn:          { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  callIconWrap:     { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  callInfo:         { flex: 1 },
  callName:         { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.base },
  callNumber:       { color: 'rgba(255,255,255,0.5)', fontSize: typography.fontSize.sm, marginTop: 2 },
  callActionWrap:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  callAction:       { color: '#27AE60', fontWeight: '700', fontSize: typography.fontSize.sm },
});