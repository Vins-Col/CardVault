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
import CollectionEntryModal from "@/src/features/collection/CollectionEntryModal";
import type { CollectionItem } from "@/src/models/collection-item";
import { collectionRepository } from "@/src/repositories/repository-registry";

export default function CollectionScreen() {
  const colors = useColors();
  const [items, setItems] = useState<readonly CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState(false);

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
                : "The collection could not be loaded.",
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

  const updateItem = (updated: CollectionItem) => {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelectedItem((current) =>
      current?.id === updated.id ? updated : current,
    );
  };

  const changeQuantity = async (
    item: CollectionItem,
    direction: "increase" | "decrease",
  ) => {
    if (busyId) {
      return;
    }
    setBusyId(item.id);
    setActionMessage(null);
    try {
      const updated =
        direction === "increase"
          ? await collectionRepository.incrementQuantity(item.id)
          : await collectionRepository.decrementQuantity(item.id);
      updateItem(updated);
      setActionError(false);
    } catch (changeError) {
      setActionMessage(
        changeError instanceof Error
          ? changeError.message
          : "Quantity could not be changed.",
      );
      setActionError(true);
    } finally {
      setBusyId(null);
    }
  };

  const saveNotes = async (notes: string) => {
    if (!selectedItem) {
      throw new Error("The collection entry could not be found.");
    }
    const updated = await collectionRepository.update({
      ...selectedItem,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
    });
    updateItem(updated);
  };

  const deleteItem = async (item: CollectionItem) => {
    setBusyId(item.id);
    setActionMessage(null);
    try {
      await collectionRepository.remove(item.id);
      setItems((current) => current.filter((saved) => saved.id !== item.id));
      setSelectedItem((current) => (current?.id === item.id ? null : current));
      setActionMessage(`${item.card.name} removed from Collection.`);
      setActionError(false);
    } catch (deleteError) {
      setActionMessage(
        deleteError instanceof Error
          ? deleteError.message
          : "The collection entry could not be deleted.",
      );
      setActionError(true);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (item: CollectionItem) => {
    Alert.alert(
      "Delete collection entry?",
      `${item.card.name} will be removed from this device.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteItem(item),
        },
      ],
    );
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
            Loading your collection…
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
            Collection unavailable
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

  if (items.length === 0) {
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
            Collection
          </Text>
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Keep the cards you own organized in one place.
          </Text>
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Your collection is empty
            </Text>
            <Text
              style={[styles.statusText, { color: colors.mutedForeground }]}
            >
              Cards you add from Search will be organized here.
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
          Collection
        </Text>
        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          {items.length} {items.length === 1 ? "saved card" : "saved cards"}
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
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CardInfoCard
              card={item.card}
              ownedLanguage={item.language}
              variant={item.variant}
              quantity={item.quantity}
              condition={item.condition}
              actions={
                <View style={styles.actions}>
                  <CollectionAction
                    icon="folder"
                    label="Open"
                    testID={`open-entry-${item.id}`}
                    onPress={() => setSelectedItem(item)}
                  />
                  <View
                    style={[
                      styles.quantityActions,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Decrease ${item.card.name} quantity`}
                      testID={`decrease-entry-${item.id}`}
                      disabled={item.quantity <= 1 || busyId !== null}
                      onPress={() => void changeQuantity(item, "decrease")}
                      style={styles.quantityButton}
                    >
                      <Feather
                        name="minus"
                        size={15}
                        color={
                          item.quantity <= 1
                            ? colors.mutedForeground
                            : colors.foreground
                        }
                      />
                    </Pressable>
                    <Text
                      accessibilityLabel={`Quantity ${item.quantity}`}
                      style={[
                        styles.quantityValue,
                        { color: colors.foreground },
                      ]}
                    >
                      {item.quantity}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Increase ${item.card.name} quantity`}
                      testID={`increase-entry-${item.id}`}
                      disabled={busyId !== null}
                      onPress={() => void changeQuantity(item, "increase")}
                      style={styles.quantityButton}
                    >
                      <Feather
                        name="plus"
                        size={15}
                        color={colors.foreground}
                      />
                    </Pressable>
                  </View>
                  <CollectionAction
                    icon="edit-3"
                    label="Notes"
                    testID={`edit-notes-${item.id}`}
                    onPress={() => setSelectedItem(item)}
                  />
                  <CollectionAction
                    icon="trash-2"
                    label="Delete"
                    testID={`delete-entry-${item.id}`}
                    disabled={busyId !== null}
                    onPress={() => confirmDelete(item)}
                  />
                </View>
              }
            />
          )}
        />
      </View>
      <CollectionEntryModal
        key={selectedItem?.id ?? "closed-collection-entry"}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSaveNotes={saveNotes}
      />
    </SafeAreaView>
  );
}

function CollectionAction({
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
      <Feather name={icon} size={15} color={colors.primary} />
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
    gap: 3,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  actionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    textAlign: "center",
  },
  quantityActions: {
    flex: 1.35,
    minHeight: 42,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityButton: {
    minWidth: 28,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    minWidth: 16,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textAlign: "center",
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
