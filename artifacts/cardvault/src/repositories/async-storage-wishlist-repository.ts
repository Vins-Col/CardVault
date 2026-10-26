import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Card } from "@/src/models/card";
import type { WishlistRepository } from "@/src/repositories/wishlist-repository";

const STORAGE_KEY = "cardvault.wishlist.v1";

export class AsyncStorageWishlistRepository implements WishlistRepository {
  private operationQueue: Promise<void> = Promise.resolve();

  getAll(): Promise<readonly Card[]> {
    return this.enqueue(() => this.readAll());
  }

  add(card: Card): Promise<boolean> {
    return this.enqueue(async () => {
      assertValidCard(card);
      const cards = [...(await this.readAll())];
      if (cards.some((saved) => isSameCatalogCard(saved, card))) {
        return false;
      }
      cards.push(card);
      await this.writeAll(cards);
      return true;
    });
  }

  remove(cardId: string): Promise<void> {
    return this.enqueue(async () => {
      const cards = [...(await this.readAll())];
      await this.writeAll(cards.filter((card) => card.id !== cardId));
    });
  }

  private async readAll(): Promise<Card[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isCard)) {
      throw new Error("Saved wishlist data is invalid.");
    }
    return parsed;
  }

  private writeAll(cards: readonly Card[]): Promise<void> {
    return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}

function assertValidCard(card: Card): void {
  if (!isCard(card)) {
    throw new Error("The wishlist card is invalid.");
  }
}

function isSameCatalogCard(existing: Card, incoming: Card): boolean {
  return (
    existing.id === incoming.id ||
    (existing.gameId === incoming.gameId &&
      existing.externalId === incoming.externalId)
  );
}

function isCard(value: unknown): value is Card {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const card = value as Record<string, unknown>;
  return (
    typeof card.id === "string" &&
    typeof card.gameId === "string" &&
    typeof card.externalId === "string" &&
    typeof card.name === "string" &&
    typeof card.setId === "string" &&
    typeof card.setName === "string" &&
    typeof card.collectorNumber === "string" &&
    typeof card.language === "string" &&
    isNullableString(card.rarity) &&
    isNullableString(card.variant) &&
    isNullableString(card.imageUrl) &&
    isNullableNumber(card.marketPrice) &&
    isNullableString(card.currency)
  );
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return (
    value === null || (typeof value === "number" && Number.isFinite(value))
  );
}
