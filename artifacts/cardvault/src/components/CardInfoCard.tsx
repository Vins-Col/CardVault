import React, { useState, type ReactNode } from "react";
import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Card } from "@/src/models/card";

interface CardInfoCardProps {
  card: Card;
  ownedLanguage?: string;
  variant?: string | null;
  quantity?: number;
  condition?: string;
  actions?: ReactNode;
}

export default function CardInfoCard({
  card,
  ownedLanguage,
  variant,
  quantity,
  condition,
  actions,
}: CardInfoCardProps) {
  const colors = useColors();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.main}>
        <View
          style={[styles.imageFrame, { backgroundColor: colors.secondary }]}
        >
          {card.imageUrl && !imageFailed ? (
            <Image
              accessibilityLabel={`${card.name} card image`}
              source={{ uri: card.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Feather name="image" size={24} color={colors.mutedForeground} />
          )}
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {card.name}
          </Text>
          <Text style={[styles.metadata, { color: colors.mutedForeground }]}>
            #{card.collectorNumber} · {card.setName}
          </Text>
          <Text style={[styles.metadata, { color: colors.mutedForeground }]}>
            {card.rarity ?? "Rarity not listed"} · Catalog: {card.language}
          </Text>
          {ownedLanguage ? (
            <Text style={[styles.metadata, { color: colors.accent }]}>
              Owned language: {ownedLanguage}
              {quantity ? ` · Qty ${quantity}` : ""}
            </Text>
          ) : null}
          {variant ? (
            <Text style={[styles.metadata, { color: colors.mutedForeground }]}>
              Variant: {variant}
            </Text>
          ) : null}
          {condition ? (
            <Text style={[styles.metadata, { color: colors.mutedForeground }]}>
              Condition: {condition}
            </Text>
          ) : null}
        </View>
      </View>
      {actions ? (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          {actions}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  main: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  imageFrame: {
    width: 70,
    height: 96,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  details: {
    flex: 1,
    minHeight: 96,
    justifyContent: "center",
    gap: 5,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  metadata: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 10,
    flexDirection: "row",
    gap: 6,
  },
});
