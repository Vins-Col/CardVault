export type GameId = "pokemon" | "yugioh" | "mtg" | "onepiece";
export type LayoutName =
  | "PokemonModern"
  | "PokemonEX"
  | "PokemonV"
  | "PokemonClassic"
  | "PokemonVintage"
  | "YugiohModern"
  | "MtgModern"
  | "OnePieceModern";

export interface LayoutRegion {
  x: number; // normalized 0 to 1
  y: number; // normalized 0 to 1
  width: number; // normalized 0 to 1
  height: number; // normalized 0 to 1
}

export interface CardLayout {
  gameId: GameId;
  layoutName: LayoutName;
  cardNameRegion: LayoutRegion;
  hpRegion: LayoutRegion;
  setCodeRegion: LayoutRegion;
  collectorNumberRegion: LayoutRegion;
  nameRegion?: LayoutRegion; // Backward compatibility alias
}
