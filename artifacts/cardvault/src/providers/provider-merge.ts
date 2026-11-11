import type { Card } from "@/src/models/card";
import type {
  CardCatalogProvider,
  CardCatalogSearchOptions,
} from "@/src/providers/card-catalog-provider";
import { PokemonTcgApiCatalogProvider } from "@/src/providers/pokemon-tcg-api-catalog-provider";
import { PokemonTcgDexCatalogProvider } from "@/src/providers/pokemon-tcgdex-catalog-provider";

const apiProvider = new PokemonTcgApiCatalogProvider();
const tcgdexProvider = new PokemonTcgDexCatalogProvider();

export function matchesCatalogLanguage(card: Card, catalogLanguage?: string): boolean {
  if (!catalogLanguage || catalogLanguage === "any") {
    return true;
  }
  const langLower = card.language.toLowerCase();
  const code = catalogLanguage.toLowerCase();
  if (code === "en" && langLower.includes("english")) return true;
  if (code === "it" && langLower.includes("italian")) return true;
  if (code === "ja" && langLower.includes("japanese")) return true;
  if (code === "fr" && langLower.includes("french")) return true;
  if (code === "de" && langLower.includes("german")) return true;
  if (code === "es" && langLower.includes("spanish")) return true;
  if (code === "ko" && langLower.includes("korean")) return true;
  if (code.startsWith("zh") && langLower.includes("chinese")) return true;
  return langLower.includes(code) || langLower === code;
}

export async function searchAllProviders(
  query: string,
  options: CardCatalogSearchOptions,
  providers?: readonly CardCatalogProvider[],
): Promise<readonly Card[]> {
  const lang = (options.catalogLanguage ?? "").toLowerCase();
  let activeProviders: readonly CardCatalogProvider[];

  if (providers) {
    activeProviders = providers;
  } else if (!lang || lang === "any" || lang === "en") {
    activeProviders = [apiProvider, tcgdexProvider];
  } else {
    activeProviders = [tcgdexProvider];
  }

  const results = await Promise.allSettled(
    activeProviders.map((provider) => provider.searchCards(query, options)),
  );

  const cardMap = new Map<string, Card>();

  for (const res of results) {
    if (res.status === "fulfilled") {
      for (const card of res.value) {
        if (matchesCatalogLanguage(card, options.catalogLanguage)) {
          const key = `${card.gameId}:${card.externalId}:${card.language}`;
          if (!cardMap.has(key)) {
            cardMap.set(key, card);
          }
        }
      }
    }
  }

  return Array.from(cardMap.values());
}
