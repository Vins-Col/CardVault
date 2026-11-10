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
import { collectionRepository } from "@/src/repositories/repository-registry";
import { calculateCollectionStatistics } from "@/src/utils/statistics";

export default function StatisticsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [items, setItems] = useState<readonly CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      setError(null);

      collectionRepository
        .getAll()
        .then((savedItems) => {
          if (isActive) {
            setItems(savedItems);
          }
        })
        .catch((loadError: unknown) => {
          if (isActive) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Statistics could not be loaded.",
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
        edges={["top", "bottom"]}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Analyzing your collection…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Statistics unavailable
          </Text>
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = calculateCollectionStatistics(items);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Collection Statistics
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          Platform.OS === "web" ? styles.webTopInset : undefined,
        ]}
      >
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Insights & Breakdown
        </Text>
        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          Analyzed across {stats.totalCards} total saved cards.
        </Text>

        {/* Summary Insights */}
        <View style={styles.insightsRow}>
          <View
            style={[
              styles.insightCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="layers" size={18} color={colors.primary} style={styles.insightIcon} />
            <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>
              Most Collected Set
            </Text>
            <Text numberOfLines={1} style={[styles.insightValue, { color: colors.foreground }]}>
              {stats.mostCollectedSet ? stats.mostCollectedSet.name : "None"}
            </Text>
            <Text style={[styles.insightSub, { color: colors.mutedForeground }]}>
              {stats.mostCollectedSet ? `${stats.mostCollectedSet.count} cards` : ""}
            </Text>
          </View>

          <View
            style={[
              styles.insightCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="globe" size={18} color={colors.accent} style={styles.insightIcon} />
            <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>
              Common Language
            </Text>
            <Text numberOfLines={1} style={[styles.insightValue, { color: colors.foreground }]}>
              {stats.mostCommonLanguage ? stats.mostCommonLanguage.language : "None"}
            </Text>
            <Text style={[styles.insightSub, { color: colors.mutedForeground }]}>
              {stats.mostCommonLanguage ? `${stats.mostCommonLanguage.count} cards` : ""}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.insightCardFull,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="trending-up" size={18} color={colors.accent} style={styles.insightIcon} />
          <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>
            Most Valuable Set
          </Text>
          <Text numberOfLines={1} style={[styles.insightValue, { color: colors.foreground }]}>
            {stats.mostValuableSet ? stats.mostValuableSet.name : "None"}
          </Text>
          <Text style={[styles.insightSub, { color: colors.foreground }]}>
            {stats.mostValuableSet
              ? `€ ${stats.mostValuableSet.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "€ 0.00"}
          </Text>
        </View>

        {/* Top Sets */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Top Sets (Top 10)
          </Text>
        </View>
        <View
          style={[
            styles.tableCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {stats.topSets.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No sets recorded yet.
            </Text>
          ) : (
            stats.topSets.map((s, index) => (
              <View
                key={s.setId}
                style={[
                  styles.tableRow,
                  index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <View style={styles.tableRowLeft}>
                  <Text style={[styles.tableName, { color: colors.foreground }]}>
                    {s.setName}
                  </Text>
                  <Text style={[styles.tableSub, { color: colors.mutedForeground }]}>
                    {s.count} {s.count === 1 ? "card" : "cards"}
                  </Text>
                </View>
                <Text style={[styles.tableVal, { color: colors.foreground }]}>
                  € {s.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Cards by Language */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Cards by Language
          </Text>
        </View>
        <View
          style={[
            styles.tableCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {Object.keys(stats.byLanguage).length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No language data recorded.
            </Text>
          ) : (
            Object.entries(stats.byLanguage).map(([lang, count], index) => (
              <View
                key={lang}
                style={[
                  styles.tableRow,
                  index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <Text style={[styles.tableName, { color: colors.foreground }]}>
                  {lang}
                </Text>
                <Text style={[styles.tableVal, { color: colors.mutedForeground }]}>
                  {count} {count === 1 ? "card" : "cards"}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Cards by Rarity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Cards by Rarity
          </Text>
        </View>
        <View
          style={[
            styles.tableCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {Object.keys(stats.byRarity).length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No rarity data recorded.
            </Text>
          ) : (
            Object.entries(stats.byRarity).map(([rarity, count], index) => (
              <View
                key={rarity}
                style={[
                  styles.tableRow,
                  index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <Text style={[styles.tableName, { color: colors.foreground }]}>
                  {rarity}
                </Text>
                <Text style={[styles.tableVal, { color: colors.mutedForeground }]}>
                  {count} {count === 1 ? "card" : "cards"}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  webTopInset: {
    paddingTop: 20,
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
    marginTop: 4,
    marginBottom: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  insightsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  insightCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  insightCardFull: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  insightIcon: {
    marginBottom: 10,
  },
  insightLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  insightValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginTop: 4,
  },
  insightSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },
  tableCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  tableRowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  tableName: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  tableSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  tableVal: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 16,
    textAlign: "center",
  },
});
