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
import { OWNED_CARD_LANGUAGES } from "@/src/models/owned-card-language";
import type { OwnedCardLanguage } from "@/src/models/owned-card-language";
import type { Card } from "@/src/models/card";

const CONDITIONS = [
  "Near Mint",
  "Lightly Played",
  "Moderately Played",
  "Heavily Played",
  "Damaged",
] as const;

interface AddToCollectionModalProps {
  card: Card | null;
  visible: boolean;
  selectedLanguage: OwnedCardLanguage | null;
  selectedCondition: string | null;
  isSaving: boolean;
  error: string | null;
  onSelectLanguage: (language: OwnedCardLanguage) => void;
  onSelectCondition: (condition: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function AddToCollectionModal({
  card,
  visible,
  selectedLanguage,
  selectedCondition,
  isSaving,
  error,
  onSelectLanguage,
  onSelectCondition,
  onClose,
  onSave,
}: AddToCollectionModalProps) {
  const colors = useColors();
  const canSave = Boolean(selectedLanguage && selectedCondition && !isSaving);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView
          edges={["bottom"]}
          style={[
            styles.sheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Add to Collection
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {card?.name ?? ""}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close add to collection"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Physical card language
            </Text>
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>
              Catalog language: {card?.language}. Choose the language printed on
              the copy you own.
            </Text>
            <View style={styles.chipGrid}>
              {OWNED_CARD_LANGUAGES.map((language) => {
                const selected = selectedLanguage === language;
                return (
                  <Pressable
                    key={language}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    testID={`owned-language-${language.toLowerCase()}`}
                    onPress={() => onSelectLanguage(language)}
                    style={[
                      styles.choice,
                      {
                        backgroundColor: selected
                          ? `${colors.primary}22`
                          : colors.card,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        {
                          color: selected
                            ? colors.primary
                            : colors.secondaryForeground,
                        },
                      ]}
                    >
                      {language}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={[
                styles.sectionTitle,
                styles.conditionHeading,
                { color: colors.foreground },
              ]}
            >
              Condition
            </Text>
            <View style={styles.chipGrid}>
              {CONDITIONS.map((condition) => {
                const selected = selectedCondition === condition;
                return (
                  <Pressable
                    key={condition}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => onSelectCondition(condition)}
                    style={[
                      styles.choice,
                      {
                        backgroundColor: selected
                          ? `${colors.accent}22`
                          : colors.card,
                        borderColor: selected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        {
                          color: selected
                            ? colors.accent
                            : colors.secondaryForeground,
                        },
                      ]}
                    >
                      {condition}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error ? (
              <Text
                accessibilityRole="alert"
                style={[styles.error, { color: colors.destructive }]}
              >
                {error}
              </Text>
            ) : null}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            testID="save-to-collection"
            disabled={!canSave}
            onPress={onSave}
            style={[
              styles.saveButton,
              {
                backgroundColor: canSave ? colors.primary : colors.secondary,
              },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={[
                  styles.saveLabel,
                  {
                    color: canSave
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                Save card
              </Text>
            )}
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.68)",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 22,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 6,
  },
  helper: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choice: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  conditionHeading: {
    marginTop: 22,
  },
  error: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  saveLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
