import React from "react";
import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { CollectionItem } from "@/src/models/collection-item";
import { AppCard } from "@/src/components/ui/AppCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";

interface CollectionDuplicateModalProps {
  items: readonly CollectionItem[];
  visible: boolean;
  isSaving: boolean;
  error: string | null;
  onIncrease: (item: CollectionItem) => void;
  onCreateSeparate: () => void;
  onClose: () => void;
}

export default function CollectionDuplicateModal({
  items,
  visible,
  isSaving,
  error,
  onIncrease,
  onCreateSeparate,
  onClose,
}: CollectionDuplicateModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView
          edges={["top", "bottom"]}
          style={[
            styles.dialog,
            { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <View style={styles.headingRow}>
            <View style={styles.iconCircle}>
              <Feather name="copy" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              This card is already in your collection
            </Text>
          </View>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>
            Increase the quantity of a matching entry, or save this as a
            separate entry.
          </Text>

          <ScrollView
            style={styles.matches}
            contentContainerStyle={styles.matchesContent}
          >
            {items.map((item) => (
              <AppCard
                key={item.id}
                style={{
                  borderRadius: colors.radius,
                  padding: spacing.md,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: spacing.sm,
                }}
              >
                <View style={styles.matchCopy}>
                  <Text
                    numberOfLines={1}
                    style={[styles.matchName, { color: colors.foreground, fontFamily: typography.fonts.semiBold }]}
                  >
                    {item.card.name}
                  </Text>
                  <Text
                    style={[styles.matchMeta, { color: colors.mutedForeground, fontFamily: typography.fonts.regular }]}
                  >
                    {item.language} · {item.variant ?? "Variant not specified"} ·{" "}
                    {item.condition} · Qty {item.quantity}
                  </Text>
                </View>
                <PrimaryButton
                  title={isSaving ? "..." : "Increase"}
                  disabled={isSaving}
                  onPress={() => onIncrease(item)}
                  testID={`increase-duplicate-${item.id}`}
                  style={{ paddingVertical: 8, paddingHorizontal: 14, minHeight: 38 }}
                  textStyle={{ fontSize: 13 }}
                />
              </AppCard>
            ))}
          </ScrollView>

          {error ? (
            <Text
              accessibilityRole="alert"
              style={[styles.error, { color: colors.destructive }]}
            >
              {error}
            </Text>
          ) : null}

          <PrimaryButton
            title="Create a separate entry"
            disabled={isSaving}
            onPress={onCreateSeparate}
            testID="create-separate-collection-entry"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              borderWidth: 1,
              marginTop: spacing.md,
            }}
            textStyle={{ color: colors.secondaryForeground }}
          />
          <Pressable
            accessibilityRole="button"
            testID="cancel-duplicate-entry"
            disabled={isSaving}
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={[styles.cancelLabel, { color: colors.mutedForeground }]}>
              Cancel
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  dialog: {
    maxHeight: "90%",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 130, 60, 0.14)",
  },
  heading: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    lineHeight: 24,
  },
  copy: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  matches: {
    flexShrink: 1,
    marginTop: 14,
  },
  matchesContent: {
    gap: 8,
  },
  matchRow: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 11,
    gap: 10,
  },
  matchCopy: {
    gap: 4,
  },
  matchName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  matchMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  increaseButton: {
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  increaseLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  error: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 10,
  },
  separateButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  separateLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  cancelLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
