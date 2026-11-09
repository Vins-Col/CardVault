import type { Card } from "@/src/models/card";
import type { ParsedQuery } from "@/src/utils/query-parser";

export type CardCatalogSearchField =
  "name" | "collectorNumber" | "setName" | "setCode" | "rarity";

export interface CardCatalogLanguage {
  code: string;
  label: string;
}

export interface CardCatalogSearchOptions {
  field: CardCatalogSearchField;
  catalogLanguage: string;
  signal?: AbortSignal;
  parsedQuery?: ParsedQuery;
}

export interface CardCatalogProvider<TCard extends Card = Card> {
  readonly gameId: string;
  getSupportedLanguages(): readonly CardCatalogLanguage[];
  searchCards(
    query: string,
    options: CardCatalogSearchOptions,
  ): Promise<readonly TCard[]>;
  getCard(externalId: string, catalogLanguage?: string): Promise<TCard | null>;
}
