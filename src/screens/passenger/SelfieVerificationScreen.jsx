import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { colors } from '../../theme';

export default function SelfieVerificationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Selfie Verification</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.body}>
        <Text style={styles.emoji}>📸</Text>
        <Text style={styles.heading}>Coming Soon</Text>
        <Text style={styles.sub}>
          Selfie verification with camera support is being set up.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { width: 60 },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 20 },
  heading: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', marginBottom: 10 },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
});