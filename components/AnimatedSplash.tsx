import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    View,
} from "react-native";

type Props = {
  onFinish: () => void;
};

const { width: screenWidth } = Dimensions.get("window");

const ringSize = Math.min(Math.max(screenWidth * 0.19, 90), 155);
const ringGap = Math.min(Math.max(screenWidth * 0.016, 6), 12);
const archWidth = Math.min(Math.max(screenWidth * 0.38, 170), 280);
const archHeight = Math.min(Math.max(screenWidth * 0.16, 70), 120);
const archStroke = Math.min(Math.max(screenWidth * 0.05, 22), 42);
const paddingBottom = Math.min(Math.max(screenWidth * 0.05, 20), 48);
const overlapOffset = Math.min(Math.max(screenWidth * 0.02, 8), 18);

export default function AnimatedSplash({ onFinish }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const rootFade = useRef(new Animated.Value(1)).current;
  const rootScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const logoAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    logoAnimation.start();

    const splashAnimation = Animated.sequence([
      Animated.delay(10000),
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
        logoAnimation.stop();
        onFinish();
      }
    });

    return () => {
      logoAnimation.stop();
      splashAnimation.stop();
    };
  }, [onFinish, progress, rootFade, rootScale]);

  const archRotation = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-6deg", "0deg", "6deg"],
  });

  const archTranslateY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-2, 0, -2],
  });

  const leftScaleX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.04, 0.97, 1],
  });

  const leftScaleY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.03, 1],
  });

  const leftRotation = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-3deg", "0deg", "2deg"],
  });

  const rightScaleX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.97, 1.04],
  });

  const rightScaleY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 0.96],
  });

  const rightRotation = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-2deg", "0deg", "3deg"],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        {
          opacity: rootFade,
          transform: [{ scale: rootScale }],
        },
      ]}
    >
      <View style={styles.logoStage}>
        <Animated.View
          style={[
            styles.archWrap,
            {
              transform: [
                { rotate: archRotation },
                { translateY: archTranslateY },
              ],
            },
          ]}
        >
          <View style={styles.topArch} />
        </Animated.View>

        <View style={styles.ringsRow}>
          <Animated.View
            style={[
              styles.logoRing,
              styles.leftRing,
              {
                transform: [
                  { scaleX: leftScaleX },
                  { scaleY: leftScaleY },
                  { rotate: leftRotation },
                ],
              },
            ]}
          >
            <View style={styles.ringHole} />
          </Animated.View>

          <Animated.View
            style={[
              styles.logoRing,
              styles.rightRing,
              {
                transform: [
                  { scaleX: rightScaleX },
                  { scaleY: rightScaleY },
                  { rotate: rightRotation },
                ],
              },
            ]}
          >
            <View style={styles.ringHole} />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoStage: {
    position: "relative",
    width: Math.min(screenWidth * 0.68, 420),
    height: Math.min(screenWidth * 0.46, 330),
    minHeight: 220,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: paddingBottom,
  },
  archWrap: {
    position: "absolute",
    left: "50%",
    marginLeft: -archWidth / 2,
    bottom: paddingBottom + ringSize - overlapOffset,
    width: archWidth,
    height: archHeight,
    pointerEvents: "none",
  },
  topArch: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    borderWidth: archStroke,
    borderColor: "rgb(48, 52, 56)",
    borderBottomWidth: 0,
    borderTopLeftRadius: archWidth,
    borderTopRightRadius: archWidth,
  },
  ringsRow: {
    position: "relative",
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  logoRing: {
    position: "relative",
    width: ringSize,
    height: ringSize,
    borderRadius: ringSize / 2,
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: ringGap / 2,
  },
  leftRing: {
    backgroundColor: "#d2fe52",
  },
  rightRing: {
    backgroundColor: "#d2fe52",
  },
  ringHole: {
    position: "absolute",
    width: "47%",
    height: "47%",
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
});