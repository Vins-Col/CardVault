import type { Card, TcgPlayerPrices, CardmarketPrices } from "@/src/models/card";
import type {
  CardCatalogLanguage,
  CardCatalogProvider,
  CardCatalogSearchField,
  CardCatalogSearchOptions,
} from "@/src/providers/card-catalog-provider";

const API_BASE_URL = "https://api.pokemontcg.io/v2/cards";
const MAX_SEARCH_RESULTS = 12;

const CATALOG_LANGUAGES: readonly CardCatalogLanguage[] = [
  { code: "en", label: "English" },
];

const FIELD_QUERY_KEYS: Record<CardCatalogSearchField, string> = {
  name: "name",
  collectorNumber: "number",
  setName: "set.name",
  setCode: "set.id",
  rarity: "rarity",
};

interface ApiCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  set: {
    id: string;
    name: string;
  };
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: Record<string, unknown>;
  cardmarket?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractTcgPlayerPrices(
  tcgplayer: Record<string, unknown> | undefined,
): TcgPlayerPrices | null {
  if (!isRecord(tcgplayer) || !isRecord(tcgplayer.prices)) {
    return null;
  }
  const prices = tcgplayer.prices;
  for (const key of [
    "holofoil",
    "normal",
    "reverseHolofoil",
    "1stEditionHolofoil",
    "unlimitedHolofoil",
  ]) {
    if (isRecord(prices[key])) {
      const p = prices[key];
      if (isRecord(p)) {
        const market = typeof p.market === "number" ? p.market : null;
        const low = typeof p.low === "number" ? p.low : null;
        const mid = typeof p.mid === "number" ? p.mid : null;
        if (market != null || low != null || mid != null) {
          return { market, low, mid };
        }
      }
    }
  }
  for (const key of Object.keys(prices)) {
    const p = prices[key];
    if (isRecord(p)) {
      const market = typeof p.market === "number" ? p.market : null;
      const low = typeof p.low === "number" ? p.low : null;
      const mid = typeof p.mid === "number" ? p.mid : null;
      if (market != null || low != null || mid != null) {
        return { market, low, mid };
      }
    }
  }
  return null;
}

function extractCardmarketPrices(
  cardmarket: Record<string, unknown> | undefined,
): CardmarketPrices | null {
  if (!isRecord(cardmarket) || !isRecord(cardmarket.prices)) {
    return null;
  }
  const p = cardmarket.prices;
  const trendPrice = typeof p.trendPrice === "number" ? p.trendPrice : null;
  const averageSellPrice = typeof p.averageSellPrice === "number" ? p.averageSellPrice : null;
  const lowPrice = typeof p.lowPrice === "number" ? p.lowPrice : null;

  if (trendPrice != null || averageSellPrice != null || lowPrice != null) {
    return { trendPrice, averageSellPrice, lowPrice };
  }
  return null;
}

function parseApiCard(value: unknown): ApiCard {
  if (!isRecord(value) || !isRecord(value.set)) {
    throw new Error("The card catalog returned an invalid card object.");
  }
  return {
    id: String(value.id),
    name: String(value.name),
    number: String(value.number ?? ""),
    rarity: typeof value.rarity === "string" ? value.rarity : undefined,
    set: {
      id: String(value.set.id),
      name: String(value.set.name),
    },
    images: isRecord(value.images)
      ? {
          small:
            typeof value.images.small === "string"
              ? value.images.small
              : undefined,
          large:
            typeof value.images.large === "string"
              ? value.images.large
              : undefined,
        }
      : undefined,
    tcgplayer: isRecord(value.tcgplayer) ? value.tcgplayer : undefined,
    cardmarket: isRecord(value.cardmarket) ? value.cardmarket : undefined,
  };
}

export class PokemonTcgApiCatalogProvider implements CardCatalogProvider {
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

    const parsed = options.parsedQuery;
    const cacheKey = [
      options.field,
      term.toLocaleLowerCase(),
      parsed ? JSON.stringify(parsed) : "",
    ].join(":");
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let qParam = "";
    if (
      parsed &&
      (parsed.name ||
        parsed.collectorNumber ||
        parsed.rarity ||
        parsed.set ||
        parsed.language)
    ) {
      const parts: string[] = [];
      if (parsed.name) {
        parts.push(`name:${parsed.name}*`);
      }
      if (parsed.collectorNumber) {
        const num = parsed.collectorNumber;
        const baseNum = num.split("/")[0]?.trim() ?? num;
        const intNum = !isNaN(Number(baseNum))
          ? String(Number(baseNum))
          : baseNum;
        const paddedNum = baseNum.padStart(3, "0");

        const numVariants = Array.from(
          new Set([num, baseNum, intNum, paddedNum]),
        );
        const numQueries = numVariants
          .map((v) => `number:"${v}"`)
          .join(" OR ");
        parts.push(`(${numQueries})`);
      }
      if (parsed.rarity) {
        const r = parsed.rarity;
        parts.push(
          `(rarity:"*${r}*" OR subtypes:"${r.toUpperCase()}")`,
        );
      }
      if (parsed.set) {
        parts.push(
          `(set.name:"*${parsed.set}*" OR set.id:"${parsed.set}")`,
        );
      }
      qParam = parts.join(" AND ");
    }

