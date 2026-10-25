import type { Card } from "@/src/models/card";
import type {
  CardCatalogLanguage,
  CardCatalogProvider,
  CardCatalogSearchField,
  CardCatalogSearchOptions,
} from "@/src/providers/card-catalog-provider";

const API_BASE_URL = "https://api.tcgdex.net/v2";
const MAX_SEARCH_RESULTS = 12;

const CATALOG_LANGUAGES: readonly CardCatalogLanguage[] = [
  { code: "en", label: "English" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "ko", label: "Korean" },
  { code: "zh-tw", label: "Chinese (Traditional)" },
  { code: "zh-cn", label: "Chinese (Simplified)" },
];

const API_FILTERS: Record<CardCatalogSearchField, string> = {
  name: "name",
  collectorNumber: "localId",
  setName: "set.name",
  setCode: "set.id",
  rarity: "rarity",
};

interface CardBrief {
  id: string;
}

interface CardDetails {
  id: string;
  localId: string | number;
  name: string;
  image?: string;
  rarity?: string;
  set: {
    id: string;
    name: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`The card catalog returned an invalid ${field}.`);
  }
  return value;
}

function parseCardBrief(value: unknown): CardBrief {
  if (!isRecord(value)) {
    throw new Error("The card catalog returned an invalid search result.");
  }
  return { id: requireString(value.id, "card identifier") };
}

function parseCardDetails(value: unknown): CardDetails {
  if (!isRecord(value) || !isRecord(value.set)) {
    throw new Error("The card catalog returned incomplete card details.");
  }

  const localId = value.localId;
  if (typeof localId !== "string" && typeof localId !== "number") {
    throw new Error("The card catalog returned an invalid collector number.");
  }

  return {
    id: requireString(value.id, "card identifier"),
    localId,
    name: requireString(value.name, "card name"),
    image: typeof value.image === "string" ? value.image : undefined,
    rarity: typeof value.rarity === "string" ? value.rarity : undefined,
    set: {
      id: requireString(value.set.id, "set code"),
      name: requireString(value.set.name, "set name"),
    },
  };
}

export class PokemonTcgDexCatalogProvider implements CardCatalogProvider {
  readonly gameId = "pokemon-tcg";

  private readonly cardCache = new Map<string, Card>();
  private readonly searchCache = new Map<string, readonly Card[]>();

  getSupportedLanguages(): readonly CardCatalogLanguage[] {
    return CATALOG_LANGUAGES;
  }

  async searchCards(
    query: string,
    options: CardCatalogSearchOptions,
  ): Promise<readonly Card[]> {
    const term = query.trim();
    if (term.length < 2) {
      return [];
    }

    const language = this.resolveLanguage(options.catalogLanguage);
    const cacheKey = [
      language.code,
      options.field,
      term.toLocaleLowerCase(),
    ].join(":");
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const url = new URL(`${API_BASE_URL}/${language.code}/cards`);
    url.searchParams.set(API_FILTERS[options.field], term);
    url.searchParams.set("pagination:page", "1");
    url.searchParams.set("pagination:itemsPerPage", String(MAX_SEARCH_RESULTS));

    const response = await fetch(url.toString(), {
      signal: options.signal,
    });
    if (!response.ok) {
      throw new Error(`The card catalog request failed (${response.status}).`);
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error("The card catalog returned an invalid search response.");
    }

    const briefs = payload.slice(0, MAX_SEARCH_RESULTS).map(parseCardBrief);
    const cards = await Promise.all(
      briefs.map(async ({ id }) => {
        const card = await this.getCard(id, language.code, options.signal);
        if (!card) {
          throw new Error("The catalog could not load a matching card.");
        }
        return card;
      }),
    );

    this.searchCache.set(cacheKey, cards);
    return cards;
  }

  async getCard(
    externalId: string,
    catalogLanguage = "en",
    signal?: AbortSignal,
  ): Promise<Card | null> {
    const language = this.resolveLanguage(catalogLanguage);
    const cacheKey = `${language.code}:${externalId}`;
    const cached = this.cardCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${API_BASE_URL}/${language.code}/cards/${encodeURIComponent(externalId)}`,
      { signal },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`The card catalog request failed (${response.status}).`);
    }

    const details = parseCardDetails((await response.json()) as unknown);
    const card: Card = {
      id: `${this.gameId}:${details.id}`,
      gameId: this.gameId,
      externalId: details.id,
      name: details.name,
      setId: details.set.id,
      setName: details.set.name,
      collectorNumber: String(details.localId),
      language: language.label,
      rarity: details.rarity ?? null,
      variant: null,
      imageUrl: details.image ? `${details.image}/low.webp` : null,
      marketPrice: null,
      currency: null,
    };

    this.cardCache.set(cacheKey, card);
    return card;
  }

  private resolveLanguage(code: string): CardCatalogLanguage {
    const language = CATALOG_LANGUAGES.find(
      (supported) => supported.code === code,
    );
    if (!language) {
      throw new Error("Choose a supported catalog language.");
    }
    return language;
  }
}
