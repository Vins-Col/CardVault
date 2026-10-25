import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CollectionItem } from "@/src/models/collection-item";
import type { CollectionRepository } from "@/src/repositories/collection-repository";

const STORAGE_KEY = "cardvault.collection.v1";

export class AsyncStorageCollectionRepository implements CollectionRepository {
  async getAll(): Promise<readonly CollectionItem[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved collection data is invalid.");
    }
    return parsed as CollectionItem[];
  }

  async getById(id: string): Promise<CollectionItem | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) ?? null;
  }

  async add(item: CollectionItem): Promise<CollectionItem> {
    const items = [...(await this.getAll())];
    if (items.some((existing) => existing.id === item.id)) {
      throw new Error("This collection entry already exists.");
    }
    items.push(item);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return item;
  }

  async update(item: CollectionItem): Promise<CollectionItem> {
    const items = [...(await this.getAll())];
    const index = items.findIndex((existing) => existing.id === item.id);
    if (index === -1) {
      throw new Error("The collection entry could not be found.");
    }
    items[index] = item;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return item;
  }

  async remove(id: string): Promise<void> {
    const items = [...(await this.getAll())];
    const nextItems = items.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }
}
