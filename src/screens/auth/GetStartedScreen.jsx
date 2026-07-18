import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme';

const { height } = Dimensions.get('window');

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconGoogle = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

const IconArrow = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPassenger = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconDriver = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 17H3V9l2-5h14l2 5v8h-2" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <Path d="M3 12h18" stroke={color} strokeWidth="1.8" />
    <Circle cx="7.5" cy="17" r="2" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="16.5" cy="17" r="2" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);

// ─── Role Card — NO Animated wrapper, plain TouchableOpacity ─────────────────

function RoleCard({ icon: Icon, title, desc, accent, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, { borderColor: accent + '30' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.roleIconBox, { backgroundColor: accent }]}>
        <Icon size={24} color="#fff" />
      </View>
      <View style={styles.roleTextCol}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleDesc}>{desc}</Text>
      </View>
      <View style={[styles.roleArrow, { backgroundColor: accent + '18' }]}>
        <IconArrow size={16} color={accent} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GetStartedScreen({ navigation }) {
  const headerOpacity  = useRef(new Animated.Value(0)).current;
  const headerScale    = useRef(new Animated.Value(0.94)).current;
  const sheetOpacity   = useRef(new Animated.Value(0)).current;
  const sheetSlide     = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerScale,   { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(sheetOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(sheetSlide,   { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Hero ── */}
      <Animated.View
        style={[
          styles.hero,
          { opacity: headerOpacity, transform: [{ scale: headerScale }] },
        ]}
      >
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.heroTitle}>Lyft</Text>
        <Text style={styles.heroSub}>Ride Smart. Save More.</Text>
      </Animated.View>

      {/* ── Sheet — no elevation so touches pass through correctly ── */}
      <Animated.View
        style={[
          styles.sheet,
          { opacity: sheetOpacity, transform: [{ translateY: sheetSlide }] },
        ]}
      >
        <View style={styles.sheetHandle} />

        <Text style={styles.sheetTitle}>Choose your role</Text>
        <Text style={styles.sheetSub}>How do you want to use Lyft?</Text>

        {/* These are plain TouchableOpacity — no Animated wrapper blocking touches */}
        <RoleCard
          icon={IconPassenger}
          title="I'm a Passenger"
          desc="Find rides and save on travel costs"
          accent={colors.primary}
          onPress={() => navigation.navigate('Register', { role: 'passenger' })}
        />

        <RoleCard
          icon={IconDriver}
          title="I'm a Driver"
          desc="List trips and earn money on your route"
          accent={colors.primaryDark}
          onPress={() => navigation.navigate('Register', { role: 'driver' })}
        />

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.82}
        >
          <IconGoogle size={20} />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const HERO_HEIGHT = height * 0.34;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  // Hero
  hero: {
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  logoBox: {
    width: 76,
    height: 76,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  // Sheet — NO elevation, NO zIndex that could block touches
  sheet: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 13.5,
    color: '#888',
    marginBottom: 20,
  },

  // Role cards
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  roleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  roleDesc: {
    fontSize: 12.5,
    color: '#888',
    lineHeight: 18,
  },
  roleArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 12,
    color: '#AAA',
    fontWeight: '500',
  },

  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },

  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#999',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});