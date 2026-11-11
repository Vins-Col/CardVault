import React, { type ReactNode } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function AppCard({ children, style }: AppCardProps) {
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
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
});
