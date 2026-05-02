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
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Button from '../../components/common/Button';
import { colors, typography, spacing, radius } from '../../theme';

const { width, height } = Dimensions.get('window');

// ─── SVG Icon Components ────────────────────────────────────────────────────

const IconSaveMoney = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill={color} opacity={0.15} />
    <Path d="M12.5 6.5v1.08C14.44 7.87 16 9.28 16 11c0 .55-.45 1-1 1s-1-.45-1-1c0-.55-.67-1-1.5-1s-1.5.45-1.5 1c0 .42.2.63.63.8l2.37.79C15.19 13 16 13.9 16 15c0 1.72-1.56 3.13-3.5 3.42V19.5c0 .55-.45 1-1 1s-1-.45-1-1v-1.08C8.56 18.13 7 16.72 7 15c0-.55.45-1 1-1s1 .45 1 1c0 .55.67 1 1.5 1s1.5-.45 1.5-1c0-.42-.2-.63-.63-.8l-2.37-.79C7.81 13 7 12.1 7 11c0-1.72 1.56-3.13 3.5-3.42V6.5c0-.55.45-1 1-1s1 .45 1 1z" fill={color} />
  </Svg>
);

const IconEarnMoney = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7h18v13H3z" rx="2" fill={color} opacity={0.15} />
    <Rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="12" cy="13.5" r="2.5" fill={color} />
    <Path d="M3 10h18" stroke={color} strokeWidth="1.8" />
    <Path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);

const IconShield = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z" fill={color} opacity={0.15} />
    <Path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconClock = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" fill={color} opacity={0.15} />
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconSearch = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" fill={color} opacity={0.15} />
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconBolt = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" fill={color} opacity={0.15} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </Svg>
);

const IconLock = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill={color} opacity={0.15} />
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
  </Svg>
);

const IconCar = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 17H3V9l2-5h14l2 5v8h-2" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <Path d="M3 12h18" stroke={color} strokeWidth="1.8" />
    <Circle cx="7.5" cy="17" r="2" fill={color} opacity={0.15} stroke={color} strokeWidth="1.8" />
    <Circle cx="16.5" cy="17" r="2" fill={color} opacity={0.15} stroke={color} strokeWidth="1.8" />
  </Svg>
);

const IconUsers = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" fill={color} opacity={0.15} stroke={color} strokeWidth="1.8" />
    <Path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M21 21v-2a4 4 0 0 0-3-3.85" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const IconMapPin = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={color} opacity={0.15} stroke={color} strokeWidth="1.8" />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
  </Svg>
);

// ─── Illustration Components ─────────────────────────────────────────────────

const IllustrationBenefits = ({ accent }) => (
  <Svg width={width - 48} height={220} viewBox="0 0 320 220">
    <Defs>
      <LinearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={accent} stopOpacity="0.12" />
        <Stop offset="1" stopColor={accent} stopOpacity="0.04" />
      </LinearGradient>
    </Defs>
    {/* Road */}
    <Path d="M0 160 Q160 140 320 160 L320 220 L0 220 Z" fill={accent} opacity={0.08} />
    <Path d="M0 170 Q160 150 320 170" stroke={accent} strokeWidth="1.5" strokeDasharray="12 8" opacity={0.3} fill="none" />
    {/* Car body */}
    <G transform="translate(100, 100)">
      <Rect x="0" y="20" width="120" height="44" rx="10" fill={accent} opacity={0.9} />
      <Path d="M20 20 L35 0 L85 0 L100 20 Z" fill={accent} />
      <Rect x="30" y="4" width="24" height="16" rx="4" fill="white" opacity={0.5} />
      <Rect x="66" y="4" width="24" height="16" rx="4" fill="white" opacity={0.5} />
      <Circle cx="22" cy="64" r="14" fill="#1a1a2e" />
      <Circle cx="22" cy="64" r="8" fill="#e0e0e0" />
      <Circle cx="98" cy="64" r="14" fill="#1a1a2e" />
      <Circle cx="98" cy="64" r="8" fill="#e0e0e0" />
      {/* Headlight */}
      <Rect x="112" y="30" width="8" height="6" rx="3" fill="#FFE082" />
    </G>
    {/* People dots */}
    <Circle cx="60" cy="140" r="16" fill={accent} opacity={0.15} />
    <Circle cx="60" cy="132" r="8" fill={accent} opacity={0.4} />
    <Circle cx="260" cy="135" r="16" fill={accent} opacity={0.15} />
    <Circle cx="260" cy="127" r="8" fill={accent} opacity={0.4} />
    {/* Connection line */}
    <Path d="M76 140 Q160 120 244 135" stroke={accent} strokeWidth="1.5" strokeDasharray="6 4" opacity={0.4} fill="none" />
  </Svg>
);

