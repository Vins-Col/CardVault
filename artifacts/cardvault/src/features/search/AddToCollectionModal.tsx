import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { OWNED_CARD_LANGUAGES } from "@/src/models/owned-card-language";
import type { OwnedCardLanguage } from "@/src/models/owned-card-language";
import type { Card } from "@/src/models/card";

const CONDITIONS = [
  "Mint",
  "Near Mint",
  "Excellent",
  "Good",
  "Light Played",
  "Played",
  "Poor",
] as const;

const VARIANTS = [
  "Normal",
  "Holo",
  "Reverse Holo",
  "Full Art",
  "Alternate Art",
  "Promo",
  "Other",
] as const;

export interface AddToCollectionFormValues {
  language: OwnedCardLanguage;
  variant: (typeof VARIANTS)[number];
  condition: (typeof CONDITIONS)[number];
  quantity: number;
  purchasePrice: number | null;
  notes: string | null;
  acquisitionDate: string | null;
}

type FormField =
  | "language"
  | "variant"
  | "condition"
  | "quantity"
  | "purchasePrice"
  | "acquisitionDate";

type FormErrors = Partial<Record<FormField, string>>;

interface AddToCollectionModalProps {
  card: Card | null;
  visible: boolean;
  onClose: () => void;
  onSave: (values: AddToCollectionFormValues) => void;
}

