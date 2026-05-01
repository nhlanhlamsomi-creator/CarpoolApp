import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import Button from '../../components/common/Button';
import { colors, typography, spacing, radius } from '../../theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Why CarpoolGo?',
    subtitle: 'Connect with people heading your way. Save money and travel safely.',
    features: [
      { icon: '💰', text: 'Save Money — Share fuel costs with co-travelers' },
      { icon: '💵', text: 'Earn Money — Make extra income as a driver' },
      { icon: '🛡', text: 'Safe & Verified — Travel with trusted, verified users' },
      { icon: '🗺', text: 'Reliable Travel — Scheduled rides, always on time' },
    ],
    accent: colors.primary,
    bgLight: colors.primaryLight,
  },
  {
    id: '2',
    title: 'Rides That Deliver',
    subtitle: 'Real results from real commuters across South Africa.',
    stats: [
      { value: '78%', label: 'Average\ntravel costs\nsaved' },
      { value: '2+ hrs', label: 'Saved daily\nfor passengers' },
      { value: '75%', label: 'Transport\nusers who\nsaved money' },
    ],
    accent: colors.primaryDark,
    bgLight: '#E8F5EE',
  },
  {
    id: '3',
    title: 'How It Works',
    subtitle: 'For Passengers',
    steps: [
      { icon: '🔍', title: 'Find a Ride', desc: 'Search and book a seat in seconds' },
      { icon: '⚡', title: 'Book Instantly', desc: 'Reserve seats and get instant notifications' },
      { icon: '🔒', title: 'Travel Safely', desc: 'GPS-monitored trips, always secure' },
    ],
    accent: colors.primary,
    bgLight: colors.primaryLight,
  },
  {
    id: '4',
    title: 'How It Works',
    subtitle: 'For Drivers',
    steps: [
      { icon: '🚗', title: 'List a Trip', desc: 'Enter route, schedule & pricing' },
      { icon: '👥', title: 'Accept Passengers', desc: 'Get notified & review bookings' },
      { icon: '💰', title: 'Earn Money', desc: 'Get paid for every shared ride' },
    ],
    accent: colors.primaryDark,
    bgLight: '#E8F5EE',
  },
];

function Slide({ item }) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.illustrationBox, { backgroundColor: item.bgLight }]}>
        {/* Illustration placeholder — green gradient card */}
        <View style={styles.illustrationInner}>
          <Text style={styles.illustrationIcon}>🚗</Text>
          <Text style={[styles.slideTitle, { color: item.accent }]}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
      </View>

      <View style={styles.slideContent}>
        {/* Features list */}
        {item.features &&
          item.features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}

        {/* Stats */}
        {item.stats && (
          <View style={styles.statsRow}>
            {item.stats.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={[styles.statValue, { color: item.accent }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Steps */}
        {item.steps &&
          item.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepIconBox, { backgroundColor: item.bgLight }]}>
                <Text style={styles.stepEmoji}>{step.icon}</Text>
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
}

export default function WelcomeScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next });
      setCurrentIndex(next);
    } else {
      navigation.navigate('GetStarted');
    }
  };

  const handleSkip = () => {
    navigation.navigate('GetStarted');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Skip button */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="full"
          style={styles.nextBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    paddingTop: 60,
  },
  illustrationBox: {
    height: height * 0.38,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationInner: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  illustrationIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  slideTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  slideSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  slideContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureEmoji: { fontSize: 18 },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepEmoji: { fontSize: 20 },
  stepText: { flex: 1 },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  stepDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    paddingTop: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  nextBtn: {
    width: '100%',
    borderRadius: radius.full,
  },
});
