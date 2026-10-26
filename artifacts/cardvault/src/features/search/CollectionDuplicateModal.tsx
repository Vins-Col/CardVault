import React from "react";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
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
            { backgroundColor: colors.background, borderColor: colors.border },
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
              <View
                key={item.id}
                style={[
                  styles.matchRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.matchCopy}>
                  <Text
                    numberOfLines={1}
                    style={[styles.matchName, { color: colors.foreground }]}
                  >
                    {item.card.name}
                  </Text>
                  <Text
                    style={[styles.matchMeta, { color: colors.mutedForeground }]}
                  >
                    {item.language} · {item.variant ?? "Variant not specified"} ·{" "}
                    {item.condition} · Qty {item.quantity}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Increase quantity for ${item.card.name}`}
                  testID={`increase-duplicate-${item.id}`}
                  disabled={isSaving}
                  onPress={() => onIncrease(item)}
                  style={[
                    styles.increaseButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: isSaving ? 0.65 : 1,
                    },
                  ]}
                >
                  {isSaving ? (
                    <ActivityIndicator color={colors.primaryForeground} />
                  ) : (
                    <Text
                      style={[
                        styles.increaseLabel,
                        { color: colors.primaryForeground },
                      ]}
                    >
                      Increase
                    </Text>
                  )}
                </Pressable>
              </View>
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

          <Pressable
            accessibilityRole="button"
            testID="create-separate-collection-entry"
            disabled={isSaving}
            onPress={onCreateSeparate}
            style={[
              styles.separateButton,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
                opacity: isSaving ? 0.65 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.separateLabel,
                { color: colors.secondaryForeground },
              ]}
            >
              Create a separate entry
            </Text>
          </Pressable>
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
