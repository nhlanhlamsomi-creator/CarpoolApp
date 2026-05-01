import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { colors, typography } from '../../theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: circle expands → logo pops → text fades in → navigate
    Animated.sequence([
      // 1. Background circle pulse
      Animated.spring(circleScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      // 2. Logo
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 3. App name
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 4. Tagline
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 2.6 seconds
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Background decorative circles */}
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircleLarge,
          { transform: [{ scale: circleScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircleSmall,
          { transform: [{ scale: circleScale }] },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Car icon — simple SVG-like shape using View */}
        <View style={styles.carIcon}>
          <View style={styles.carBody} />
          <View style={styles.carRoof} />
          <View style={styles.wheelLeft} />
          <View style={styles.wheelRight} />
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        CarpoolGo
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Ride Smart. Save More.
      </Animated.Text>

      {/* University branding */}
      <Animated.Text style={[styles.powered, { opacity: taglineOpacity }]}>
        by DevSphere Inc.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bgCircleLarge: {
    width: width * 1.4,
    height: width * 1.4,
    top: -width * 0.5,
    right: -width * 0.3,
  },
  bgCircleSmall: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: -width * 0.2,
    left: -width * 0.1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.white,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  // Simple car shape using Views
  carIcon: {
    width: 60,
    height: 36,
    position: 'relative',
  },
  carBody: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  carRoof: {
    position: 'absolute',
    bottom: 22,
    left: 12,
    right: 12,
    height: 16,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  wheelLeft: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryDark,
    borderWidth: 3,
    borderColor: colors.white,
  },
  wheelRight: {
    position: 'absolute',
    bottom: 0,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryDark,
    borderWidth: 3,
    borderColor: colors.white,
  },
  appName: {
    fontSize: typography.fontSize.display,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  powered: {
    position: 'absolute',
    bottom: 48,
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
