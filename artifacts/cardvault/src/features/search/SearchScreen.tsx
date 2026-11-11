import React, { useEffect, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
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
import { isSamePhysicalConfiguration } from "@/src/features/collection/collection-matching";
import { searchAllProviders, matchesCatalogLanguage } from "@/src/providers/provider-merge";
import { parseSmartQuery } from "@/src/utils/query-parser";
import type { ParsedQuery } from "@/src/utils/query-parser";
import {
  collectionRepository,
  wishlistRepository,
} from "@/src/repositories/repository-registry";
import AddToCollectionModal from "@/src/features/search/AddToCollectionModal";
import type { AddToCollectionFormValues } from "@/src/features/search/AddToCollectionModal";
import CardDetailsModal from "@/src/features/search/CardDetailsModal";
import type { WishlistActionResult } from "@/src/features/search/CardDetailsModal";
import CollectionDuplicateModal from "@/src/features/search/CollectionDuplicateModal";
import {
  pickImageFromGallery,
  takePhotoWithCamera,
  extractCardFromImage,
  type OcrExtractionResult,
} from "@/src/services/ocr-service";
import OcrConfirmationModal from "@/src/features/search/OcrConfirmationModal";
import CardCaptureOverlay from "@/src/components/CardCaptureOverlay";
import CameraScreen from "@/src/features/search/CameraScreen";

const catalogLanguages = [
  { code: "", label: "🌐 Any" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "it", label: "🇮🇹 IT" },
  { code: "ja", label: "🇯🇵 JP" },
  { code: "fr", label: "🇫🇷 FR" },
  { code: "de", label: "🇩🇪 DE" },
  { code: "es", label: "🇪🇸 ES" },
  { code: "ko", label: "🇰🇷 KO" },
  { code: "zh-cn", label: "🇨🇳 CN" },
  { code: "zh-tw", label: "🇹🇼 ZH" },
];

function createEntryId(): string {
  return `collection-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface CollectorNumberInfo {
  variants: Set<string>;
  baseNum: string;
  setSize: string | null;
  raw: string;
}

function getCollectorNumberVariants(
  numStr: string | null | undefined,
): CollectorNumberInfo {
  if (!numStr) {
    return { variants: new Set(), baseNum: "", setSize: null, raw: "" };
  }
  const raw = numStr.toLowerCase().trim();
  const parts = raw.split("/");
  const base = parts[0]?.trim() ?? raw;
  const setSize = parts[1]?.trim() ?? null;
  const intVal = !isNaN(Number(base)) ? String(Number(base)) : base;
  const padded = base.padStart(3, "0");

  const variantList = [raw, base, intVal, padded];
  if (setSize) {
    variantList.push(`${base}/${setSize}`);
    const intSetSize = !isNaN(Number(setSize)) ? String(Number(setSize)) : setSize;
    variantList.push(`${intVal}/${intSetSize}`);
  }
  return {
    variants: new Set(variantList),
    baseNum: base,
    setSize,
    raw,
  };
}

function filterAndRankCards(
  cards: readonly Card[],
  parsed: ParsedQuery,
  catalogLanguage: string,
): readonly Card[] {
  const { baseNum, setSize, raw: targetRaw } = getCollectorNumberVariants(
    parsed.collectorNumber,
  );

  const targetSet = parsed.set ? parsed.set.toLowerCase().trim() : null;
  const targetName = parsed.name ? parsed.name.toLowerCase().trim() : null;

  if (parsed.collectorNumber) {
    console.log(
      `[Collector Search Debug] Query: "${parsed.raw}" | Collector Number: "${parsed.collectorNumber}" | Set: "${parsed.set}"`,
    );
  }

  const getCardCollectorScore = (card: Card): number => {
    if (!parsed.collectorNumber) {
      return 0;
    }
    const cardNum = (card.collectorNumber ?? "").toLowerCase().trim();
    const cardInfo = getCollectorNumberVariants(card.collectorNumber);

    // Priority A: Exact match or base + setSize match (Collector Mode primary identifier: 001/030, 151/165, 223/197)
    if (
      cardNum === targetRaw ||
      (setSize && cardInfo.baseNum === baseNum && cardInfo.setSize === setSize)
    ) {
      return 100;
    }
    // Priority B: Base number / padded match (e.g. 001, 151, 223, 183, 111)
    if (
      cardNum === baseNum ||
      cardNum === cardInfo.baseNum ||
      cardNum === baseNum.padStart(3, "0")
    ) {
      return 85;
    }
    // Priority C: Integer match (e.g. 1)
    if (
      cardNum === String(Number(baseNum)) ||
      cardNum === String(Number(cardInfo.baseNum))
    ) {
      return 50;
    }
    // Substring match fallback
    if (cardNum.includes(baseNum) || targetRaw.includes(cardNum)) {
      return 25;
    }
    return 0;
  };

  const getCardSetScore = (card: Card): number => {
    if (!targetSet) {
      return 0;
    }
    const setName = (card.setName ?? "").toLowerCase();
    const setId = (card.setId ?? "").toLowerCase();
    if (setId === targetSet || setName === targetSet) {
      return 90;
    }
    if (setName.includes(targetSet) || setId.includes(targetSet) || targetSet.includes(setId)) {
      return 70;
    }
    return 0;
  };

  const getCardNameScore = (card: Card): number => {
    if (!targetName) {
      return 30;
    }
    const cardName = (card.name ?? "").toLowerCase();
    if (cardName === targetName) {
      return 60;
    }
    if (cardName.startsWith(targetName)) {
      return 45;
    }
    if (cardName.includes(targetName)) {
      return 30;
    }
    return 0;
  };

  const getCardLanguageScore = (card: Card): number => {
    if (!catalogLanguage || catalogLanguage === "any") {
      return 0;
    }
    return matchesCatalogLanguage(card, catalogLanguage) ? 150 : 0;
  };

  const cardScores = new Map<Card, number>();

  for (const card of cards) {
    const collectorScore = getCardCollectorScore(card);
    const setScore = getCardSetScore(card);
    const nameScore = getCardNameScore(card);
    const languageScore = getCardLanguageScore(card);

    let totalScore = collectorScore + setScore + nameScore + languageScore;

    // Set + Number priority (e.g. WCS23 001, MEW 183, EVS 111 receive very high ranking scores)
    if (parsed.collectorNumber && parsed.set && collectorScore > 0 && setScore > 0) {
      totalScore += 250;
    }

    // Name + Set + Number ranking
    if (parsed.collectorNumber && parsed.set && parsed.name && collectorScore > 0 && setScore > 0 && nameScore > 0) {
      totalScore += 200;
    }

    // Collector Mode boost for primary collector identifiers (001/030, 151/165, 223/197)
    if (parsed.collectorNumber && collectorScore >= 85) {
      totalScore += 100;
    }

    cardScores.set(card, totalScore);
  }

  return [...cards].sort((a, b) => {
    const scoreA = cardScores.get(a) ?? 0;
    const scoreB = cardScores.get(b) ?? 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return 0;
  });
}

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [catalogLanguage, setCatalogLanguage] = useState(
    catalogLanguages[0]?.code ?? "",
  );
  const [results, setResults] = useState<readonly Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const requestId = useRef(0);

  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [extractedCard, setExtractedCard] = useState<OcrExtractionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleScanPhoto = async () => {
    if (Platform.OS === "web") {
      setIsScanning(true);
      try {
        const uri = await takePhotoWithCamera();
        if (uri) {
          const extracted = await extractCardFromImage(uri);
          setScannedImageUri(uri);
          setExtractedCard(extracted);
        }
      } catch (e) {
        Alert.alert("Camera Error", e instanceof Error ? e.message : "Could not take photo.");
      } finally {
        setIsScanning(false);
      }
      return;
    }
    setIsCameraOpen(true);
  };

  const handleScanGallery = async () => {
    setIsScanning(true);
    try {
      const uri = await pickImageFromGallery();
      if (uri) {
        const extracted = await extractCardFromImage(uri);
        setScannedImageUri(uri);
        setExtractedCard(extracted);
      }
    } catch (e) {
      Alert.alert("Gallery Error", e instanceof Error ? e.message : "Could not pick image.");
    } finally {
      setIsScanning(false);
    }
  };

  const promptScanOptions = () => {
    if (Platform.OS === "web") {
      const choice = window.confirm("Choose 'OK' to pick from gallery, or 'Cancel' to take a photo.")
        ? "gallery"
        : "camera";
      if (choice === "gallery") {
        void handleScanGallery();
      } else {
        void handleScanPhoto();
      }
      return;
    }
    Alert.alert(
      "Scan Card",
      "Choose a method to scan your Pokémon card",
      [
        { text: "Take Photo", onPress: () => void handleScanPhoto() },
        { text: "Choose From Gallery", onPress: () => void handleScanGallery() },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const [detailsCard, setDetailsCard] = useState<Card | null>(null);
  const [collectionCard, setCollectionCard] = useState<Card | null>(null);
  const [pendingCollectionItem, setPendingCollectionItem] =
    useState<CollectionItem | null>(null);
  const [duplicateCandidates, setDuplicateCandidates] = useState<
    readonly CollectionItem[]
  >([]);
  const [isResolvingDuplicate, setIsResolvingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [savingWishlistId, setSavingWishlistId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState(false);
  const collectionSaveInProgress = useRef(false);

  useEffect(() => {
    const parsed = parseSmartQuery(query);
    if (parsed.language && parsed.language !== catalogLanguage) {
      setCatalogLanguage(parsed.language);
      return;
    }

    const term = query.trim();
    if (term.length < 2) {
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
        const effectiveQuery = parsed.name || query.trim();
        const effectiveLanguage = catalogLanguage;

        const cards = await searchAllProviders(effectiveQuery, {
          field: "name",
          catalogLanguage: effectiveLanguage,
          signal: controller.signal,
          parsedQuery: parsed,
        });

        const rankedCards = filterAndRankCards(cards, parsed, catalogLanguage);

        if (currentRequest === requestId.current) {
          setResults(rankedCards);
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
  }, [catalogLanguage, query, retryCount]);

  const selectedCatalogLanguage =
    catalogLanguages.find((language) => language.code === catalogLanguage)
      ?.label ?? "Unknown";

  const closeCollectionModal = () => {
    setCollectionCard(null);
  };

  const handleSaveToCollection = async (values: AddToCollectionFormValues) => {
    if (!collectionCard || collectionSaveInProgress.current) {
      return;
    }

    collectionSaveInProgress.current = true;
    try {
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
      const matches = (await collectionRepository.getAll()).filter((saved) =>
        isSamePhysicalConfiguration(saved, item),
      );

      setActionMessage(null);
      if (matches.length > 0) {
        setPendingCollectionItem(item);
        setDuplicateCandidates(matches);
        setDuplicateError(null);
        closeCollectionModal();
        return;
      }

      await collectionRepository.add(item);
      setActionMessage(`${item.card.name} added to Collection.`);
      setActionError(false);
      closeCollectionModal();
    } catch (error) {
      Alert.alert(
        "Could not save card",
        error instanceof Error
          ? error.message
          : "The card could not be added to your collection.",
      );
    } finally {
      collectionSaveInProgress.current = false;
    }
  };

  const resolveDuplicate = async (
    operation: (pending: CollectionItem) => Promise<unknown>,
    message: (pending: CollectionItem) => string,
  ) => {
    if (!pendingCollectionItem || isResolvingDuplicate) {
      return;
    }
    setIsResolvingDuplicate(true);
    setDuplicateError(null);
    try {
      await operation(pendingCollectionItem);
      setActionMessage(message(pendingCollectionItem));
      setActionError(false);
      setPendingCollectionItem(null);
      setDuplicateCandidates([]);
    } catch (error) {
      setDuplicateError(
        error instanceof Error
          ? error.message
          : "The collection could not be updated.",
      );
    } finally {
      setIsResolvingDuplicate(false);
    }
  };

  const handleIncreaseDuplicate = (item: CollectionItem) => {
    void resolveDuplicate(
      (pending) =>
        collectionRepository.incrementQuantity(item.id, pending.quantity),
      (pending) =>
        `${pending.card.name} quantity increased in Collection.`,
    );
  };

  const handleCreateSeparateEntry = () => {
    void resolveDuplicate(
      (pending) => collectionRepository.add(pending),
      (pending) => `${pending.card.name} added as a separate Collection entry.`,
    );
  };

  const closeDuplicateModal = () => {
    setPendingCollectionItem(null);
    setDuplicateCandidates([]);
    setDuplicateError(null);
  };

  const handleAddToWishlist = async (
    card: Card,
  ): Promise<WishlistActionResult> => {
    setSavingWishlistId(card.id);
    setActionMessage(null);
    try {
      const added = await wishlistRepository.add(card);
      const message = added
        ? `${card.name} added to Wishlist.`
        : `${card.name} is already in Wishlist.`;
      setActionMessage(message);
      setActionError(false);
      return { message, error: false };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The card could not be added to Wishlist.";
      setActionMessage(message);
      setActionError(true);
      return { message, error: true };
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
            No matches for “{query.trim()}” using {selectedCatalogLanguage} catalog data.
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
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Search Pokémon cards by name, number, set, or rarity.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan card with camera"
            testID="scan-card-button"
            onPress={promptScanOptions}
            style={[styles.scanButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="camera" size={20} color={colors.primary} />
          </Pressable>
        </View>

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
            placeholder="Search name, collector number, set, or rarity..."
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

        <FlatList
          style={styles.flatList}
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.results,
            results.length === 0 && styles.emptyContentContainer,
          ]}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text
                style={[styles.resultCount, { color: colors.mutedForeground }]}
              >
                {results.length} {results.length === 1 ? "result" : "results"}
              </Text>
            ) : undefined
          }
          ListEmptyComponent={renderEmptyState()}
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
            ) : undefined
          }
        />
      </View>

      <CardDetailsModal
        key={detailsCard?.id ?? "card-details-closed"}
        card={detailsCard}
        onClose={() => setDetailsCard(null)}
        onAddToWishlist={handleAddToWishlist}
      />
      <AddToCollectionModal
        key={collectionCard?.id ?? "collection-form-closed"}
        card={collectionCard}
        visible={collectionCard !== null}
        onClose={closeCollectionModal}
        onSave={handleSaveToCollection}
      />
      <CollectionDuplicateModal
        visible={pendingCollectionItem !== null}
        items={duplicateCandidates}
        isSaving={isResolvingDuplicate}
        error={duplicateError}
        onIncrease={handleIncreaseDuplicate}
        onCreateSeparate={handleCreateSeparateEntry}
        onClose={closeDuplicateModal}
      />
      <OcrConfirmationModal
        imageUri={scannedImageUri}
        extracted={extractedCard}
        onClose={() => {
          setScannedImageUri(null);
          setExtractedCard(null);
        }}
        onConfirmSearch={(searchQuery) => {
          setQuery(searchQuery);
          setScannedImageUri(null);
          setExtractedCard(null);
        }}
      />
      <CameraScreen
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={async (croppedUri) => {
          setIsCameraOpen(false);
          setIsScanning(true);
          try {
            const extracted = await extractCardFromImage(croppedUri);
            setScannedImageUri(croppedUri);
            setExtractedCard(extracted);
          } catch (e) {
            Alert.alert("OCR Error", e instanceof Error ? e.message : "Could not process card image.");
          } finally {
            setIsScanning(false);
          }
        }}
      />
      <CardCaptureOverlay visible={isScanning} />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
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
  flatList: {
    flex: 1,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
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
