import type { Card } from "@/src/models/card";

export interface CardCatalogProvider<TCard extends Card = Card> {
  readonly gameId: string;
  searchCards(query: string): Promise<readonly TCard[]>;
  getCard(externalId: string): Promise<TCard | null>;
}