    if (!qParam) {
      const fieldKey = FIELD_QUERY_KEYS[options.field] ?? "name";
      qParam = fieldKey === "name" ? `name:${term}*` : `${fieldKey}:"${term}"`;
    }

    const hasCollectorNumber = Boolean(parsed?.collectorNumber);
    const candidatePageSize = hasCollectorNumber ? 100 : MAX_SEARCH_RESULTS;

    let cards = await this.executeApiSearch(
      qParam,
      options.signal,
      candidatePageSize,
    );

    // Fallback if compound query returns zero results
    if (cards.length === 0 && parsed) {
      if (parsed.name && qParam !== `name:${parsed.name}*`) {
        cards = await this.executeApiSearch(
          `name:${parsed.name}*`,
          options.signal,
          candidatePageSize,
        );
      } else if (qParam.includes(" AND ")) {
        cards = await this.executeApiSearch(
          `name:${term}*`,
          options.signal,
          candidatePageSize,
        );
      }
    }

    this.searchCache.set(cacheKey, cards);
    return cards;
  }

  private async executeApiSearch(
    qParam: string,
    signal?: AbortSignal,
    pageSize = MAX_SEARCH_RESULTS,
  ): Promise<readonly Card[]> {
    const url = new URL(API_BASE_URL);
    url.searchParams.set("q", qParam);
    url.searchParams.set("page", "1");
    url.searchParams.set("pageSize", String(pageSize));

    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      if (response.status === 400) {
        return [];
      }
      throw new Error(`The card catalog request failed (${response.status}).`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.data)) {
      return [];
    }

    return payload.data.map((raw) => {
      const item = parseApiCard(raw);
      const tcgplayerPrices = extractTcgPlayerPrices(item.tcgplayer);
      const cardmarketPrices = extractCardmarketPrices(item.cardmarket);
      const marketPrice = tcgplayerPrices?.market ?? null;

      const card: Card = {
        id: `${this.gameId}:${item.id}`,
        gameId: this.gameId,
        externalId: item.id,
        name: item.name,
        setId: item.set.id,
        setName: item.set.name,
        collectorNumber: item.number,
        language: "English",
        rarity: item.rarity ?? null,
        variant: null,
        imageUrl: item.images?.large ?? item.images?.small ?? null,
        marketPrice: typeof marketPrice === "number" ? marketPrice : null,
        currency: marketPrice != null ? "USD" : null,
        tcgplayerPrices,
        cardmarketPrices,
      };

      this.cardCache.set(`${card.externalId}`, card);
      return card;
    });
  }

  async getCard(
    externalId: string,
    catalogLanguage = "en",
    signal?: AbortSignal,
  ): Promise<Card | null> {
    void catalogLanguage;
    const cached = this.cardCache.get(externalId);
    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${API_BASE_URL}/${encodeURIComponent(externalId)}`,
      { signal },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`The card catalog request failed (${response.status}).`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !isRecord(payload.data)) {
      return null;
    }

    const item = parseApiCard(payload.data);
    const tcgplayerPrices = extractTcgPlayerPrices(item.tcgplayer);
    const cardmarketPrices = extractCardmarketPrices(item.cardmarket);
    const marketPrice = tcgplayerPrices?.market ?? null;

    const card: Card = {
      id: `${this.gameId}:${item.id}`,
      gameId: this.gameId,
      externalId: item.id,
      name: item.name,
      setId: item.set.id,
      setName: item.set.name,
      collectorNumber: item.number,
      language: "English",
      rarity: item.rarity ?? null,
      variant: null,
      imageUrl: item.images?.large ?? item.images?.small ?? null,
      marketPrice: typeof marketPrice === "number" ? marketPrice : null,
      currency: marketPrice != null ? "USD" : null,
      tcgplayerPrices,
      cardmarketPrices,
    };

    this.cardCache.set(externalId, card);
    return card;
  }
}
