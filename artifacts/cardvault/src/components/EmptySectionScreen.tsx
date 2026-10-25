import React from "react";
import { Feather } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type FeatherIcon = keyof typeof Feather.glyphMap;

interface EmptySectionScreenProps {
  title: string;
  subtitle: string;
  icon: FeatherIcon;
  emptyTitle: string;
  emptyMessage: string;
  accent?: "primary" | "blue";
}

export default function EmptySectionScreen({
  title,
  subtitle,
  icon,
  emptyTitle,
  emptyMessage,
  accent = "primary",
}: EmptySectionScreenProps) {
  const colors = useColors();
  const accentColor = accent === "blue" ? colors.accent : colors.primary;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.content,
          Platform.OS === "web" ? styles.webTopInset : undefined,
        ]}
      >
        <View style={styles.heading}>
          <View
            style={[
              styles.brandMark,
              { backgroundColor: `${colors.primary}1A` },
            ]}
          >
            <Feather name="layers" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.brand, { color: colors.foreground }]}>
            CardVault
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>

        <View
          accessibilityRole="summary"
          style={[
            styles.emptyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.iconFrame, { backgroundColor: `${accentColor}1A` }]}
          >
            <Feather name={icon} size={26} color={accentColor} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {emptyTitle}
          </Text>
          <Text
            style={[styles.emptyMessage, { color: colors.mutedForeground }]}
          >
            {emptyMessage}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  webTopInset: {
    paddingTop: 67,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 34,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
    maxWidth: 330,
  },
  emptyCard: {
    marginTop: 28,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: "flex-start",
  },
  iconFrame: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  emptyMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
});
