import React from "react";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { Card } from "@/src/models/card";

interface CardDetailsModalProps {
  card: Card | null;
  onClose: () => void;
}

export default function CardDetailsModal({
  card,
  onClose,
}: CardDetailsModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={card !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {card ? (
        <SafeAreaView
          edges={["top", "bottom"]}
          style={[styles.safeArea, { backgroundColor: colors.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              Card Details
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close card details"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {card.imageUrl ? (
              <Image
                accessibilityLabel={`${card.name} card image`}
                source={{ uri: card.imageUrl }}
                resizeMode="contain"
                style={styles.image}
              />
            ) : (
              <View
                style={[
                  styles.imagePlaceholder,
                  { backgroundColor: colors.card },
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
              {card.name}
            </Text>
            <DetailRow label="Collector number" value={card.collectorNumber} />
            <DetailRow label="Set" value={card.setName} />
            <DetailRow label="Set code" value={card.setId} />
            <DetailRow label="Rarity" value={card.rarity ?? "Not listed"} />
            <DetailRow label="Catalog language" value={card.language} />
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
    height: 280,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 180,
    height: 245,
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
});
