import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { useColors } from "@/hooks/useColors";
import { typography } from "@/src/theme/typography";

interface CardCaptureOverlayProps {
  visible?: boolean;
}

export default function CardCaptureOverlay({
  visible = true,
}: CardCaptureOverlayProps) {
  const colors = useColors();
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[styles.backdrop, { backgroundColor: "rgba(0, 0, 0, 0.3)" }]}
      />
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.cardFrame,
            { borderColor: "rgba(255, 255, 255, 0.4)", backgroundColor: "transparent" },
          ]}
        >
          <View
            style={[styles.cornerTopLeft, { borderColor: colors.primary }]}
          />
          <View
            style={[styles.cornerTopRight, { borderColor: colors.primary }]}
          />
          <View
            style={[styles.cornerBottomLeft, { borderColor: colors.primary }]}
          />
          <View
            style={[styles.cornerBottomRight, { borderColor: colors.primary }]}
          />
        </View>
        <View
          style={[
            styles.helperTextContainer,
            { backgroundColor: "rgba(0, 0, 0, 0.65)" },
          ]}
        >
          <Text
            style={[
              styles.helperText,
              { color: "#FFFFFF", fontFamily: typography.fonts.semiBold },
            ]}
          >
            Align the card inside the frame
          </Text>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const frameWidth = Math.min(width * 0.78, 290);
const frameHeight = frameWidth * (3.5 / 2.5); // Pokémon card aspect ratio 3.5:2.5 height:width

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardFrame: {
    width: frameWidth,
    height: frameHeight,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 18,
    position: "relative",
  },
  helperTextContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  helperText: {
    fontSize: 14,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  cornerTopLeft: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 26,
    height: 26,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 26,
    height: 26,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 26,
    height: 26,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
});
