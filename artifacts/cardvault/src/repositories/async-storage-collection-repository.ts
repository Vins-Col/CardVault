import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CollectionItem } from "@/src/models/collection-item";
import type { CollectionRepository } from "@/src/repositories/collection-repository";

const STORAGE_KEY = "cardvault.collection.v1";

type CollectionStorage = Pick<
  typeof AsyncStorage,
  "getItem" | "setItem" | "removeItem"
>;

export class AsyncStorageCollectionRepository implements CollectionRepository {
  private operationQueue: Promise<void> = Promise.resolve();

  constructor(private readonly storage: CollectionStorage = AsyncStorage) {}

  getAll(): Promise<readonly CollectionItem[]> {
    return this.enqueue(() => this.readAll());
  }

  async getById(id: string): Promise<CollectionItem | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) ?? null;
  }

  add(item: CollectionItem): Promise<CollectionItem> {
    return this.enqueue(async () => {
      assertValidItem(item);
      const items = [...(await this.readAll())];
      if (items.some((existing) => existing.id === item.id)) {
        throw new Error("This collection entry already exists.");
      }
      items.push(item);
      await this.writeAll(items);
      return item;
    });
  }

  update(item: CollectionItem): Promise<CollectionItem> {
    return this.enqueue(async () => {
      assertValidItem(item);
      const items = [...(await this.readAll())];
      const index = items.findIndex((existing) => existing.id === item.id);
      if (index === -1) {
        throw new Error("The collection entry could not be found.");
      }
      items[index] = item;
      await this.writeAll(items);
      return item;
    });
  }

  remove(id: string): Promise<void> {
    return this.enqueue(async () => {
      const items = [...(await this.readAll())];
      await this.writeAll(items.filter((item) => item.id !== id));
    });
  }

  incrementQuantity(id: string, amount = 1): Promise<CollectionItem> {
    return this.changeQuantity(id, amount, "increase");
  }

  decrementQuantity(id: string, amount = 1): Promise<CollectionItem> {
    return this.changeQuantity(id, amount, "decrease");
  }

  clearCollection(): Promise<void> {
    return this.enqueue(() => this.storage.removeItem(STORAGE_KEY));
  }

  private changeQuantity(
    id: string,
    amount: number,
    direction: "increase" | "decrease",
  ): Promise<CollectionItem> {
    return this.enqueue(async () => {
      if (!Number.isSafeInteger(amount) || amount < 1) {
        throw new Error("Quantity changes must be a whole number of 1 or more.");
      }
      const items = [...(await this.readAll())];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error("The collection entry could not be found.");
      }

      const nextQuantity =
        items[index].quantity +
        (direction === "increase" ? amount : -amount);
      if (!Number.isSafeInteger(nextQuantity) || nextQuantity < 1) {
        throw new Error("Collection quantity cannot be less than 1.");
      }

      const updatedItem: CollectionItem = {
        ...items[index],
        quantity: nextQuantity,
        updatedAt: new Date().toISOString(),
      };
      items[index] = updatedItem;
      await this.writeAll(items);
      return updatedItem;
    });
  }

  private async readAll(): Promise<CollectionItem[]> {
    const stored = await this.storage.getItem(STORAGE_KEY);
    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isCollectionItem)) {
      throw new Error("Saved collection data is invalid.");
    }
    return parsed;
  }

  private writeAll(items: readonly CollectionItem[]): Promise<void> {
    return this.storage.setItem(STORAGE_KEY, JSON.stringify(items));
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

function assertValidItem(item: CollectionItem): void {
  if (!isCollectionItem(item)) {
    throw new Error("The collection entry is invalid.");
  }
}

function isCollectionItem(value: unknown): value is CollectionItem {
  if (!isRecord(value) || !isRecord(value.card)) {
    return false;
  }

  const card = value.card;
  return (
    typeof value.id === "string" &&
    typeof value.quantity === "number" &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity >= 1 &&
    typeof value.condition === "string" &&
    typeof value.language === "string" &&
    (typeof value.variant === "string" || value.variant === null) &&
    isNullableNumber(value.purchasePrice) &&
    isNullableNumber(value.currentEstimatedPrice) &&
    isNullableString(value.notes) &&
    isNullableString(value.acquisitionDate) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return (
    value === null || (typeof value === "number" && Number.isFinite(value))
  );
}
