import type { CardLayout, GameId, LayoutName } from "./layout-types";
import {
  PokemonModernLayout,
  PokemonEXLayout,
  PokemonVLayout,
  PokemonClassicLayout,
  PokemonVintageLayout,
} from "./pokemon-modern-layout";
import { getCalibratedTemplate } from "./layout-calibration";

export {
  PokemonEXLayout,
  PokemonVLayout,
  PokemonClassicLayout,
  PokemonVintageLayout,
};

const yugiohRef = getCalibratedTemplate("YugiohModern");
const mtgRef = getCalibratedTemplate("MtgModern");
const onepieceRef = getCalibratedTemplate("OnePieceModern");

const layoutRegistry: Record<GameId, CardLayout> = {
  pokemon: PokemonModernLayout,
  yugioh: {
    gameId: yugiohRef.gameId,
    layoutName: yugiohRef.layoutName,
    cardNameRegion: yugiohRef.cardNameRegion,
    hpRegion: yugiohRef.hpRegion,
    setCodeRegion: yugiohRef.setCodeRegion,
    collectorNumberRegion: yugiohRef.collectorNumberRegion,
    get nameRegion() {
      return this.cardNameRegion;
    },
  },
  mtg: {
    gameId: mtgRef.gameId,
    layoutName: mtgRef.layoutName,
    cardNameRegion: mtgRef.cardNameRegion,
    hpRegion: mtgRef.hpRegion,
    setCodeRegion: mtgRef.setCodeRegion,
    collectorNumberRegion: mtgRef.collectorNumberRegion,
    get nameRegion() {
      return this.cardNameRegion;
    },
  },
  onepiece: {
    gameId: onepieceRef.gameId,
    layoutName: onepieceRef.layoutName,
    cardNameRegion: onepieceRef.cardNameRegion,
    hpRegion: onepieceRef.hpRegion,
    setCodeRegion: onepieceRef.setCodeRegion,
    collectorNumberRegion: onepieceRef.collectorNumberRegion,
    get nameRegion() {
      return this.cardNameRegion;
    },
  },
};

let activeGameId: GameId = "pokemon";

export function getCardLayout(gameId: GameId = activeGameId): CardLayout {
  return layoutRegistry[gameId] ?? PokemonModernLayout;
}

export function getLayoutByName(layoutName: LayoutName): CardLayout {
  switch (layoutName) {
    case "PokemonEX":
      return PokemonEXLayout;
    case "PokemonV":
      return PokemonVLayout;
    case "PokemonClassic":
      return PokemonClassicLayout;
    case "PokemonVintage":
      return PokemonVintageLayout;
    case "PokemonModern":
    default:
      return PokemonModernLayout;
  }
}

export function setActiveGameLayout(gameId: GameId): void {
  activeGameId = gameId;
}

export function registerCardLayout(layout: CardLayout): void {
  layoutRegistry[layout.gameId] = layout;
}