const IllustrationStats = ({ accent }) => (
  <Svg width={width - 48} height={220} viewBox="0 0 320 220">
    <Defs>
      <LinearGradient id="grad2" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor={accent} stopOpacity="0.8" />
        <Stop offset="1" stopColor={accent} stopOpacity="0.3" />
      </LinearGradient>
    </Defs>
    {/* Bar chart */}
    <Rect x="40" y="60" width="48" height="130" rx="8" fill="url(#grad2)" />
    <Rect x="136" y="30" width="48" height="160" rx="8" fill={accent} opacity={0.9} />
    <Rect x="232" y="90" width="48" height="100" rx="8" fill="url(#grad2)" />
    {/* Labels */}
    <Path d="M20 200 L300 200" stroke={accent} strokeWidth="1.5" opacity={0.2} />
    {/* Trend line */}
    <Path d="M64 80 L160 50 L256 110" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.6} />
    <Circle cx="64" cy="80" r="5" fill="white" opacity={0.8} />
    <Circle cx="160" cy="50" r="5" fill="white" opacity={0.8} />
    <Circle cx="256" cy="110" r="5" fill="white" opacity={0.8} />
  </Svg>
);

const IllustrationPassenger = ({ accent }) => (
  <Svg width={width - 48} height={220} viewBox="0 0 320 220">
    {/* Phone mockup */}
    <Rect x="105" y="20" width="110" height="180" rx="18" fill={accent} opacity={0.12} stroke={accent} strokeWidth="1.5" />
    <Rect x="115" y="35" width="90" height="150" rx="10" fill="white" opacity={0.15} />
    {/* Map pin */}
    <Circle cx="160" cy="90" r="22" fill={accent} opacity={0.2} />
    <Circle cx="160" cy="90" r="14" fill={accent} opacity={0.7} />
    <Circle cx="160" cy="90" r="6" fill="white" />
    {/* Route line */}
    <Path d="M160 112 L160 145" stroke={accent} strokeWidth="2.5" strokeDasharray="5 4" opacity={0.5} />
    <Circle cx="160" cy="150" r="5" fill={accent} opacity={0.6} />
    {/* Signal rings */}
    <Circle cx="160" cy="90" r="30" fill="none" stroke={accent} strokeWidth="1" opacity={0.2} />
    <Circle cx="160" cy="90" r="42" fill="none" stroke={accent} strokeWidth="1" opacity={0.1} />
    {/* Mini car */}
    <G transform="translate(60, 155) scale(0.55)">
      <Rect x="0" y="10" width="72" height="30" rx="8" fill={accent} opacity={0.7} />
      <Path d="M12 10 L24 -2 L48 -2 L60 10 Z" fill={accent} opacity={0.5} />
      <Circle cx="14" cy="40" r="9" fill="#1a1a2e" opacity={0.8} />
      <Circle cx="58" cy="40" r="9" fill="#1a1a2e" opacity={0.8} />
    </G>
  </Svg>
);

