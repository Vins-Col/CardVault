import React, { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { CollectionItem } from "@/src/models/collection-item";
import {
  collectionRepository,
  wishlistRepository,
} from "@/src/repositories/repository-registry";
import { calculateCollectionValuation } from "@/src/utils/valuation";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [collectionItems, setCollectionItems] = useState<readonly CollectionItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      setError(null);

      Promise.all([
        collectionRepository.getAll(),
        wishlistRepository.getAll(),
      ])
        .then(([items, wishlistCards]) => {
          if (isActive) {
            setCollectionItems(items);
            setWishlistCount(wishlistCards.length);
          }
        })
        .catch((loadError: unknown) => {
          if (isActive) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Dashboard data could not be loaded.",
            );
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Loading your dashboard…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Dashboard unavailable
          </Text>
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const valuation = calculateCollectionValuation(collectionItems);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          Platform.OS === "web" ? styles.webTopInset : undefined,
        ]}
      >
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Dashboard
        </Text>
        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          Summary of your collection and vault.
        </Text>

        <View
          style={[
            styles.valuationCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.valuationHeader}>
            <View>
              <Text style={[styles.valuationLabel, { color: colors.mutedForeground }]}>
                Collection Value
              </Text>
              <Text style={[styles.valuationTotal, { color: colors.foreground }]}>
                € {valuation.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.valuationBadge, { backgroundColor: colors.secondary }]}>
              <Feather name="trending-up" size={16} color={colors.accent} />
            </View>
          </View>

          <View style={[styles.valuationDivider, { backgroundColor: colors.border }]} />

          <View style={styles.valuationGrid}>
            <View style={styles.valuationMetric}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Total Cards
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>
                {valuation.totalCards}
              </Text>
            </View>
            <View style={styles.valuationMetric}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Average Card
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>
                € {valuation.averageCardValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
              <Feather name="award" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.infoCardLabel, { color: colors.mutedForeground }]}>
              Most Valuable Card
            </Text>
            <Text numberOfLines={1} style={[styles.infoCardTitle, { color: colors.foreground }]}>
              {valuation.mostValuableCard ? valuation.mostValuableCard.name : "None"}
            </Text>
            <Text style={[styles.infoCardSubTitle, { color: colors.mutedForeground }]}>
              {valuation.mostValuableCard
                ? `€ ${valuation.mostValuableCard.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "€ 0.00"}
            </Text>
          </View>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
              <Feather name="heart" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.infoCardLabel, { color: colors.mutedForeground }]}>
              Wishlist Items
            </Text>
            <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
              {wishlistCount}
            </Text>
            <Text style={[styles.infoCardSubTitle, { color: colors.mutedForeground }]}>
              Saved to wishlist
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View collection statistics"
          onPress={() => router.push("/statistics")}
          style={({ pressed }) => [
            styles.statsBanner,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.secondary, marginBottom: 0 }]}>
            <Feather name="bar-chart-2" size={18} color={colors.primary} />
          </View>
          <View style={styles.statsBannerText}>
            <Text style={[styles.statsBannerTitle, { color: colors.foreground }]}>
              Collection Statistics
            </Text>
            <Text style={[styles.statsBannerSub, { color: colors.mutedForeground }]}>
              Set breakdowns, language, and rarity insights
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  webTopInset: {
    paddingTop: 67,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 34,
  },
  statusText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  valuationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  valuationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valuationLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  valuationTotal: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 32,
    marginTop: 2,
  },
  valuationBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  valuationDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  valuationGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  valuationMetric: {
    flex: 1,
  },
  metricLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  metricValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  infoCardLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  infoCardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 4,
  },
  infoCardSubTitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  statsBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statsBannerText: {
    flex: 1,
  },
  statsBannerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  statsBannerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
});
