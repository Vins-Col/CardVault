import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { CollectionItem } from "@/src/models/collection-item";

interface CollectionEntryModalProps {
  item: CollectionItem | null;
  onClose: () => void;
  onSaveNotes: (notes: string) => Promise<void>;
}

export default function CollectionEntryModal({
  item,
  onClose,
  onSaveNotes,
}: CollectionEntryModalProps) {
  const colors = useColors();
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await onSaveNotes(notes);
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Notes could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={item !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {item ? (
        <SafeAreaView
          edges={["top", "bottom"]}
          style={[styles.safeArea, { backgroundColor: colors.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              Collection Entry
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close collection entry"
              testID="close-collection-entry"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {item.card.imageUrl ? (
              <Image
                accessibilityLabel={`${item.card.name} card image`}
                source={{ uri: item.card.imageUrl }}
                resizeMode="contain"
                style={styles.image}
              />
            ) : (
              <View
                style={[
                  styles.imagePlaceholder,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather
                  name="image"
                  size={34}
                  color={colors.mutedForeground}
                />
                <Text style={[styles.value, { color: colors.mutedForeground }]}>
                  Image not available
                </Text>
              </View>
            )}
            <Text style={[styles.name, { color: colors.foreground }]}>
              {item.card.name}
            </Text>
            <DetailRow label="Game" value={item.card.gameId} />
            <DetailRow
              label="Collector number"
              value={item.card.collectorNumber}
            />
            <DetailRow label="Set" value={item.card.setName} />
            <DetailRow label="Physical language" value={item.language} />
            <DetailRow label="Variant" value={item.variant ?? "Not specified"} />
            <DetailRow label="Condition" value={item.condition} />
            <DetailRow label="Quantity" value={String(item.quantity)} />
            {item.card.rarity ? (
              <DetailRow label="Rarity" value={item.card.rarity} />
            ) : null}
            {item.acquisitionDate ? (
              <DetailRow label="Acquisition date" value={item.acquisitionDate} />
            ) : null}

            <Text style={[styles.notesLabel, { color: colors.foreground }]}>
              Notes
            </Text>
            <TextInput
              accessibilityLabel="Edit collection notes"
              testID="edit-collection-notes"
              value={notes}
              onChangeText={(value) => {
                setNotes(value);
                setSaved(false);
                setError(null);
              }}
              multiline
              maxLength={1000}
              textAlignVertical="top"
              placeholder="Add a note about this copy"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.notesInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            />
            {error ? (
              <Text
                accessibilityRole="alert"
                style={[styles.feedback, { color: colors.destructive }]}
              >
                {error}
              </Text>
            ) : saved ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[styles.feedback, { color: colors.accent }]}
              >
                Notes saved.
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              testID="save-collection-notes"
              disabled={isSaving}
              onPress={() => void handleSaveNotes()}
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isSaving ? 0.7 : 1,
                },
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text
                  style={[
                    styles.saveLabel,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Save notes
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  image: {
    width: "100%",
    height: 270,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 180,
    height: 245,
    borderWidth: 1,
    borderRadius: 18,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 18,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 16,
  },
  detailRow: {
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  value: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    textAlign: "right",
    flexShrink: 1,
  },
  notesLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginTop: 20,
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingTop: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  feedback: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 8,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  saveLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
