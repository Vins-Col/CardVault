import React, { useState } from "react";
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
import { AppCard } from "@/src/components/ui/AppCard";
import { SectionTitle } from "@/src/components/ui/SectionTitle";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { spacing } from "@/src/theme/spacing";

export interface WishlistActionResult {
  message: string;
  error: boolean;
}

interface CardDetailsModalProps {
  card: Card | null;
  onClose: () => void;
  onAddToWishlist: (card: Card) => Promise<WishlistActionResult>;
}

export default function CardDetailsModal({
  card,
  onClose,
  onAddToWishlist,
}: CardDetailsModalProps) {
  const colors = useColors();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [wishlistResult, setWishlistResult] =
    useState<WishlistActionResult | null>(null);

  const handleAddToWishlist = async () => {
    if (!card || isAddingToWishlist) {
      return;
    }
    setIsAddingToWishlist(true);
    setWishlistResult(null);
    try {
      setWishlistResult(await onAddToWishlist(card));
    } catch (error) {
      setWishlistResult({
        message:
          error instanceof Error
            ? error.message
            : "The card could not be added to Wishlist.",
        error: true,
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

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
                  { backgroundColor: colors.card, borderRadius: colors.radius },
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
            {card.cardmarketPrices || card.tcgplayerPrices ? (
              <View style={styles.pricingSection}>
                <SectionTitle>Pricing</SectionTitle>
                {card.cardmarketPrices && (
                  <AppCard style={{ borderRadius: colors.radius, padding: spacing.md, gap: spacing.xs }}>
                    <Text style={[styles.priceSourceHeader, { color: colors.foreground }]}>
                      Cardmarket (EUR)
                    </Text>
                    {card.cardmarketPrices.trendPrice != null && (
                      <DetailRow label="Trend Price" value={`€${card.cardmarketPrices.trendPrice.toFixed(2)}`} />
                    )}
                    {card.cardmarketPrices.averageSellPrice != null && (
                      <DetailRow label="Average Sell Price" value={`€${card.cardmarketPrices.averageSellPrice.toFixed(2)}`} />
                    )}
                    {card.cardmarketPrices.lowPrice != null && (
                      <DetailRow label="Low Price" value={`€${card.cardmarketPrices.lowPrice.toFixed(2)}`} />
                    )}
                  </AppCard>
                )}
                {card.tcgplayerPrices && (
                  <AppCard style={{ borderRadius: colors.radius, padding: spacing.md, gap: spacing.xs }}>
                    <Text style={[styles.priceSourceHeader, { color: colors.foreground }]}>
                      TCGPlayer (USD)
                    </Text>
                    {card.tcgplayerPrices.market != null && (
                      <DetailRow label="Market Price" value={`$${card.tcgplayerPrices.market.toFixed(2)}`} />
                    )}
                    {card.tcgplayerPrices.low != null && (
                      <DetailRow label="Low Price" value={`$${card.tcgplayerPrices.low.toFixed(2)}`} />
                    )}
                    {card.tcgplayerPrices.mid != null && (
                      <DetailRow label="Mid Price" value={`$${card.tcgplayerPrices.mid.toFixed(2)}`} />
                    )}
                  </AppCard>
                )}
              </View>
            ) : null}
            {wishlistResult ? (
              <Text
                accessibilityLiveRegion={
                  wishlistResult.error ? "assertive" : "polite"
                }
                style={[
                  styles.wishlistFeedback,
                  {
                    color: wishlistResult.error
                      ? colors.destructive
                      : colors.accent,
                  },
                ]}
              >
                {wishlistResult.message}
              </Text>
            ) : null}
            <PrimaryButton
              title="Add to Wishlist"
              disabled={isAddingToWishlist}
              onPress={() => void handleAddToWishlist()}
              testID="details-add-to-wishlist"
              style={{ marginTop: spacing.md }}
            />
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
  wishlistFeedback: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16,
  },
  wishlistButton: {
    minHeight: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 14,
  },
  wishlistButtonLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  pricingSection: {
    marginTop: 20,
    gap: 12,
  },
  pricingSectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginBottom: 4,
  },
  priceCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  priceSourceHeader: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 8,
  },
});
