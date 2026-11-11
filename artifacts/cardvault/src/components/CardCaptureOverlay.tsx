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
        style={[styles.backdrop, { backgroundColor: "rgba(0, 0, 0, 0.65)" }]}
      />
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.cardFrame,
            { borderColor: colors.primary, backgroundColor: "transparent" },
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
  );
}

const { width } = Dimensions.get("window");
const frameWidth = Math.min(width * 0.75, 280);
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
    borderWidth: 2,
    borderRadius: 16,
    position: "relative",
  },
  helperText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cornerTopLeft: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTopRight: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
});
