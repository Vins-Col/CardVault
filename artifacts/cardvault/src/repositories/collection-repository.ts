import type { CollectionItem } from "@/src/models/collection-item";

export interface CollectionRepository<
  TItem extends CollectionItem = CollectionItem,
> {
  getAll(): Promise<readonly TItem[]>;
  getById(id: string): Promise<TItem | null>;
  add(item: TItem): Promise<TItem>;
  update(item: TItem): Promise<TItem>;
  remove(id: string): Promise<void>;
  incrementQuantity(id: string, amount?: number): Promise<TItem>;
  decrementQuantity(id: string, amount?: number): Promise<TItem>;
  clearCollection(): Promise<void>;
}
