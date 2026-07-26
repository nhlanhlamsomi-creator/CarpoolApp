import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const GREEN = {
  deep:   "#06231A",
  dark:   "#0E5C3F",
  mid:    "#12724F",
  accent: "#1FB574",
  mint:   "#6FEFB4",
};

type Props = {
  /** Called once the exit animation has finished. Omit to loop forever. */
  onFinish?: () => void;
  /** How long to hold before fading out. Ignored when onFinish is omitted. */
  duration?: number;
  /** Small line under the logo, e.g. "Finding rides near you" */
  label?: string;
};

export default function LogoLoader({
  onFinish,
  duration = 1100,
  label = "Loading",
}: Props) {
  const rootFade  = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoFade  = useRef(new Animated.Value(0)).current;
  const breathe   = useRef(new Animated.Value(1)).current;
  const arcSpin   = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.6)).current;
  const haloFade  = useRef(new Animated.Value(0)).current;
  const labelFade = useRef(new Animated.Value(0)).current;

  // Three dots that rise in sequence
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Arc traces continuously — this is the "something is happening" signal
    Animated.loop(
      Animated.timing(arcSpin, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Logo breathes
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.06,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Halo pushes outward on repeat
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1.45,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(haloFade, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(haloScale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(haloFade, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Dots ripple left to right
    Animated.loop(
      Animated.stagger(
        150,
        dots.map((d) =>
          Animated.sequence([
            Animated.timing(d, { toValue: 1, duration: 340, useNativeDriver: true }),
            Animated.timing(d, { toValue: 0, duration: 340, useNativeDriver: true }),
            Animated.delay(220),
          ])
        )
      )
    ).start();

    // Entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 84,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoFade, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(labelFade, {
        toValue: 1,
        duration: 400,
        delay: 220,
        useNativeDriver: true,
      }),
    ]).start();

    // Exit — only when the caller wants one
    if (onFinish) {
      const timer = setTimeout(() => {
        Animated.timing(rootFade, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) onFinish();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const spin = arcSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.root, { opacity: rootFade }]}>
      <View style={styles.blob} />

      <View style={styles.cluster}>
        <Animated.View
          style={[
            styles.halo,
            { opacity: haloFade, transform: [{ scale: haloScale }] },
          ]}
        />
        <View style={styles.track} />
        <Animated.View style={[styles.arc, { transform: [{ rotate: spin }] }]} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: logoFade,
              transform: [{ scale: Animated.multiply(logoScale, breathe) }],
            },
          ]}
        >
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.labelRow, { opacity: labelFade }]}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.dotsRow}>
          {dots.map((d, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: d.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.25, 1],
                  }),
                  transform: [
                    {
                      translateY: d.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -4],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const LOGO = 96;
const RING = LOGO + 34;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 900,
    elevation: 900,
    backgroundColor: GREEN.deep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width * 0.65,
    backgroundColor: GREEN.dark,
    opacity: 0.45,
    top: -width * 0.8,
    right: -width * 0.35,
  },

  cluster: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: RING + 30,
    height: RING + 30,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: GREEN.accent,
  },
  track: {
    position: "absolute",
    width: RING,
    height: RING,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  arc: {
    position: "absolute",
    width: RING,
    height: RING,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "transparent",
    borderTopColor: GREEN.mint,
    borderRightColor: "rgba(31,181,116,0.4)",
  },
  card: {
    width: LOGO,
    height: LOGO,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN.accent,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.42,
    shadowRadius: 26,
    elevation: 18,
  },
  logo: {
    width: LOGO * 0.64,
    height: LOGO * 0.64,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 34,
  },
  label: {
    fontSize: 12,
    fontFamily: "Jakarta-SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN.mint,
  },
});