export default function AddToCollectionModal({
  card,
  visible,
  onClose,
  onSave,
}: AddToCollectionModalProps) {
  const colors = useColors();
  const [selectedLanguage, setSelectedLanguage] =
    useState<OwnedCardLanguage | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<
    (typeof VARIANTS)[number] | null
  >(null);
  const [selectedCondition, setSelectedCondition] = useState<
    (typeof CONDITIONS)[number] | null
  >(null);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const setFieldError = (field: FormField) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = () => {
    const nextErrors: FormErrors = {};
    const parsedQuantity = Number(quantity);
    const parsedPrice = parsePurchasePrice(purchasePrice);

    if (!selectedLanguage) {
      nextErrors.language = "Choose the language printed on your card.";
    }
    if (!selectedVariant) {
      nextErrors.variant = "Choose a variant.";
    }
    if (!selectedCondition) {
      nextErrors.condition = "Choose a condition.";
    }
    if (
      !/^\d+$/.test(quantity) ||
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      nextErrors.quantity = "Enter a whole number of 1 or more.";
    }
    if (purchasePrice.trim() !== "" && parsedPrice === undefined) {
      nextErrors.purchasePrice = "Enter a valid price of 0 or more.";
    }
    if (acquisitionDate.trim() !== "" && !isValidDate(acquisitionDate.trim())) {
      nextErrors.acquisitionDate = "Use a valid date in YYYY-MM-DD format.";
    }

    setErrors(nextErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      !selectedLanguage ||
      !selectedVariant ||
      !selectedCondition ||
      parsedPrice === undefined
    ) {
      return;
    }

    Keyboard.dismiss();
    onSave({
      language: selectedLanguage,
      variant: selectedVariant,
      condition: selectedCondition,
      quantity: parsedQuantity,
      purchasePrice: parsedPrice,
      notes: notes.trim() || null,
      acquisitionDate: acquisitionDate.trim() || null,
    });
  };

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
          edges={["top", "bottom"]}
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
              onPress={() => {
                Keyboard.dismiss();
                onClose();
              }}
              style={styles.closeButton}
            >
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.formScroll}
            contentContainerStyle={styles.scrollContent}
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
                    onPress={() => {
                      setSelectedLanguage(language);
                      setFieldError("language");
                    }}
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
            <FieldError message={errors.language} />

            <Text
              style={[
                styles.sectionTitle,
                styles.groupHeading,
                { color: colors.foreground },
              ]}
            >
              Variant
            </Text>
            <View style={styles.chipGrid}>
              {VARIANTS.map((variant) => {
                const selected = selectedVariant === variant;
                return (
                  <Pressable
                    key={variant}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    testID={`owned-variant-${variant
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                    onPress={() => {
                      setSelectedVariant(variant);
                      setFieldError("variant");
                    }}
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
                      {variant}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <FieldError message={errors.variant} />

            <Text
              style={[
                styles.sectionTitle,
                styles.groupHeading,
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
                    testID={`owned-condition-${condition
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                    onPress={() => {
                      setSelectedCondition(condition);
                      setFieldError("condition");
                    }}
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
            <FieldError message={errors.condition} />

            <FormLabel label="Quantity" colors={colors} />
            <View
              style={[
                styles.quantityControl,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.quantity
                    ? colors.destructive
                    : colors.border,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
                testID="decrease-quantity"
                onPress={() => {
                  const current = Number(quantity);
                  if (quantity.trim()) {
                    setQuantity(
                      String(
                        Number.isSafeInteger(current) && current > 1
                          ? current - 1
                          : 1,
                      ),
                    );
                  }
                  setFieldError("quantity");
                }}
                style={styles.stepButton}
              >
                <Feather name="minus" size={18} color={colors.foreground} />
              </Pressable>
              <TextInput
                accessibilityLabel="Quantity"
                testID="collection-quantity"
                value={quantity}
                onChangeText={(value) => {
                  setQuantity(value);
                  setFieldError("quantity");
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="Select"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.quantityInput, { color: colors.foreground }]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
                testID="increase-quantity"
                onPress={() => {
                  const current = Number(quantity);
                  setQuantity(
                    String(
                      Number.isSafeInteger(current) && current >= 1
                        ? current + 1
                        : 1,
                    ),
                  );
                  setFieldError("quantity");
                }}
                style={styles.stepButton}
              >
                <Feather name="plus" size={18} color={colors.foreground} />
              </Pressable>
            </View>
            <FieldError message={errors.quantity} />

            <FormLabel label="Purchase price (optional)" colors={colors} />
            <TextInput
              accessibilityLabel="Purchase price"
              testID="collection-purchase-price"
              value={purchasePrice}
              onChangeText={(value) => {
                setPurchasePrice(value);
                setFieldError("purchasePrice");
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: errors.purchasePrice
                    ? colors.destructive
                    : colors.border,
                },
              ]}
            />
            <FieldError message={errors.purchasePrice} />

            <FormLabel label="Acquisition date (optional)" colors={colors} />
            <TextInput
              accessibilityLabel="Acquisition date"
              testID="collection-acquisition-date"
              value={acquisitionDate}
              onChangeText={(value) => {
                setAcquisitionDate(value);
                setFieldError("acquisitionDate");
              }}
              keyboardType="numbers-and-punctuation"
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: errors.acquisitionDate
                    ? colors.destructive
                    : colors.border,
                },
              ]}
            />
            <FieldError message={errors.acquisitionDate} />

            <FormLabel label="Notes (optional)" colors={colors} />
            <TextInput
              accessibilityLabel="Collection notes"
              testID="collection-notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={1000}
              textAlignVertical="top"
              placeholder="Add a note about this copy"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.textInput,
                styles.notesInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            />

            <Pressable
              accessibilityRole="button"
              testID="save-to-collection"
              onPress={handleSubmit}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[styles.saveLabel, { color: colors.primaryForeground }]}
              >
                Save card
              </Text>
            </Pressable>
          </KeyboardAwareScrollViewCompat>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function parsePurchasePrice(value: string): number | null | undefined {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function FormLabel({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
      {label}
    </Text>
  );
}

function FieldError({ message }: { message?: string }) {
  const colors = useColors();
  if (!message) {
    return null;
  }
  return (
    <Text
      accessibilityRole="alert"
      style={[styles.error, { color: colors.destructive }]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.68)",
  },
  sheet: {
    height: "94%",
    maxHeight: "94%",
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
  formScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 22,
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
  groupHeading: {
    marginTop: 22,
  },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 8,
  },
  textInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  notesInput: {
    minHeight: 96,
    paddingTop: 12,
  },
  quantityControl: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepButton: {
    minWidth: 50,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityInput: {
    flex: 1,
    minWidth: 50,
    paddingHorizontal: 8,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  error: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
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
