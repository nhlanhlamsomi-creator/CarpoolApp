import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { colors, typography } from '../../theme';

const { width, height } = Dimensions.get('window');

// ─── Particle config ────────────────────────────────────────────────────────
const PARTICLES = [
  { id: 1, top: height * 0.12, left: width * 0.08,  size: 6,  delay: 0    },
  { id: 2, top: height * 0.20, left: width * 0.82,  size: 4,  delay: 200  },
  { id: 3, top: height * 0.35, left: width * 0.92,  size: 8,  delay: 400  },
  { id: 4, top: height * 0.72, left: width * 0.06,  size: 5,  delay: 600  },
  { id: 5, top: height * 0.80, left: width * 0.78,  size: 7,  delay: 300  },
  { id: 6, top: height * 0.55, left: width * 0.95,  size: 4,  delay: 500  },
  { id: 7, top: height * 0.42, left: width * 0.02,  size: 6,  delay: 100  },
];

export default function SplashScreen({ navigation }) {
  // ── Animated values ────────────────────────────────────────────────────────
  const bgScale          = useRef(new Animated.Value(1.3)).current;
  const logoScale        = useRef(new Animated.Value(0)).current;
  const logoOpacity      = useRef(new Animated.Value(0)).current;
  const ringScale        = useRef(new Animated.Value(0.4)).current;
  const ringOpacity      = useRef(new Animated.Value(0)).current;
  const ring2Scale       = useRef(new Animated.Value(0.4)).current;
  const ring2Opacity     = useRef(new Animated.Value(0)).current;
  const textTranslate    = useRef(new Animated.Value(24)).current;
  const textOpacity      = useRef(new Animated.Value(0)).current;
  const taglineOpacity   = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(16)).current;
  const poweredOpacity   = useRef(new Animated.Value(0)).current;
  const floatY           = useRef(new Animated.Value(0)).current;
  const shimmerX         = useRef(new Animated.Value(-width * 0.5)).current;
  const particleAnims    = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  // ── Looping helpers ────────────────────────────────────────────────────────
  const startFloating = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -12,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startShimmer = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: width * 0.5,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(shimmerX, {
          toValue: -width * 0.5,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startParticles = () => {
    const anims = particleAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[i].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.15,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.parallel(anims).start();
  };

  const pulseRings = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 1.4,
            duration: 1600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(600),
      ])
    ).start();
  };

  // ── Main intro sequence ────────────────────────────────────────────────────
  useEffect(() => {
    startParticles();

    Animated.sequence([
      // 1. BG zoom in
      Animated.timing(bgScale, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 2. Logo pop + glow ring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 90,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // 3. App name slides up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 4. Tagline + powered
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(poweredOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      startFloating();
      startShimmer();
      pulseRings();
    });

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: bgScale }] }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Decorative blobs ── */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />
      <View style={styles.blobCenter} />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: particleAnims[i],
            },
          ]}
        />
      ))}

      {/* ── Logo ── */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: floatY }],
          },
        ]}
      >
        {/* Pulsing ring */}
        <Animated.View
          style={[
            styles.ring,
            styles.ringPulse,
            { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
          ]}
        />
        {/* Static ring */}
        <Animated.View
          style={[
            styles.ring,
            styles.ringStatic,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />

        {/* Card */}
        <View style={styles.logoCard}>
          {/* Shimmer sweep */}
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX: shimmerX }, { skewX: '-20deg' }] }]}
          />
          {/* Icon from assets folder */}
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* ── App name ── */}
      <Animated.Text
        style={[
          styles.appName,
          { opacity: textOpacity, transform: [{ translateY: textTranslate }] },
        ]}
      >
        Lyft
      </Animated.Text>

      {/* ── Divider rule ── */}
      <Animated.View style={[styles.rule, { opacity: taglineOpacity }]} />

      {/* ── Tagline ── */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: taglineOpacity, transform: [{ translateY: taglineTranslate }] },
        ]}
      >
        Ride Smart. Save More.
      </Animated.Text>

      {/* ── Footer branding ── */}
      <Animated.View style={[styles.footer, { opacity: poweredOpacity }]}>
        <View style={styles.footerDot} />
        <Text style={styles.powered}>by DevSphere Inc.</Text>
        <View style={styles.footerDot} />
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const LOGO_SIZE = 124;
const RING_SIZE = LOGO_SIZE + 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Blobs
  blobTopRight: {
    position: 'absolute',
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -width * 0.55,
    right: -width * 0.35,
  },
  blobBottomLeft: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(0,0,0,0.12)',
    bottom: -width * 0.35,
    left: -width * 0.2,
  },
  blobCenter: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: height * 0.3,
    left: width * 0.2,
  },

  // Particles
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  // Logo
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
  },
  ringStatic: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ringPulse: {
    width: RING_SIZE + 36,
    height: RING_SIZE + 36,
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
  },
  logoCard: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    backgroundColor: colors.white,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 36,
    elevation: 24,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 56,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 10,
  },
  logoImage: {
    width: LOGO_SIZE * 0.68,
    height: LOGO_SIZE * 0.68,
  },

  // Text
  appName: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1.5,
    includeFontPadding: false,
  },
  rule: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderRadius: 2,
    marginTop: 18,
    marginBottom: 14,
  },
  tagline: {
    fontSize: typography.fontSize.base ?? 16,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 1.4,
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  powered: {
    fontSize: typography.fontSize.xs ?? 11,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});