const IllustrationDriver = ({ accent }) => (
  <Svg width={width - 48} height={220} viewBox="0 0 320 220">
    {/* Road */}
    <Path d="M0 180 L320 180" stroke={accent} strokeWidth="2" opacity={0.15} />
    <Path d="M0 195 L320 195" stroke={accent} strokeWidth="2" opacity={0.08} />
    {/* Dashes */}
    <Path d="M30 187 L70 187" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity={0.2} />
    <Path d="M110 187 L150 187" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity={0.2} />
    <Path d="M190 187 L230 187" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity={0.2} />
    <Path d="M270 187 L310 187" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity={0.2} />
    {/* Large car */}
    <G transform="translate(70, 100)">
      <Rect x="0" y="28" width="180" height="55" rx="14" fill={accent} opacity={0.9} />
      <Path d="M24 28 L44 4 L136 4 L156 28 Z" fill={accent} />
      <Rect x="50" y="8" width="34" height="20" rx="5" fill="white" opacity={0.55} />
      <Rect x="96" y="8" width="34" height="20" rx="5" fill="white" opacity={0.55} />
      <Circle cx="28" cy="83" r="18" fill="#111" />
      <Circle cx="28" cy="83" r="10" fill="#ccc" />
      <Circle cx="152" cy="83" r="18" fill="#111" />
      <Circle cx="152" cy="83" r="10" fill="#ccc" />
      <Rect x="168" y="38" width="12" height="8" rx="4" fill="#FFE082" />
      <Rect x="0" y="48" width="10" height="6" rx="3" fill="#EF5350" opacity={0.8} />
    </G>
    {/* Coins */}
    <Circle cx="56" cy="70" r="18" fill={accent} opacity={0.2} />
    <Text style={{ fontSize: 18 }}>💳</Text>
    <Circle cx="264" cy="70" r="18" fill={accent} opacity={0.2} />
    <Path d="M255 70 Q264 60 273 70 Q264 80 255 70" fill={accent} opacity={0.6} />
    <Path d="M256 70 L272 70M264 62 L264 78" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={0.6} />
  </Svg>
);

// ─── Slide Data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: '1',
    label: 'Why Lyft?',
    title: 'Smarter\nRides Together',
    subtitle: 'Connect with verified commuters heading your way.',
    accent: colors.primary,
    bgDark: colors.primaryDark,
    IllustrationComp: IllustrationBenefits,
    features: [
      { Icon: IconSaveMoney, text: 'Share fuel costs with co-travelers', label: 'Save Money' },
      { Icon: IconEarnMoney, text: 'Make extra income as a driver', label: 'Earn Money' },
      { Icon: IconShield,    text: 'Travel with trusted, verified users', label: 'Safe & Verified' },
      { Icon: IconClock,     text: 'Scheduled rides, always on time', label: 'Reliable Travel' },
    ],
  },
  {
    id: '2',
    label: 'Impact',
    title: 'Real Results,\nReal Savings',
    subtitle: 'From real commuters across South Africa.',
    accent: colors.primaryDark,
    bgDark: '#0d5c3a',
    IllustrationComp: IllustrationStats,
    stats: [
      { value: '78%', label: 'Travel costs\nsaved on average' },
      { value: '2h+', label: 'Saved daily\nper passenger' },
      { value: '75%', label: 'Users who saved\nmoney monthly' },
    ],
  },
  {
    id: '3',
    label: 'Passengers',
    title: 'Book a Ride\nin Seconds',
    subtitle: 'Three taps and you\'re on your way.',
    accent: colors.primary,
    bgDark: colors.primaryDark,
    IllustrationComp: IllustrationPassenger,
    steps: [
      { Icon: IconSearch, title: 'Find a Ride',      desc: 'Search routes by destination & time' },
      { Icon: IconBolt,   title: 'Book Instantly',   desc: 'Reserve a seat & get instant confirmation' },
      { Icon: IconLock,   title: 'Travel Safely',    desc: 'GPS-monitored trips with verified drivers' },
    ],
  },
  {
    id: '4',
    label: 'Drivers',
    title: 'Drive & Earn\nOn Your Terms',
    subtitle: 'Turn your daily commute into income.',
    accent: colors.primaryDark,
    bgDark: '#0d5c3a',
    IllustrationComp: IllustrationDriver,
    steps: [
      { Icon: IconMapPin, title: 'List a Trip',         desc: 'Enter your route, schedule & pricing' },
      { Icon: IconUsers,  title: 'Accept Passengers',   desc: 'Review bookings & confirm riders' },
      { Icon: IconEarnMoney, title: 'Earn Money',       desc: 'Get paid instantly after every ride' },
    ],
  },
];

