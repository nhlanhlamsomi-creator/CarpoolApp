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
const WARM = {
  cream:      "#FBF7F0",
  sand:       "#F4EDE1",
  beige:      "#EDE3D2",
  gold:       "#F5B93C",
  goldDeep:   "#E0A11E",
  goldSoft:   "#FCEBC4",
  charcoal:   "#2B2722",
  graphite:   "#4A443D",
  muted:      "#9A928A",
  line:       "#E7DECF",
};

// ─── Animated Slide ──────────────────────────────────────────────────────────

function Slide({ item, index, scrollX }: any) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Parallax drift + scale + fade as you swipe
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

  // Subtle tilt tied to scroll position — artwork leans into the swipe
  const imageRotate = scrollX.interpolate({
    inputRange,
    outputRange: ["-6deg", "0deg", "6deg"],
    extrapolate: "clamp",
  });

  // ── Always-on loops ────────────────────────────────────────────────────────
  const bob       = useRef(new Animated.Value(0)).current; // vertical float
  const spinRing  = useRef(new Animated.Value(0)).current; // outer dashed ring
  const spinInner = useRef(new Animated.Value(0)).current; // inner thin ring
  const halo      = useRef(new Animated.Value(1)).current; // breathing halo
  const pop       = useRef(new Animated.Value(0.9)).current; // entrance pop

  // Floating accent orbs — three independent phases
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;
  const orb3 = useRef(new Animated.Value(0)).current;

  // Sparkle twinkles
  const twinkle1 = useRef(new Animated.Value(0)).current;
  const twinkle2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle vertical bob — the artwork "floats"
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

    // Outer dashed ring spins one way
    Animated.loop(
      Animated.timing(spinRing, {
        toValue: 1,
        duration: 28000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Inner thin ring spins the other way — depth illusion
    Animated.loop(
      Animated.timing(spinInner, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Breathing halo
    Animated.loop(
      Animated.sequence([
        Animated.timing(halo, {
          toValue: 1.12,
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

    // Orbs drift on their own timelines
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
    drift(orb2, 4100);
    drift(orb3, 3700);

    // Twinkle sparkles
    const twinkle = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: dur,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: dur,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

    twinkle(twinkle1, 1800);
    twinkle(twinkle2, 2200);
  }, []);

  // Entrance pop fires whenever this slide becomes the active one
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
    outputRange: [0, -12],
  });

  const ringRotate = spinRing.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const innerRotate = spinInner.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });
  const orb1X = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  const orb2Y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const orb2X = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });

  const orb3Y = orb3.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const orb3X = orb3.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });

  const twinkle1Opacity = twinkle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.9],
  });
  const twinkle2Opacity = twinkle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.8],
  });

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
        {/* Illustration composition — all layers anchored here */}
        <Animated.View
          style={[
            styles.artwork,
            { transform: [{ translateY: bobY }, { scale: pop }] },
          ]}
        >
          {/* Outer dashed rotating ring */}
          <Animated.View
            style={[styles.dashedRing, { transform: [{ rotate: ringRotate }] }]}
          />

          {/* Inner thin counter-rotating ring */}
          <Animated.View
            style={[styles.innerRing, { transform: [{ rotate: innerRotate }] }]}
          />

          {/* Breathing halo behind the image */}
          <Animated.View style={[styles.halo, { transform: [{ scale: halo }] }]} />

          {/* Floating golden orbs */}
          <Animated.View
            style={[
              styles.orb,
              styles.orb1,
              { transform: [{ translateX: orb1X }, { translateY: orb1Y }] },
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              styles.orb2,
              { transform: [{ translateX: orb2X }, { translateY: orb2Y }] },
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              styles.orb3,
              { transform: [{ translateX: orb3X }, { translateY: orb3Y }] },
            ]}
          />

          {/* Twinkling sparkles */}
          <Animated.View
            style={[styles.sparkle, styles.sparkle1, { opacity: twinkle1Opacity }]}
          >
            <View style={styles.sparkleDot} />
          </Animated.View>
          <Animated.View
            style={[styles.sparkle, styles.sparkle2, { opacity: twinkle2Opacity }]}
          >
            <View style={styles.sparkleDot} />
          </Animated.View>

          {/* The actual illustration */}
          <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
        </Animated.View>
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
  const glowPulse = useRef(new Animated.Value(1)).current;

  // Sheet intro
  const sheetSlide = useRef(new Animated.Value(48)).current;
  const sheetFade  = useRef(new Animated.Value(0)).current;

  // Copy re-animates on every slide change
  const copyFade  = useRef(new Animated.Value(0)).current;
  const copySlide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
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
      <StatusBar barStyle="dark-content" backgroundColor={WARM.cream} />

      {/* ── Cream stage ── */}
      <View style={styles.stage}>
        <View style={styles.blobTop} />
        <View style={styles.blobRight} />

        {/* Breathing golden glow — sits behind the slides */}
        <Animated.View style={[styles.glow, { transform: [{ scale: glowPulse }] }]} />

        <SafeAreaView edges={["top"]} style={styles.stageSafe}>
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
              <Ionicons name="chevron-forward" size={13} color={WARM.graphite} />
            </TouchableOpacity>
          </View>

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

      {/* ── Soft sand sheet ── */}
      <Animated.View
        style={[
          styles.sheet,
          { opacity: sheetFade, transform: [{ translateY: sheetSlide }] },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.stepPill}>
          <View style={styles.stepDot} />
          <Text style={styles.stepLabel}>
            Step {activeIndex + 1} of {onboarding.length}
          </Text>
        </View>

        <Animated.View
          style={{ opacity: copyFade, transform: [{ translateY: copySlide }] }}
        >
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>
        </Animated.View>

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
              outputRange: [0.3, 1, 0.3],
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

        <TouchableOpacity style={styles.cta} onPress={goNext} activeOpacity={0.88}>
          <Text style={styles.ctaText}>
            {isLastSlide ? "Get started" : "Continue"}
          </Text>
          <View style={styles.ctaIconWrap}>
            <Ionicons
              name={isLastSlide ? "checkmark" : "arrow-forward"}
              size={16}
              color={WARM.charcoal}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => router.replace("/(auth)/sign-in")}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLabel}>Already have an account?</Text>
          <Text style={styles.loginAction}>Log in</Text>
        </TouchableOpacity>
      </Animated.View>

      {booting && <LogoLoader onFinish={() => setBooting(false)} duration={2500} />}
    </View>
  );
};

