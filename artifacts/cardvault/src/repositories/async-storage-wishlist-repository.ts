import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Card } from "@/src/models/card";
import type { WishlistRepository } from "@/src/repositories/wishlist-repository";

const STORAGE_KEY = "cardvault.wishlist.v1";

export class AsyncStorageWishlistRepository implements WishlistRepository {
  async getAll(): Promise<readonly Card[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved wishlist data is invalid.");
    }
    return parsed as Card[];
  }

  async add(card: Card): Promise<boolean> {
    const cards = [...(await this.getAll())];
    if (cards.some((saved) => saved.id === card.id)) {
      return false;
    }
    cards.push(card);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return true;
  }

  async remove(cardId: string): Promise<void> {
    const cards = [...(await this.getAll())];
    const nextCards = cards.filter((card) => card.id !== cardId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextCards));
  }
}
