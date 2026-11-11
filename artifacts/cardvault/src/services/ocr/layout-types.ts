export type GameId = "pokemon" | "yugioh" | "mtg" | "onepiece";

export interface LayoutRegion {
  x: number; // normalized 0 to 1
  y: number; // normalized 0 to 1
  width: number; // normalized 0 to 1
  height: number; // normalized 0 to 1
}

export interface CardLayout {
  gameId: GameId;
  layoutName: string;
  nameRegion: LayoutRegion;
  setCodeRegion: LayoutRegion;
  collectorNumberRegion: LayoutRegion;
}
