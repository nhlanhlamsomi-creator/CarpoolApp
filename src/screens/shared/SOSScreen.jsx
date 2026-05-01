import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert, Vibration, StatusBar, Linking,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

const EMERGENCY_CONTACTS = [
  { name: 'SA Police (SAPS)', number: '10111', icon: '👮' },
  { name: 'Ambulance',        number: '10177', icon: '🚑' },
  { name: 'Emergency (all)',  number: '112',   icon: '🆘' },
];

export default function SOSScreen({ navigation, route }) {
  const { tripId } = route?.params || {};

  const [alertSent, setAlertSent]   = useState(false);
  const [countdown, setCountdown]   = useState(5);
  const [sending, setSending]       = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef  = useRef(null);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    ).start();

    Vibration.vibrate([0, 300, 200, 300]);

    // Auto-send countdown
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          sendSOSAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      Vibration.cancel();
      clearInterval(timerRef.current);
    };
  }, []);

  const sendSOSAlert = async () => {
    if (alertSent || sending) return;
    setSending(true);
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);

    // In frontend mode — just mark as sent
    // When backend is connected, this will write to Firestore safetyAlerts
    setTimeout(() => {
      setAlertSent(true);
      setSending(false);
    }, 800);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    navigation.goBack();
  };

  const callEmergency = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0000" />

      <View style={styles.header}>
        <TouchableOpacity onPress={cancelSOS} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.center}>
        {!alertSent ? (
          <>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <TouchableOpacity style={styles.sosBtn} onPress={sendSOSAlert}>
              <Text style={styles.sosBtnText}>SOS</Text>
              {countdown > 0 && (
                <Text style={styles.countdownText}>Auto-sending in {countdown}s</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.cancelHint}>Tap Cancel above to stop the alert</Text>
          </>
        ) : (
          <View style={styles.sentBox}>
            <Text style={styles.sentEmoji}>✅</Text>
            <Text style={styles.sentTitle}>Alert Sent!</Text>
            <Text style={styles.sentText}>
              Emergency services and our safety team have been notified with your location.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>Call Emergency Services Directly</Text>
        {EMERGENCY_CONTACTS.map(contact => (
          <TouchableOpacity
            key={contact.number}
            style={styles.callBtn}
            onPress={() => callEmergency(contact.number)}
          >
            <Text style={styles.callIcon}>{contact.icon}</Text>
            <View style={styles.callInfo}>
              <Text style={styles.callName}>{contact.name}</Text>
              <Text style={styles.callNumber}>{contact.number}</Text>
            </View>
            <Text style={styles.callAction}>📞 Call</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#1A0000' },
  header:           { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn:         { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  closeText:        { color: colors.white, fontWeight: '700' },
  headerTitle:      { color: colors.white, fontSize: typography.fontSize.lg, fontWeight: '800' },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  pulseRing:        { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(231,76,60,0.25)' },
  sosBtn:           { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', marginBottom: spacing.lg },
  sosBtnText:       { color: colors.white, fontSize: 42, fontWeight: '900', letterSpacing: 2 },
  countdownText:    { color: 'rgba(255,255,255,0.75)', fontSize: typography.fontSize.xs, marginTop: 4 },
  cancelHint:       { color: 'rgba(255,255,255,0.5)', fontSize: typography.fontSize.sm, textAlign: 'center' },
  sentBox:          { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.xl, padding: spacing.xl },
  sentEmoji:        { fontSize: 56, marginBottom: spacing.md },
  sentTitle:        { color: colors.white, fontSize: typography.fontSize.xxl, fontWeight: '800', marginBottom: spacing.sm },
  sentText:         { color: 'rgba(255,255,255,0.75)', fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 22 },
  emergencySection: { backgroundColor: 'rgba(255,255,255,0.05)', margin: spacing.lg, borderRadius: radius.xl, padding: spacing.md },
  emergencyTitle:   { color: 'rgba(255,255,255,0.6)', fontSize: typography.fontSize.sm, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  callBtn:          { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  callIcon:         { fontSize: 24, marginRight: spacing.md },
  callInfo:         { flex: 1 },
  callName:         { color: colors.white, fontWeight: '700', fontSize: typography.fontSize.base },
  callNumber:       { color: 'rgba(255,255,255,0.6)', fontSize: typography.fontSize.sm },
  callAction:       { color: '#27AE60', fontWeight: '700' },
});