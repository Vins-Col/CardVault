import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import {
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
import type { OcrExtractionResult } from "@/src/services/ocr-service";
import { constructSearchQuery } from "@/src/services/ocr-service";

interface OcrConfirmationModalProps {
  imageUri: string | null;
  extracted: OcrExtractionResult | null;
  onClose: () => void;
  onConfirmSearch: (searchQuery: string) => void;
}

export default function OcrConfirmationModal({
  imageUri,
  extracted,
  onClose,
  onConfirmSearch,
}: OcrConfirmationModalProps) {
  const colors = useColors();
  const [name, setName] = useState(extracted?.name ?? "");
  const [setCode, setSetCode] = useState(extracted?.setCode ?? "");
  const [collectorNumber, setCollectorNumber] = useState(
    extracted?.collectorNumber ?? "",
  );

  useEffect(() => {
    if (extracted) {
      setName(extracted.name);
      setSetCode(extracted.setCode);
      setCollectorNumber(extracted.collectorNumber);
    }
  }, [extracted]);

  const isLowConfidence = extracted?.confidence === "low";

  const handleSearch = () => {
    const query = constructSearchQuery(name, setCode, collectorNumber);
    if (!query) {
      return;
    }
    onConfirmSearch(query);
  };

  return (
    <Modal
      visible={extracted !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {extracted ? (
        <SafeAreaView
          edges={["top", "bottom"]}
          style={[styles.safeArea, { backgroundColor: colors.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              Scanned Card Details
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close OCR confirmation"
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
            {imageUri ? (
              <Image
                accessibilityLabel="Scanned card preview"
                source={{ uri: imageUri }}
                resizeMode="contain"
                style={styles.image}
              />
            ) : null}

            {isLowConfidence ? (
              <View
                style={[
                  styles.warningBox,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Feather name="alert-triangle" size={18} color={colors.accent} />
                <Text style={[styles.warningText, { color: colors.foreground }]}>
                  OCR confidence is low. Please review and edit the extracted details before searching.
                </Text>
              </View>
            ) : null}

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              Card Name
            </Text>
            <TextInput
              accessibilityLabel="Card Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Pikachu ex"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              Set Code
            </Text>
            <TextInput
              accessibilityLabel="Set Code"
              value={setCode}
              onChangeText={setSetCode}
              placeholder="e.g. WCS23"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              Collector Number
            </Text>
            <TextInput
              accessibilityLabel="Collector Number"
              value={collectorNumber}
              onChangeText={setCollectorNumber}
              placeholder="e.g. 001/030"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search card"
              onPress={handleSearch}
              style={[
                styles.searchButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Feather name="search" size={18} color={colors.primaryForeground} />
              <Text
                style={[
                  styles.searchButtonLabel,
                  { color: colors.primaryForeground },
                ]}
              >
                Search Card
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
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
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: 16,
    borderRadius: 12,
  },
  warningBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  warningText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  inputLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  searchButton: {
    minHeight: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 24,
  },
  searchButtonLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
