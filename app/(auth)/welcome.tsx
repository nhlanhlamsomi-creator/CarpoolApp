import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
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

// ─── Palette ─────────────────────────────────────────────────────────────────
const GREEN = {
  deep:   "#06231A", // near-black green
  dark:   "#0E5C3F", // primary
  mid:    "#12724F",
  accent: "#1FB574", // emerald
  mint:   "#6FEFB4",
  tint:   "#E6F2EC",
};

const INK   = "#101814";
const MUTED = "#68756F";

// ─── Slide ───────────────────────────────────────────────────────────────────

function Slide({ item, index, scrollX }: any) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Image drifts slower than the swipe — the parallax that gives it depth
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

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        style={{
          opacity: imageOpacity,
          transform: [{ translateX: imageTranslate }, { scale: imageScale }],
        }}
      >
        <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const Welcome = () => {
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [booting, setBooting] = useState(true);

  const isLastSlide = activeIndex === onboarding.length - 1;

  // Ambient motion behind the artwork
  const ringSpin  = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  // Sheet intro
  const sheetSlide = useRef(new Animated.Value(48)).current;
  const sheetFade  = useRef(new Animated.Value(0)).current;

  // Copy re-animates on every slide change
  const copyFade  = useRef(new Animated.Value(0)).current;
  const copySlide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(sheetFade, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.spring(sheetSlide, {
        toValue: 0,
        tension: 62,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fade the copy in whenever the slide changes
  useEffect(() => {
    copyFade.setValue(0);
    copySlide.setValue(18);
    Animated.parallel([
      Animated.timing(copyFade, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(copySlide, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex]);

  const spin = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const goNext = () => {
    if (isLastSlide) {
      router.replace("/(auth)/sign-up");
    } else {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const current = onboarding[activeIndex] ?? onboarding[0];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN.deep} />

      {/* ── Dark green stage ── */}
      <View style={styles.stage}>
        {/* Depth layers */}
        <View style={styles.blobTop} />
        <View style={styles.blobRight} />

        {/* Slow-turning ring */}
        <Animated.View style={[styles.orbitRing, { transform: [{ rotate: spin }] }]} />

        {/* Breathing glow behind the artwork */}
        <Animated.View style={[styles.glow, { transform: [{ scale: glowPulse }] }]} />

        <SafeAreaView edges={["top"]} style={styles.stageSafe}>
          {/* Skip */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.brandMarkImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandText}>Lyft</Text>
            </View>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/sign-up")}
              style={styles.skipBtn}
              activeOpacity={0.75}
            >
              <Text style={styles.skipText}>Skip</Text>
              <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>

          {/* Slides */}
          <Animated.FlatList
            ref={listRef as any}
            data={onboarding}
            keyExtractor={(item: any) => String(item.id)}
            renderItem={({ item, index }: any) => (
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
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(i);
            }}
          />
        </SafeAreaView>
      </View>

      {/* ── White sheet ── */}
      <Animated.View
        style={[
          styles.sheet,
          { opacity: sheetFade, transform: [{ translateY: sheetSlide }] },
        ]}
      >
        <View style={styles.handle} />

        {/* Step counter — real information, not decoration */}
        <Text style={styles.stepLabel}>
          Step {activeIndex + 1} of {onboarding.length}
        </Text>

        <Animated.View
          style={{ opacity: copyFade, transform: [{ translateY: copySlide }] }}
        >
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {onboarding.map((_: any, i: number) => {
            const range = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange: range,
              outputRange: [8, 30, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: range,
              outputRange: [0.22, 1, 0.22],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={goNext} activeOpacity={0.88}>
          <Text style={styles.ctaText}>
            {isLastSlide ? "Get started" : "Continue"}
          </Text>
          <Ionicons
            name={isLastSlide ? "checkmark-circle" : "arrow-forward"}
            size={19}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Log in */}
        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => router.replace("/(auth)/sign-in")}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLabel}>Already have an account?</Text>
          <Text style={styles.loginAction}>Log in</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Logo loader covers the screen while the slide artwork decodes */}
      {booting && <LogoLoader onFinish={() => setBooting(false)} duration={2500} />}
    </View>
  );
};

export default Welcome;

// ─── Styles ──────────────────────────────────────────────────────────────────

const STAGE_HEIGHT = height * 0.52;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GREEN.deep,
  },

  // Stage
  stage: {
    height: STAGE_HEIGHT,
    backgroundColor: GREEN.deep,
    overflow: "hidden",
  },
  stageSafe: {
    flex: 1,
  },
  blobTop: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: GREEN.dark,
    opacity: 0.55,
    top: -width * 0.85,
    left: -width * 0.2,
  },
  blobRight: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: GREEN.mid,
    opacity: 0.22,
    bottom: -width * 0.4,
    right: -width * 0.35,
  },
  orbitRing: {
    position: "absolute",
    width: width * 1.05,
    height: width * 1.05,
    borderRadius: width * 0.525,
    borderWidth: 1.5,
    borderColor: "transparent",
    borderTopColor: "rgba(111,239,180,0.45)",
    borderRightColor: "rgba(31,181,116,0.18)",
    alignSelf: "center",
    top: STAGE_HEIGHT * 0.16,
  },
  glow: {
    position: "absolute",
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: width * 0.39,
    backgroundColor: GREEN.accent,
    opacity: 0.1,
    alignSelf: "center",
    top: STAGE_HEIGHT * 0.2,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkImage: {
    width: 20,
    height: 20,
  },
  brandText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Jakarta-ExtraBold",
    letterSpacing: -0.3,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 7,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  skipText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Jakarta-SemiBold",
  },

  // Slide
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  slideImage: {
    width: width * 0.76,
    height: STAGE_HEIGHT * 0.66,
  },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    marginTop: -30,
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 30,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DFE6E2",
    alignSelf: "center",
    marginBottom: 22,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: "Jakarta-Bold",
    color: GREEN.accent,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontFamily: "Jakarta-ExtraBold",
    color: INK,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 14.5,
    lineHeight: 22,
    fontFamily: "Jakarta",
    color: MUTED,
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN.dark,
  },

  // CTA
  cta: {
    height: 58,
    borderRadius: 18,
    backgroundColor: GREEN.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: GREEN.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Jakarta-Bold",
    letterSpacing: 0.2,
  },

  // Login
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  loginLabel: {
    fontSize: 14,
    fontFamily: "Jakarta",
    color: MUTED,
  },
  loginAction: {
    fontSize: 14,
    fontFamily: "Jakarta-Bold",
    color: GREEN.dark,
  },
});