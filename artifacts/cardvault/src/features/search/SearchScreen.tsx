import React, { useEffect, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import CardInfoCard from "@/src/components/CardInfoCard";
import type { Card } from "@/src/models/card";
import type { CollectionItem } from "@/src/models/collection-item";
import type { CardCatalogSearchField } from "@/src/providers/card-catalog-provider";
import { getDefaultCardCatalogProvider } from "@/src/providers/catalog-registry";
import { wishlistRepository } from "@/src/repositories/repository-registry";
import AddToCollectionModal from "@/src/features/search/AddToCollectionModal";
import type { AddToCollectionFormValues } from "@/src/features/search/AddToCollectionModal";
import CardDetailsModal from "@/src/features/search/CardDetailsModal";

const SEARCH_FIELDS: {
  value: CardCatalogSearchField;
  label: string;
  placeholder: string;
}[] = [
  { value: "name", label: "Name", placeholder: "Search a card name" },
  {
    value: "collectorNumber",
    label: "Number",
    placeholder: "Search a collector number",
  },
  { value: "setName", label: "Set name", placeholder: "Search a set name" },
  { value: "setCode", label: "Set code", placeholder: "Search a set code" },
  { value: "rarity", label: "Rarity", placeholder: "Search a rarity" },
];

const catalogProvider = getDefaultCardCatalogProvider();
const catalogLanguages = catalogProvider.getSupportedLanguages();

function createEntryId(): string {
  return `collection-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] =
    useState<CardCatalogSearchField>("name");
  const [catalogLanguage, setCatalogLanguage] = useState(
    catalogLanguages[0]?.code ?? "",
  );
  const [results, setResults] = useState<readonly Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const requestId = useRef(0);

  const [detailsCard, setDetailsCard] = useState<Card | null>(null);
  const [collectionCard, setCollectionCard] = useState<Card | null>(null);
  const [sessionCollectionItems, setSessionCollectionItems] = useState<
    CollectionItem[]
  >([]);
  const [savingWishlistId, setSavingWishlistId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 || !catalogLanguage) {
      requestId.current += 1;
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setSearchError(null);
      return;
    }

    setResults([]);
    setIsLoading(false);
    setHasSearched(false);
    setSearchError(null);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const currentRequest = ++requestId.current;
      setIsLoading(true);

      try {
        const cards = await catalogProvider.searchCards(term, {
          field: searchField,
          catalogLanguage,
          signal: controller.signal,
        });
        if (currentRequest === requestId.current) {
          setResults(cards);
          setHasSearched(true);
        }
      } catch (error) {
        if (
          !controller.signal.aborted &&
          currentRequest === requestId.current
        ) {
          setSearchError(
            error instanceof Error
              ? error.message
              : "The card catalog could not be reached.",
          );
          setHasSearched(true);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
      requestId.current += 1;
    };
  }, [catalogLanguage, query, retryCount, searchField]);

  const activeField =
    SEARCH_FIELDS.find((field) => field.value === searchField) ??
    SEARCH_FIELDS[0];
  const selectedCatalogLanguage =
    catalogLanguages.find((language) => language.code === catalogLanguage)
      ?.label ?? "Unknown";

  const closeCollectionModal = () => {
    setCollectionCard(null);
  };

  const handleSaveToCollection = (values: AddToCollectionFormValues) => {
    if (!collectionCard) {
      return;
    }

    const now = new Date().toISOString();
    const item: CollectionItem = {
      id: createEntryId(),
      card: collectionCard,
      quantity: values.quantity,
      condition: values.condition,
      language: values.language,
      variant: values.variant,
      purchasePrice: values.purchasePrice,
      currentEstimatedPrice: null,
      notes: values.notes,
      acquisitionDate: values.acquisitionDate,
      createdAt: now,
      updatedAt: now,
    };
    setSessionCollectionItems((items) => [...items, item]);
    setActionMessage(
      `${item.card.name} added to this session's collection (${sessionCollectionItems.length + 1} saved). It won't persist after closing the app.`,
    );
    setActionError(false);
    closeCollectionModal();
  };

  const handleAddToWishlist = async (card: Card) => {
    setSavingWishlistId(card.id);
    setActionMessage(null);
    try {
      const added = await wishlistRepository.add(card);
      setActionMessage(
        added
          ? `${card.name} added to Wishlist.`
          : `${card.name} is already in Wishlist.`,
      );
      setActionError(false);
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "The card could not be added to Wishlist.",
      );
      setActionError(true);
    } finally {
      setSavingWishlistId(null);
    }
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.stateTitle, { color: colors.foreground }]}>
            Searching the catalog
          </Text>
          <Text style={[styles.stateBody, { color: colors.mutedForeground }]}>
            Looking for {query.trim()}…
          </Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View
          accessibilityRole="summary"
          style={[
            styles.state,
            styles.errorState,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Feather name="alert-circle" size={28} color={colors.destructive} />
          <Text style={[styles.stateTitle, { color: colors.foreground }]}>
            Could not load cards
          </Text>
          <Text style={[styles.stateBody, { color: colors.mutedForeground }]}>
            {searchError}
          </Text>
          <Pressable
            accessibilityRole="button"
            testID="retry-search"
            onPress={() => setRetryCount((count) => count + 1)}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text
              style={[styles.retryLabel, { color: colors.primaryForeground }]}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      );
    }

    if (hasSearched) {
      return (
        <View style={styles.state}>
          <Feather name="search" size={28} color={colors.mutedForeground} />
          <Text style={[styles.stateTitle, { color: colors.foreground }]}>
            No cards found
          </Text>
          <Text style={[styles.stateBody, { color: colors.mutedForeground }]}>
            No matches for “{query.trim()}” in {activeField.label.toLowerCase()}{" "}
            using {selectedCatalogLanguage} catalog data.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.state}>
        <Feather name="layers" size={28} color={colors.accent} />
        <Text style={[styles.stateTitle, { color: colors.foreground }]}>
          Find a card
        </Text>
        <Text style={[styles.stateBody, { color: colors.mutedForeground }]}>
          Enter at least 2 characters. Search by name, collector number, set, or
          rarity.
        </Text>
      </View>
    );
  };

  const renderCard = ({ item }: { item: Card }) => (
    <CardInfoCard
      card={item}
      actions={
        <>
          <ResultAction
            icon="eye"
            label="View Details"
            testID={`view-details-${item.id}`}
            onPress={() => {
              Keyboard.dismiss();
              setDetailsCard(item);
            }}
          />
          <ResultAction
            icon="plus-circle"
            label="Add to Collection"
            testID={`add-collection-${item.id}`}
            onPress={() => {
              Keyboard.dismiss();
              setActionMessage(null);
              setCollectionCard(item);
            }}
          />
          <ResultAction
            icon="heart"
            label={savingWishlistId === item.id ? "Saving…" : "Add to Wishlist"}
            testID={`add-wishlist-${item.id}`}
            disabled={savingWishlistId === item.id}
            onPress={() => void handleAddToWishlist(item)}
          />
        </>
      }
    />
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.screen,
          Platform.OS === "web" ? styles.webTopInset : undefined,
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Search Pokémon cards by name, number, set, or rarity.
        </Text>

        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={19} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Search cards"
            testID="card-search-input"
            value={query}
            onChangeText={setQuery}
            placeholder={activeField.placeholder}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
              style={styles.clearButton}
            >
              <Feather
                name="x-circle"
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.filterLabel, { color: colors.foreground }]}>
          Search by
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {SEARCH_FIELDS.map((field) => {
            const selected = searchField === field.value;
            return (
              <Pressable
                key={field.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                testID={`search-field-${field.value}`}
                onPress={() => setSearchField(field.value)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected
                      ? `${colors.primary}22`
                      : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    {
                      color: selected
                        ? colors.primary
                        : colors.secondaryForeground,
                    },
                  ]}
                >
                  {field.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.filterLabel, { color: colors.foreground }]}>
          Catalog language
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {catalogLanguages.map((language) => {
            const selected = catalogLanguage === language.code;
            return (
              <Pressable
                key={language.code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                testID={`catalog-language-${language.code}`}
                onPress={() => setCatalogLanguage(language.code)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected
                      ? `${colors.accent}22`
                      : colors.card,
                    borderColor: selected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    {
                      color: selected
                        ? colors.accent
                        : colors.secondaryForeground,
                    },
                  ]}
                >
                  {language.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Text style={[styles.languageNote, { color: colors.mutedForeground }]}>
          Catalog translations vary by card. This setting is separate from the
          language of a physical card you own.
        </Text>

        {actionMessage ? (
          <View
            accessible
            accessibilityLiveRegion={actionError ? "assertive" : "polite"}
            style={[
              styles.actionMessage,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <Text
              style={{
                color: actionError ? colors.destructive : colors.accent,
                fontFamily: "Inter_500Medium",
                fontSize: 12,
              }}
            >
              {actionMessage}
            </Text>
          </View>
        ) : null}

        {results.length > 0 && !isLoading && !searchError ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.results}
            ListHeaderComponent={
              <Text
                style={[styles.resultCount, { color: colors.mutedForeground }]}
              >
                {results.length} {results.length === 1 ? "result" : "results"}
              </Text>
            }
            ListFooterComponent={
              results.length === 12 ? (
                <Text
                  style={[
                    styles.resultLimit,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Showing the first 12 matches. Refine your search for more.
                </Text>
              ) : null
            }
          />
        ) : (
          <View style={styles.stateContainer}>{renderEmptyState()}</View>
        )}
      </View>

      <CardDetailsModal
        card={detailsCard}
        onClose={() => setDetailsCard(null)}
      />
      <AddToCollectionModal
        key={collectionCard?.id ?? "collection-form-closed"}
        card={collectionCard}
        visible={collectionCard !== null}
        onClose={closeCollectionModal}
        onSave={handleSaveToCollection}
      />
    </SafeAreaView>
  );
}

function ResultAction({
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
        styles.resultAction,
        {
          backgroundColor: pressed ? colors.secondary : "transparent",
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <Feather name={icon} size={16} color={colors.primary} />
      <Text
        style={[
          styles.resultActionLabel,
          { color: colors.secondaryForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  webTopInset: {
    paddingTop: 67,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  clearButton: {
    minWidth: 36,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  filterLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 14,
    marginBottom: 8,
  },
  chipRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  languageNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  actionMessage: {
    overflow: "hidden",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 10,
  },
  stateContainer: {
    flex: 1,
    minHeight: 140,
    justifyContent: "center",
  },
  state: {
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    padding: 18,
  },
  errorState: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 20,
  },
  stateTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  stateBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  retryButton: {
    minWidth: 120,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  retryLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  results: {
    paddingTop: 14,
    paddingBottom: 18,
  },
  resultCount: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 10,
  },
  resultLimit: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 10,
  },
  resultAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    gap: 3,
  },
  resultActionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 13,
  },
});
