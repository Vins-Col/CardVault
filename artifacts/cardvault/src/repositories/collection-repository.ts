import type { CollectionItem } from "@/src/models/collection-item";

export interface CollectionRepository<
  TItem extends CollectionItem = CollectionItem,
> {
  getAll(): Promise<readonly TItem[]>;
  getById(id: string): Promise<TItem | null>;
  add(item: TItem): Promise<TItem>;
  update(item: TItem): Promise<TItem>;
  remove(id: string): Promise<void>;
}
