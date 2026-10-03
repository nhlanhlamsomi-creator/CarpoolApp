import { brand } from "@/constants/theme";
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

type Props = {
  onFinish: () => void;
};

const { width } = Dimensions.get("window");

export default function AnimatedSplash({ onFinish }: Props) {
  const rootFade = useRef(new Animated.Value(1)).current;
  const rootScale = useRef(new Animated.Value(1)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const markFade = useRef(new Animated.Value(0)).current;
  const markSlide = useRef(new Animated.Value(16)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const tagFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const splashAnimation = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 88,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(markFade, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(markSlide, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(tagFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(850),
      Animated.parallel([
        Animated.timing(rootFade, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rootScale, {
          toValue: 1.06,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    splashAnimation.start(({ finished }) => {
      if (finished) {
        onFinish();
      }
    });

    return () => {
      splashAnimation.stop();
    };
  }, [
    lineWidth,
    logoFade,
    logoScale,
    markFade,
    markSlide,
    onFinish,
    rootFade,
    rootScale,
    tagFade,
  ]);

  const ruleWidth = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.root, { opacity: rootFade, transform: [{ scale: rootScale }] }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={brand.deep} />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.logoWrap}>
        <Animated.View
          style={[
            styles.logoBadge,
            { opacity: logoFade, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require("../assets/images/hopon.logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.wordmark,
          { opacity: markFade, transform: [{ translateY: markSlide }] },
        ]}
      >
        HopOn
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

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    elevation: 999,
    backgroundColor: brand.deep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blobTop: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: brand.dark,
    opacity: 0.5,
    top: -width * 0.9,
    right: -width * 0.4,
  },
  blobBottom: {
    position: "absolute",
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: brand.mid,
    opacity: 0.18,
    bottom: -width * 0.7,
    left: -width * 0.35,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },
  logoBadge: {
    width: 118,
    height: 118,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: brand.accent,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 20,
  },
  logoImage: {
    width: 78,
    height: 78,
  },
  wordmark: {
    fontSize: 44,
    fontFamily: "Jakarta-ExtraBold",
    color: "#FFFFFF",
    letterSpacing: -1.4,
  },
  rule: {
    height: 2,
    borderRadius: 2,
    backgroundColor: brand.accent,
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
    backgroundColor: brand.accent,
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