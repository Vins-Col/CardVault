import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import CardInfoCard from "@/src/components/CardInfoCard";
import type { Card } from "@/src/models/card";
import type { CollectionItem } from "@/src/models/collection-item";
import { isSamePhysicalConfiguration } from "@/src/features/collection/collection-matching";
import {
  collectionRepository,
  wishlistRepository,
} from "@/src/repositories/repository-registry";

export default function WishlistScreen() {
  const colors = useColors();
  const [cards, setCards] = useState<readonly Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      setError(null);

      wishlistRepository
        .getAll()
        .then((savedCards) => {
          if (isActive) {
            setCards(savedCards);
          }
        })
        .catch((loadError: unknown) => {
          if (isActive) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : "The wishlist could not be loaded.",
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
    }, [reloadKey]),
  );

  const removeFromWishlist = async (card: Card) => {
    setBusyId(card.id);
    setActionMessage(null);
    try {
      await wishlistRepository.remove(card.id);
      setCards((current: readonly Card[]) =>
        current.filter((c: Card) => c.id !== card.id),
      );
      setActionMessage(`${card.name} removed from Wishlist.`);
      setActionError(false);
    } catch (e) {
      setActionMessage(
        e instanceof Error ? e.message : "The card could not be removed.",
      );
      setActionError(true);
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemove = (card: Card) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Remove from Wishlist?\n\n${card.name} will be removed from your wishlist.`,
        )
      ) {
        void removeFromWishlist(card);
      }
      return;
    }
    Alert.alert(
      "Remove from Wishlist?",
      `${card.name} will be removed from your wishlist.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => void removeFromWishlist(card),
        },
      ],
    );
  };

  const moveToCollection = async (card: Card) => {
    setBusyId(card.id);
    setActionMessage(null);
    try {
      const now = new Date().toISOString();
      const item: CollectionItem = {
        id: `collection-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        card,
        quantity: 1,
        condition: "Near Mint",
        language: card.language,
        variant: card.variant,
        purchasePrice: null,
        currentEstimatedPrice: null,
        notes: null,
        acquisitionDate: null,
        createdAt: now,
        updatedAt: now,
      };

      // Check for duplicates using the existing logic
      const allItems = await collectionRepository.getAll();
      const match = allItems.find((existing: CollectionItem) =>
        isSamePhysicalConfiguration(existing, item),
      );

      if (match) {
        await collectionRepository.incrementQuantity(match.id, 1);
      } else {
        await collectionRepository.add(item);
      }

      // Remove from wishlist after successful add/update to collection
      await wishlistRepository.remove(card.id);
      setCards((current: readonly Card[]) =>
        current.filter((c: Card) => c.id !== card.id),
      );

      setActionMessage(`${card.name} moved to Collection.`);
      setActionError(false);
    } catch (e) {
      setActionMessage(
        e instanceof Error ? e.message : "The card could not be moved.",
      );
      setActionError(true);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Loading your wishlist…
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
            Wishlist unavailable
          </Text>
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setReloadKey((key) => key + 1)}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text
              style={[styles.retryLabel, { color: colors.primaryForeground }]}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.emptyContent,
            Platform.OS === "web" ? styles.webTopInset : undefined,
          ]}
        >
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Wishlist
          </Text>
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Keep track of cards you hope to collect.
          </Text>
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Your wishlist is empty
            </Text>
            <Text
              style={[styles.statusText, { color: colors.mutedForeground }]}
            >
              Cards you save from Search will appear here.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.content,
          Platform.OS === "web" ? styles.webTopInset : undefined,
        ]}
      >
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Wishlist
        </Text>
        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          {cards.length} {cards.length === 1 ? "saved card" : "saved cards"}
        </Text>
        {actionMessage ? (
          <Text
            accessibilityLiveRegion={actionError ? "assertive" : "polite"}
            style={[
              styles.actionMessage,
              { color: actionError ? colors.destructive : colors.accent },
            ]}
          >
            {actionMessage}
          </Text>
        ) : null}
        <FlatList
          data={cards}
          keyExtractor={(card) => card.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CardInfoCard
              card={item}
              actions={
                <View style={styles.actions}>
                  <WishlistAction
                    icon="plus-circle"
                    label="Collect"
                    testID={`collect-card-${item.id}`}
                    disabled={busyId !== null}
                    onPress={() => void moveToCollection(item)}
                  />
                  <WishlistAction
                    icon="trash-2"
                    label="Remove"
                    testID={`remove-card-${item.id}`}
                    disabled={busyId !== null}
                    onPress={() => confirmRemove(item)}
                  />
                </View>
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function WishlistAction({
  icon,
  label,
  testID,
  disabled = false,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  testID: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: pressed ? colors.secondary : "transparent",
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Feather name={icon} size={16} color={colors.primary} />
      <Text style={[styles.actionLabel, { color: colors.secondaryForeground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
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
  list: {
    paddingTop: 18,
    paddingBottom: 20,
  },
  actionMessage: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  retryButton: {
    minWidth: 120,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  retryLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
});
