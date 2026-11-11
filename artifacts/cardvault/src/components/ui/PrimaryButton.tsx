import React from "react";
import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  testID,
}: PrimaryButtonProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.muted : colors.primary,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: disabled ? colors.mutedForeground : colors.primaryForeground },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
