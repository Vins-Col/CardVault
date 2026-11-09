import type { Card } from "@/src/models/card";
import type { CollectionItem } from "@/src/models/collection-item";

export function getCardCardmarketPrice(card: Card): number | null {
  if (!card.cardmarketPrices) {
    return null;
  }
  const cm = card.cardmarketPrices;
  if (typeof cm.trendPrice === "number" && !isNaN(cm.trendPrice)) {
    return cm.trendPrice;
  }
  if (typeof cm.averageSellPrice === "number" && !isNaN(cm.averageSellPrice)) {
    return cm.averageSellPrice;
  }
  if (typeof cm.lowPrice === "number" && !isNaN(cm.lowPrice)) {
    return cm.lowPrice;
  }
  return null;
}

export interface CollectionValuation {
  totalCards: number;
  totalValue: number;
  averageCardValue: number;
  mostValuableCard: { name: string; value: number } | null;
}

export function calculateCollectionValuation(
  items: readonly CollectionItem[],
): CollectionValuation {
  let totalCards = 0;
  let totalValue = 0;
  let mostValuableCard: { name: string; value: number } | null = null;
  let highestValue = -1;

  for (const item of items) {
    const qty =
      typeof item.quantity === "number" && item.quantity > 0
        ? item.quantity
        : 1;
    totalCards += qty;

    const unitPrice = getCardCardmarketPrice(item.card);
    if (unitPrice != null) {
      const itemTotalValue = unitPrice * qty;
      totalValue += itemTotalValue;

      if (unitPrice > highestValue) {
        highestValue = unitPrice;
        mostValuableCard = {
          name: item.card.name,
          value: unitPrice,
        };
      }
    }
  }

  const averageCardValue = totalCards > 0 ? totalValue / totalCards : 0;

  return {
    totalCards,
    totalValue,
    averageCardValue,
    mostValuableCard,
  };
}

export interface WishlistValuation {
  totalCards: number;
  totalValue: number;
  averageCardValue: number;
  mostValuableCard: { name: string; value: number } | null;
}

export function calculateWishlistValuation(
  cards: readonly Card[],
): WishlistValuation {
  const totalCards = cards.length;
  let totalValue = 0;
  let mostValuableCard: { name: string; value: number } | null = null;
  let highestValue = -1;

  for (const card of cards) {
    const unitPrice = getCardCardmarketPrice(card);
    if (unitPrice != null) {
      totalValue += unitPrice;

      if (unitPrice > highestValue) {
        highestValue = unitPrice;
        mostValuableCard = {
          name: card.name,
          value: unitPrice,
        };
      }
    }
  }

  const averageCardValue = totalCards > 0 ? totalValue / totalCards : 0;

  return {
    totalCards,
    totalValue,
    averageCardValue,
    mostValuableCard,
  };
}
