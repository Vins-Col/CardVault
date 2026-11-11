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
import type { Card } from "@/src/models/card";
import type { CollectionItem } from "@/src/models/collection-item";
import {
  collectionRepository,
  wishlistRepository,
} from "@/src/repositories/repository-registry";
import { calculateCollectionValuation, calculateWishlistValuation } from "@/src/utils/valuation";
import { AppCard } from "@/src/components/ui/AppCard";
import { StatCard } from "@/src/components/ui/StatCard";
import { SectionTitle } from "@/src/components/ui/SectionTitle";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [collectionItems, setCollectionItems] = useState<readonly CollectionItem[]>([]);
  const [wishlistCards, setWishlistCards] = useState<readonly Card[]>([]);
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
        .then(([items, wishlist]) => {
          if (isActive) {
            setCollectionItems(items);
            setWishlistCards(wishlist);
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
  const wishlistValuation = calculateWishlistValuation(wishlistCards);
  const recentItems = [...collectionItems].reverse().slice(0, 5);

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

        <AppCard style={{ marginTop: spacing.md, marginBottom: spacing.md, padding: spacing.lg, borderRadius: 16 }}>
          <View style={styles.valuationHeader}>
            <View>
              <Text style={[styles.valuationLabel, { color: colors.mutedForeground, fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm }]}>
                Collection Value
              </Text>
              <Text style={[styles.valuationTotal, { color: colors.foreground, fontFamily: typography.fonts.bold, fontSize: 26 }]}>
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
              <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs }]}>
                Total Cards
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground, fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.md }]}>
                {valuation.totalCards}
              </Text>
            </View>
            <View style={styles.valuationMetric}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs }]}>
                Average Card
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground, fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.md }]}>
                € {valuation.averageCardValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </AppCard>

        <AppCard style={{ marginTop: 0, marginBottom: spacing.md, padding: spacing.lg, borderRadius: 16 }}>
          <View style={styles.valuationHeader}>
            <View>
              <Text style={[styles.valuationLabel, { color: colors.mutedForeground, fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm }]}>
                Wishlist Value
              </Text>
              <Text style={[styles.valuationTotal, { color: colors.foreground, fontFamily: typography.fonts.bold, fontSize: 26 }]}>
                € {wishlistValuation.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.valuationBadge, { backgroundColor: colors.secondary }]}>
              <Feather name="bookmark" size={16} color={colors.primary} />
            </View>
          </View>

          <View style={[styles.valuationDivider, { backgroundColor: colors.border }]} />

          <View style={styles.valuationGrid}>
            <View style={styles.valuationMetric}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs }]}>
                Wishlist Items
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground, fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.md }]}>
                {wishlistValuation.totalCards}
              </Text>
            </View>
            <View style={styles.valuationMetric}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs }]}>
                Average Wishlist Card
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground, fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.md }]}>
                € {wishlistValuation.averageCardValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </AppCard>

        <StatCard
          label="Most Valuable Card"
          value={valuation.mostValuableCard ? valuation.mostValuableCard.name : "None"}
          subtext={
            valuation.mostValuableCard
              ? `€ ${valuation.mostValuableCard.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "€ 0.00"
          }
          style={{ borderRadius: 16, padding: spacing.lg, marginBottom: spacing.md }}
        />

        <SectionTitle>Recent Additions</SectionTitle>
        <AppCard style={{ borderRadius: 16, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginBottom: spacing.md }}>
          {recentItems.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground, paddingVertical: 12, textAlign: "center" }]}>
              No collection items added yet.
            </Text>
          ) : (
            recentItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.recentRow,
                  index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <View style={styles.recentRowLeft}>
                  <Text style={[styles.recentName, { color: colors.foreground, fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.sm }]}>
                    {item.card.name}
                  </Text>
                  <Text style={[styles.recentSub, { color: colors.mutedForeground, fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs }]}>
                    {item.card.setName}
                  </Text>
                </View>
                {item.quantity > 1 ? (
                  <View style={[styles.recentBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.recentBadgeText, { color: colors.primary, fontFamily: typography.fonts.medium, fontSize: typography.sizes.xs }]}>
                      x{item.quantity}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </AppCard>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View collection statistics"
          onPress={() => router.push("/statistics")}
          style={({ pressed }) => [
            styles.statsBanner,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 16,
              padding: spacing.lg,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.secondary, marginBottom: 0 }]}>
            <Feather name="bar-chart-2" size={18} color={colors.primary} />
          </View>
          <View style={styles.statsBannerText}>
            <Text style={[styles.statsBannerTitle, { color: colors.foreground, fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.lg }]}>
              Collection Statistics
            </Text>
            <Text style={[styles.statsBannerSub, { color: colors.mutedForeground, fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs }]}>
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
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  recentRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  recentName: {
    fontSize: 14,
  },
  recentSub: {
    fontSize: 12,
    marginTop: 2,
  },
  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentBadgeText: {
    fontSize: 12,
  },
});
