import type { CollectionItem } from "@/src/models/collection-item";
import { getCardCardmarketPrice } from "@/src/utils/valuation";

export interface SetStatistics {
  setId: string;
  setName: string;
  count: number;
  value: number;
}

export interface CollectionStatistics {
  totalCards: number;
  byLanguage: Record<string, number>;
  byRarity: Record<string, number>;
  topSets: readonly SetStatistics[];
  mostCollectedSet: { name: string; count: number } | null;
  mostCommonLanguage: { language: string; count: number } | null;
  mostValuableSet: { name: string; value: number } | null;
}

export function calculateCollectionStatistics(
  items: readonly CollectionItem[],
): CollectionStatistics {
  const byLanguage: Record<string, number> = {};
  const byRarity: Record<string, number> = {};
  const setMap = new Map<
    string,
    { setId: string; setName: string; count: number; value: number }
  >();
  let totalCards = 0;

  for (const item of items) {
    const qty =
      typeof item.quantity === "number" && item.quantity > 0
        ? item.quantity
        : 1;
    totalCards += qty;

    const lang = item.language || item.card.language || "Unknown";
    byLanguage[lang] = (byLanguage[lang] ?? 0) + qty;

    const rarity = item.card.rarity || "Not listed";
    byRarity[rarity] = (byRarity[rarity] ?? 0) + qty;

    const setId = item.card.setId || "unknown";
    const setName = item.card.setName || "Unknown Set";
    const unitPrice = getCardCardmarketPrice(item.card);
    const itemValue = unitPrice != null ? unitPrice * qty : 0;

    const existingSet = setMap.get(setId);
    if (existingSet) {
      existingSet.count += qty;
      existingSet.value += itemValue;
    } else {
      setMap.set(setId, { setId, setName, count: qty, value: itemValue });
    }
  }

  const allSets = Array.from(setMap.values());
  const topSets = [...allSets].sort((a, b) => b.count - a.count).slice(0, 10);

  let mostCollectedSet: { name: string; count: number } | null = null;
  let maxCount = -1;
  for (const s of allSets) {
    if (s.count > maxCount) {
      maxCount = s.count;
      mostCollectedSet = { name: s.setName, count: s.count };
    }
  }

  let mostCommonLanguage: { language: string; count: number } | null = null;
  let maxLangCount = -1;
  for (const [lang, count] of Object.entries(byLanguage)) {
    if (count > maxLangCount) {
      maxLangCount = count;
      mostCommonLanguage = { language: lang, count };
    }
  }

  let mostValuableSet: { name: string; value: number } | null = null;
  let maxValue = -1;
  for (const s of allSets) {
    if (s.value > maxValue) {
      maxValue = s.value;
      mostValuableSet = { name: s.setName, value: s.value };
    }
  }

  return {
    totalCards,
    byLanguage,
    byRarity,
    topSets,
    mostCollectedSet,
    mostCommonLanguage,
    mostValuableSet,
  };
}
