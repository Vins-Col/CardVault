import type { Card } from "@/src/models/card";

export interface WishlistRepository<TCard extends Card = Card> {
  getAll(): Promise<readonly TCard[]>;
  add(card: TCard): Promise<boolean>;
  remove(cardId: string): Promise<void>;
}
