import React from "react";
import { Text, StyleSheet, type TextStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SectionTitleProps {
  children: string;
  style?: TextStyle;
}

export function SectionTitle({ children, style }: SectionTitleProps) {
  const colors = useColors();
  return (
    <Text style={[styles.title, { color: colors.foreground }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginBottom: 12,
    marginTop: 8,
  },
});