export default Welcome;

// ─── Styles ──────────────────────────────────────────────────────────────────

const STAGE_HEIGHT = height * 0.52;
const ART_SIZE = width * 0.76;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WARM.cream },

  // Stage
  stage: {
    height: STAGE_HEIGHT,
    backgroundColor: WARM.cream,
    overflow: "hidden",
  },
  stageSafe: { flex: 1 },
  blobTop: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: WARM.goldSoft,
    opacity: 0.55,
    top: -width * 0.85,
    left: -width * 0.2,
  },
  blobRight: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: WARM.sand,
    opacity: 0.8,
    bottom: -width * 0.4,
    right: -width * 0.35,
  },
  glow: {
    position: "absolute",
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: width * 0.39,
    backgroundColor: WARM.gold,
    opacity: 0.14,
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
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: WARM.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: WARM.goldDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandMarkImage: { width: 20, height: 20 },
  brandText: {
    color: WARM.charcoal,
    fontSize: 17,
    fontFamily: "Jakarta-ExtraBold",
    letterSpacing: -0.3,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: WARM.sand,
    borderWidth: 1,
    borderColor: WARM.line,
  },
  skipText: {
    color: WARM.graphite,
    fontSize: 13,
    fontFamily: "Jakarta-SemiBold",
  },

  // Slide + artwork composition
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  artwork: {
    width: ART_SIZE,
    height: STAGE_HEIGHT * 0.66,
    alignItems: "center",
    justifyContent: "center",
  },
  slideImage: {
    width: ART_SIZE,
    height: STAGE_HEIGHT * 0.66,
  },

  // Decorative rings — centred behind the image
  dashedRing: {
    position: "absolute",
    width: ART_SIZE * 1.08,
    height: ART_SIZE * 1.08,
    borderRadius: (ART_SIZE * 1.08) / 2,
    borderWidth: 1.5,
    borderColor: "transparent",
    borderTopColor: "rgba(245,185,60,0.7)",
    borderRightColor: "rgba(245,185,60,0.25)",
    borderBottomColor: "rgba(245,185,60,0.7)",
    borderLeftColor: "rgba(245,185,60,0.25)",
  },
  innerRing: {
    position: "absolute",
    width: ART_SIZE * 0.92,
    height: ART_SIZE * 0.92,
    borderRadius: (ART_SIZE * 0.92) / 2,
    borderWidth: 1,
    borderColor: "transparent",
    borderTopColor: "rgba(224,161,30,0.5)",
    borderBottomColor: "rgba(224,161,30,0.2)",
  },

  // Breathing halo
  halo: {
    position: "absolute",
    width: ART_SIZE * 0.86,
    height: ART_SIZE * 0.86,
    borderRadius: (ART_SIZE * 0.86) / 2,
    backgroundColor: WARM.goldSoft,
    opacity: 0.55,
  },

  // Floating golden orbs
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: WARM.gold,
  },
  orb1: {
    width: 14,
    height: 14,
    top: "18%",
    right: "6%",
    opacity: 0.85,
  },
  orb2: {
    width: 10,
    height: 10,
    bottom: "22%",
    left: "8%",
    opacity: 0.7,
    backgroundColor: WARM.goldDeep,
  },
  orb3: {
    width: 8,
    height: 8,
    top: "12%",
    left: "14%",
    opacity: 0.6,
  },

  // Twinkling sparkles
  sparkle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle1: { top: "28%", left: "2%" },
  sparkle2: { bottom: "18%", right: "4%" },
  sparkleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WARM.goldDeep,
  },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: WARM.sand,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -32,
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 30,
    shadowColor: WARM.charcoal,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 12,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: WARM.beige,
    alignSelf: "center",
    marginBottom: 22,
  },

  // Step pill
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: WARM.goldSoft,
    marginBottom: 14,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WARM.goldDeep,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: "Jakarta-Bold",
    color: WARM.goldDeep,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  title: {
    fontSize: 29,
    lineHeight: 35,
    fontFamily: "Jakarta-ExtraBold",
    color: WARM.charcoal,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 14.5,
    lineHeight: 22,
    fontFamily: "Jakarta",
    color: WARM.graphite,
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
    backgroundColor: WARM.gold,
  },

  // CTA
  cta: {
    height: 58,
    borderRadius: 22,
    backgroundColor: WARM.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: WARM.goldDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaText: {
    color: WARM.charcoal,
    fontSize: 16,
    fontFamily: "Jakarta-Bold",
    letterSpacing: 0.2,
  },
  ctaIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
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
    color: WARM.muted,
  },
  loginAction: {
    fontSize: 14,
    fontFamily: "Jakarta-Bold",
    color: WARM.charcoal,
  },
});