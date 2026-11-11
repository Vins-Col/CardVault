import type { CardLayout, GameId } from "./layout-types";
import { PokemonModernLayout } from "./pokemon-modern-layout";

// Extension points for future TCG layouts (Yu-Gi-Oh!, Magic, One Piece, etc.)
const layoutRegistry: Record<GameId, CardLayout> = {
  pokemon: PokemonModernLayout,
  yugioh: {
    gameId: "yugioh",
    layoutName: "YugiohModern",
    nameRegion: { x: 0.05, y: 0.05, width: 0.70, height: 0.12 },
    setCodeRegion: { x: 0.10, y: 0.85, width: 0.40, height: 0.10 },
    collectorNumberRegion: { x: 0.55, y: 0.85, width: 0.35, height: 0.10 },
  },
  mtg: {
    gameId: "mtg",
    layoutName: "MtgModern",
    nameRegion: { x: 0.05, y: 0.04, width: 0.75, height: 0.10 },
    setCodeRegion: { x: 0.05, y: 0.88, width: 0.30, height: 0.08 },
    collectorNumberRegion: { x: 0.60, y: 0.88, width: 0.35, height: 0.08 },
  },
  onepiece: {
    gameId: "onepiece",
    layoutName: "OnePieceModern",
    nameRegion: { x: 0.05, y: 0.03, width: 0.70, height: 0.15 },
    setCodeRegion: { x: 0.10, y: 0.90, width: 0.35, height: 0.08 },
    collectorNumberRegion: { x: 0.55, y: 0.90, width: 0.35, height: 0.08 },
  },
};

let activeGameId: GameId = "pokemon";

export function getCardLayout(gameId: GameId = activeGameId): CardLayout {
  return layoutRegistry[gameId] ?? PokemonModernLayout;
}

export function setActiveGameLayout(gameId: GameId): void {
  activeGameId = gameId;
}

export function registerCardLayout(layout: CardLayout): void {
  layoutRegistry[layout.gameId] = layout;
}