// ─── Slide Component ──────────────────────────────────────────────────────────

function Slide({ item, index, scrollX }) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const illustrationTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.25, 0, -width * 0.25],
    extrapolate: 'clamp',
  });
  const illustrationOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  const contentTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.15, 0, -width * 0.15],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.slide, { width }]}>
      {/* ── Illustration card ── */}
      <Animated.View
        style={[
          styles.illustrationCard,
          { backgroundColor: item.bgDark },
          { opacity: illustrationOpacity, transform: [{ translateX: illustrationTranslate }] },
        ]}
      >
        {/* Decorative circles */}
        <View style={[styles.decorCircle, styles.decorCircle1, { borderColor: 'rgba(255,255,255,0.08)' }]} />
        <View style={[styles.decorCircle, styles.decorCircle2, { borderColor: 'rgba(255,255,255,0.05)' }]} />

        {/* Slide label pill */}
        <View style={styles.labelPill}>
          <Text style={styles.labelText}>{item.label}</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <item.IllustrationComp accent={item.accent} />
        </View>

        {/* Title overlay */}
        <View style={styles.titleOverlay}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
      </Animated.View>

      {/* ── Content ── */}
      <Animated.View
        style={[
          styles.contentArea,
          { opacity: illustrationOpacity, transform: [{ translateX: contentTranslate }] },
        ]}
      >
        {/* Features */}
        {item.features && item.features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.iconBox, { backgroundColor: item.accent }]}>
              <f.Icon size={22} color="#fff" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.text}</Text>
            </View>
          </View>
        ))}

        {/* Stats */}
        {item.stats && (
          <View style={styles.statsRow}>
            {item.stats.map((s, i) => (
              <View key={i} style={[styles.statCard, { borderColor: item.accent + '28' }]}>
                <Text style={[styles.statValue, { color: item.accent }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Steps */}
        {item.steps && item.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View style={[styles.stepIconBox, { backgroundColor: item.accent }]}>
                <step.Icon size={22} color="#fff" />
              </View>
              {i < item.steps.length - 1 && (
                <View style={[styles.stepConnector, { backgroundColor: item.accent + '30' }]} />
              )}
            </View>
            <View style={styles.stepTextCol}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WelcomeScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      navigation.navigate('GetStarted');
    }
  };

  const handleSkip = () => navigation.navigate('GetStarted');

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Skip */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} scrollX={scrollX} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });
            const currentSlide = SLIDES[Math.round(currentIndex)] || SLIDES[0];
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: currentSlide.accent,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            { backgroundColor: SLIDES[currentIndex]?.accent || colors.primary },
          ]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>
            {isLast ? 'Get Started' : 'Continue'}
          </Text>
          {!isLast && (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
              <Path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
          {isLast && (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
              <Path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" fill="none" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_HEIGHT = height * 0.42;
const ICON_BOX = 46;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: 24,
    zIndex: 999,
    elevation: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  skipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Slide
  slide: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 72 : 56,
  },

  // Illustration card
  illustrationCard: {
    marginHorizontal: 20,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 14,
  },
  decorCircle: {
    position: 'absolute',
    borderWidth: 60,
    borderRadius: 9999,
  },
  decorCircle1: {
    width: 320,
    height: 320,
    top: -120,
    right: -80,
  },
  decorCircle2: {
    width: 220,
    height: 220,
    bottom: -60,
    left: -60,
  },
  labelPill: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  labelText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  illustrationWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleOverlay: {
    padding: 22,
    paddingTop: 0,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 6,
  },
  slideSubtitle: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 20,
    fontWeight: '400',
  },

  // Content
  contentArea: {
    paddingHorizontal: 24,
    paddingTop: 22,
    flex: 1,
  },

  // Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextCol: { flex: 1 },
  featureLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12.5,
    color: '#666',
    lineHeight: 18,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 14,
  },
  stepIconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 18,
    marginVertical: 4,
    borderRadius: 2,
  },
  stepTextCol: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 12.5,
    color: '#777',
    lineHeight: 18,
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    paddingTop: 12,
    backgroundColor: '#F7F8FA',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});