import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Must match `expo.splash.backgroundColor` in app.json, or you'll see a flash
// when the native splash hands over to this one.
const GREEN = {
  deep:   "#06231A",
  dark:   "#0E5C3F",
  mid:    "#12724F",
  accent: "#1FB574",
  mint:   "#6FEFB4",
};

type Props = {
  onFinish: () => void;
};

export default function AnimatedSplash({ onFinish }: Props) {
  const rootFade   = useRef(new Animated.Value(1)).current;
  const rootScale  = useRef(new Animated.Value(1)).current;

  const logoScale  = useRef(new Animated.Value(0.6)).current;
  const logoFade   = useRef(new Animated.Value(0)).current;
  const ringScale  = useRef(new Animated.Value(0.5)).current;
  const ringFade   = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.5)).current;
  const pulseFade  = useRef(new Animated.Value(0)).current;
  const arcSpin    = useRef(new Animated.Value(0)).current;
  const markFade   = useRef(new Animated.Value(0)).current;
  const markSlide  = useRef(new Animated.Value(16)).current;
  const lineWidth  = useRef(new Animated.Value(0)).current;
  const tagFade    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Arc keeps tracing while everything else settles
    Animated.loop(
      Animated.timing(arcSpin, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Outward pulse, twice
    Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.5,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseFade, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseFade, { toValue: 0.45, duration: 0, useNativeDriver: true }),
        ]),
      ]),
      { iterations: 2 }
    ).start();

    Animated.sequence([
      // Logo lands
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 88,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoFade, { toValue: 1, duration: 340, useNativeDriver: true }),
        Animated.spring(ringScale, {
          toValue: 1,
          tension: 58,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(ringFade, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),

      // Wordmark rises
      Animated.parallel([
        Animated.timing(markFade, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(markSlide, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Rule draws out, tagline follows
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(tagFade, { toValue: 1, duration: 300, useNativeDriver: true }),

      // Hold, then lift away to reveal the app
      Animated.delay(420),
      Animated.parallel([
        Animated.timing(rootFade, {
          toValue: 0,
          duration: 460,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rootScale, {
          toValue: 1.08,
          duration: 460,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, []);

  const spin = arcSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const ruleWidth = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        { opacity: rootFade, transform: [{ scale: rootScale }] },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={GREEN.deep} />

      {/* Depth */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Logo cluster */}
      <View style={styles.logoWrap}>
        <Animated.View
          style={[
            styles.pulseRing,
            { opacity: pulseFade, transform: [{ scale: pulseScale }] },
          ]}
        />
        <Animated.View
          style={[
            styles.staticRing,
            { opacity: ringFade, transform: [{ scale: ringScale }] },
          ]}
        />
        <Animated.View
          style={[
            styles.arcRing,
            { opacity: ringFade, transform: [{ scale: ringScale }, { rotate: spin }] },
          ]}
        />

        <Animated.View
          style={[
            styles.logoCard,
            { opacity: logoFade, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Wordmark */}
      <Animated.Text
        style={[
          styles.wordmark,
          { opacity: markFade, transform: [{ translateY: markSlide }] },
        ]}
      >
        Lyft
      </Animated.Text>

      <Animated.View style={[styles.rule, { width: ruleWidth }]} />

      <Animated.Text style={[styles.tagline, { opacity: tagFade }]}>
        Ride smart. Save more.
      </Animated.Text>

      <Animated.View style={[styles.footer, { opacity: tagFade }]}>
        <View style={styles.footerDot} />
        <Text style={styles.footerText}>by DevSphere Inc.</Text>
        <View style={styles.footerDot} />
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const LOGO = 118;
const RING = LOGO + 42;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
    backgroundColor: GREEN.deep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  blobTop: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: GREEN.dark,
    opacity: 0.5,
    top: -width * 0.9,
    right: -width * 0.4,
  },
  blobBottom: {
    position: "absolute",
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: GREEN.mid,
    opacity: 0.18,
    bottom: -width * 0.7,
    left: -width * 0.35,
  },

  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },
  pulseRing: {
    position: "absolute",
    width: RING + 34,
    height: RING + 34,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: GREEN.accent,
  },
  staticRing: {
    position: "absolute",
    width: RING,
    height: RING,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.16)",
  },
  arcRing: {
    position: "absolute",
    width: RING,
    height: RING,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "transparent",
    borderTopColor: GREEN.mint,
    borderRightColor: "rgba(31,181,116,0.35)",
  },
  logoCard: {
    width: LOGO,
    height: LOGO,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN.accent,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 20,
  },
  logoImage: {
    width: LOGO * 0.66,
    height: LOGO * 0.66,
  },

  wordmark: {
    fontSize: 44,
    fontFamily: "Jakarta-ExtraBold",
    color: "#fff",
    letterSpacing: -1.4,
  },
  rule: {
    height: 2,
    borderRadius: 2,
    backgroundColor: GREEN.accent,
    marginTop: 16,
    marginBottom: 14,
  },
  tagline: {
    fontSize: 12.5,
    fontFamily: "Jakarta-SemiBold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },

  footer: {
    position: "absolute",
    bottom: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN.accent,
    opacity: 0.55,
  },
  footerText: {
    fontSize: 11,
    fontFamily: "Jakarta-SemiBold",
    color: "rgba(255,255,255,0.36)",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
});