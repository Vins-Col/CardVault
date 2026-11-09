import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CardCatalogProvider } from "@/src/providers/card-catalog-provider";
import { PokemonTcgDexCatalogProvider } from "@/src/providers/pokemon-tcgdex-catalog-provider";
import { PokemonTcgApiCatalogProvider } from "@/src/providers/pokemon-tcg-api-catalog-provider";

export type CatalogProviderType = "tcgdex" | "pokemon-tcg-api";

const STORAGE_KEY = "cardvault:catalog-provider";

const tcgdexProvider = new PokemonTcgDexCatalogProvider();
const apiProvider = new PokemonTcgApiCatalogProvider();

let activeProviderType: CatalogProviderType = "tcgdex";
let isInitialized = false;

export async function initializeCatalogProvider(): Promise<void> {
  if (isInitialized) {
    return;
  }
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === "pokemon-tcg-api" || stored === "tcgdex") {
      activeProviderType = stored;
    }
  } catch {
    // Ignore storage errors and use default
  } finally {
    isInitialized = true;
  }
}

// Trigger initial load
initializeCatalogProvider().catch(() => {});

export function getCatalogProviderType(): CatalogProviderType {
  return activeProviderType;
}

export async function setCatalogProviderType(
  type: CatalogProviderType,
): Promise<void> {
  activeProviderType = type;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, type);
  } catch {
    // Ignore storage errors
  }
}

export function getDefaultCardCatalogProvider(): CardCatalogProvider {
  return activeProviderType === "pokemon-tcg-api" ? apiProvider : tcgdexProvider;
}
