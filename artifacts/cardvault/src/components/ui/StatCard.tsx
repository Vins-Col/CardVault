import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, subtext, style }: StatCardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.foreground }]}>
        {value}
      </Text>
      {subtext ? (
        <Text style={[styles.subtext, { color: colors.accent }]}>
          {subtext}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  subtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 4,
  },
});
