import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "@/components/Logoloader";
import { onboarding } from "@/constants";

const { width, height } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OnboardingItem {
  id: string | number;
  title: string;
  description: string;
  image?: any;
}

interface SlideProps {
  item: OnboardingItem;
  index: number;
  scrollX: Animated.Value;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const PALETTE = {
  bg: "#151128", // Deep sleek midnight purple
  purplePrimary: "#8A3FFC", // Vibrant neon purple CTA
  purpleGlow: "#A855F7",
  cardBg: "#1C1733",
  white: "#FFFFFF",
  textMuted: "#9CA3AF",
  circleRing1: "rgba(138, 63, 252, 0.2)",
  circleRing2: "rgba(138, 63, 252, 0.4)",
  circleRing3: "rgba(138, 63, 252, 0.8)",
  closeBtnBg: "rgba(255, 255, 255, 0.12)",
} as const;

// ─── Animated Slide ──────────────────────────────────────────────────────────

function Slide({ item, index, scrollX }: SlideProps) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Parallax translation + scale + opacity
  const imageTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.35, 0, -width * 0.35],
    extrapolate: "clamp",
  });
  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.82, 1, 0.82],
    extrapolate: "clamp",
  });
  const imageOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  // Subtle tilt tied to scroll position
  const imageRotate = scrollX.interpolate({
    inputRange,
    outputRange: ["-6deg", "0deg", "6deg"],
    extrapolate: "clamp",
  });

  // ── Always-on loops ────────────────────────────────────────────────────────
  const bob = useRef(new Animated.Value(0)).current;
  const spinRing = useRef(new Animated.Value(0)).current;
  const spinInner = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(0.9)).current;

  // Floating accent orbs
  const orb1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Concentric ring rotation
    Animated.loop(
      Animated.timing(spinRing, {
        toValue: 1,
        duration: 28000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(spinInner, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing central glow halo
    Animated.loop(
      Animated.sequence([
        Animated.timing(halo, {
          toValue: 1.15,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(halo, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const drift = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: dur,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: dur,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

    drift(orb1, 3200);
  }, []);

  useEffect(() => {
    pop.setValue(0.9);
    Animated.spring(pop, {
      toValue: 1,
      tension: 70,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const bobY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const ringRotate = spinRing.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const innerRotate = spinInner.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const orb1X = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        style={{
          opacity: imageOpacity,
          transform: [
            { translateX: imageTranslate },
            { scale: imageScale },
            { rotate: imageRotate },
          ],
        }}
      >
        <Animated.View
          style={[
            styles.artwork,
            { transform: [{ translateY: bobY }, { scale: pop }] },
          ]}
        >
          {/* Pulsing Back Halo */}
          <Animated.View
            style={[styles.halo, { transform: [{ scale: halo }] }]}
          />

          {/* Concentric Pulsing Radar Rings */}
          <Animated.View
            style={[styles.outerRing, { transform: [{ rotate: ringRotate }] }]}
          />
          <Animated.View
            style={[
              styles.middleRing,
              { transform: [{ rotate: innerRotate }] },
            ]}
          />
          <View style={styles.centerRing} />

          {/* Floating Glow Orbs */}
          <Animated.View
            style={[
              styles.orb,
              { transform: [{ translateX: orb1X }, { translateY: orb1Y }] },
            ]}
          />

          {/* Main Car / Slide Illustration */}
          {item.image ? (
            <Image
              source={item.image}
              style={styles.slideImage}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require("../../assets/icons/car.png")}
              style={styles.slideImage}
              resizeMode="contain"
            />
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Welcome Component ───────────────────────────────────────────────────────

const Welcome: React.FC = () => {
  const listRef = useRef<FlatList<OnboardingItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [booting, setBooting] = useState<boolean>(true);

  const isLastSlide = activeIndex === onboarding.length - 1;

  // Background ambient glow pulse
  const glowPulse = useRef(new Animated.Value(1)).current;

  // Sheet intro
  const sheetSlide = useRef(new Animated.Value(30)).current;
  const sheetFade = useRef(new Animated.Value(0)).current;

  // Title / Subtitle animations
  const copyFade = useRef(new Animated.Value(0)).current;
  const copySlide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.15,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(sheetFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(sheetSlide, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    copyFade.setValue(0);
    copySlide.setValue(15);
    Animated.parallel([
      Animated.timing(copyFade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(copySlide, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex]);

  const goNext = () => {
    if (isLastSlide) {
      router.replace("/(auth)/sign-up");
    } else {
      listRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  };

  const current: OnboardingItem = onboarding[activeIndex] ?? onboarding[0];

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(i);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={PALETTE.bg} />

      {/* Background Ambient Glow */}
      <Animated.View
        style={[styles.ambientGlow, { transform: [{ scale: glowPulse }] }]}
      />

      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        {/* ── Top Header ── */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/images/hopon.logo.png")}
              style={styles.brandMarkImage}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>HopOn</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace("/(auth)/sign-up")}
            style={styles.closeBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={20} color={PALETTE.white} />
          </TouchableOpacity>
        </View>

        {/* ── Slide Artwork Stage ── */}
        <View style={styles.stage}>
          <Animated.FlatList
            ref={listRef}
            data={onboarding as OnboardingItem[]}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }: ListRenderItemInfo<OnboardingItem>) => (
              <Slide item={item} index={index} scrollX={scrollX} />
            )}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={handleScrollEnd}
          />
        </View>

        {/* ── Bottom Content & Controls ── */}
        <Animated.View
          style={[
            styles.bottomSheet,
            { opacity: sheetFade, transform: [{ translateY: sheetSlide }] },
          ]}
        >
          {/* Pagination Indicators */}
          <View style={styles.dotsRow}>
            {onboarding.map((_, i: number) => {
              const range = [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ];
              const dotWidth = scrollX.interpolate({
                inputRange: range,
                outputRange: [6, 22, 6],
                extrapolate: "clamp",
              });
              const dotOpacity = scrollX.interpolate({
                inputRange: range,
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    { width: dotWidth, opacity: dotOpacity },
                  ]}
                />
              );
            })}
          </View>

          {/* Dynamic Animated Text Content */}
          <Animated.View
            style={[
              styles.copyContainer,
              { opacity: copyFade, transform: [{ translateY: copySlide }] },
            ]}
          >
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.description}>{current.description}</Text>
          </Animated.View>

          {/* Full Width Purple CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {isLastSlide ? "Get Started" : "Try Now"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={PALETTE.white} />
          </TouchableOpacity>

          {/* Footer Auth Navigation */}
          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => router.replace("/(auth)/sign-in")}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLabel}>Already have an account?</Text>
            <Text style={styles.loginAction}>Log in</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {booting && (
        <LogoLoader onFinish={() => setBooting(false)} duration={2500} />
      )}
    </View>
  );
};

export default Welcome;

// ─── Stylesheet ──────────────────────────────────────────────────────────────

const STAGE_HEIGHT = height * 0.42;
const ART_SIZE = width * 0.65;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  ambientGlow: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: PALETTE.purpleGlow,
    opacity: 0.12,
    alignSelf: "center",
    top: height * 0.18,
  },

  // Header
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandMarkImage: {
    width: 28,
    height: 28,
    tintColor: PALETTE.white,
  },
  brandText: {
    color: PALETTE.white,
    fontSize: 22,
    fontFamily: "Jakarta-Bold",
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.closeBtnBg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Slide Stage
  stage: {
    height: STAGE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
  },
  artwork: {
    width: ART_SIZE,
    height: ART_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  slideImage: {
    width: ART_SIZE * 0.36,
    height: ART_SIZE * 0.36,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: PALETTE.cardBg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Concentric Radar Rings
  outerRing: {
    position: "absolute",
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: ART_SIZE / 2,
    borderWidth: 1,
    borderColor: PALETTE.circleRing1,
  },
  middleRing: {
    position: "absolute",
    width: ART_SIZE * 0.75,
    height: ART_SIZE * 0.75,
    borderRadius: (ART_SIZE * 0.75) / 2,
    borderWidth: 1.5,
    borderColor: PALETTE.circleRing2,
  },
  centerRing: {
    position: "absolute",
    width: ART_SIZE * 0.5,
    height: ART_SIZE * 0.5,
    borderRadius: (ART_SIZE * 0.5) / 2,
    borderWidth: 2,
    borderColor: PALETTE.circleRing3,
    backgroundColor: "rgba(138, 63, 252, 0.15)",
  },
  halo: {
    position: "absolute",
    width: ART_SIZE * 0.4,
    height: ART_SIZE * 0.4,
    borderRadius: (ART_SIZE * 0.4) / 2,
    backgroundColor: PALETTE.purplePrimary,
    opacity: 0.35,
  },
  orb: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PALETTE.purpleGlow,
    top: "15%",
    right: "12%",
  },

  // Bottom Content Area
  bottomSheet: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.purplePrimary,
  },
  copyContainer: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  title: {
    color: PALETTE.white,
    fontSize: 28,
    fontFamily: "Jakarta-Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: PALETTE.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Jakarta",
    textAlign: "center",
  },

  // CTA Button
  ctaButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: PALETTE.purplePrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: PALETTE.purplePrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    color: PALETTE.white,
    fontSize: 16,
    fontFamily: "Jakarta-Bold",
  },

  // Auth Footer Row
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  loginLabel: {
    fontSize: 13,
    color: PALETTE.textMuted,
    fontFamily: "Jakarta",
  },
  loginAction: {
    fontSize: 13,
    color: PALETTE.white,
    fontFamily: "Jakarta-Bold",
  },
});