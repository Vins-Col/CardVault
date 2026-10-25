import type { CardCatalogProvider } from "@/src/providers/card-catalog-provider";
import { PokemonTcgDexCatalogProvider } from "@/src/providers/pokemon-tcgdex-catalog-provider";

const providers: readonly CardCatalogProvider[] = [
  new PokemonTcgDexCatalogProvider(),
];

export function getDefaultCardCatalogProvider(): CardCatalogProvider {
  const provider = providers[0];
  if (!provider) {
    throw new Error("No card catalog provider is available.");
  }
  return provider;
}
