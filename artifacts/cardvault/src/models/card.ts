export interface TcgPlayerPrices {
  market: number | null;
  low: number | null;
  mid: number | null;
}

export interface CardmarketPrices {
  trendPrice: number | null;
  averageSellPrice: number | null;
  lowPrice: number | null;
}

export interface Card {
  id: string;
  gameId: string;
  externalId: string;
  name: string;
  setId: string;
  setName: string;
  collectorNumber: string;
  /** Language used by the card catalog record, not the physical copy. */
  language: string;
  rarity: string | null;
  variant: string | null;
  imageUrl: string | null;
  marketPrice: number | null;
  currency: string | null;
  tcgplayerPrices: TcgPlayerPrices | null;
  cardmarketPrices: CardmarketPrices | null;
}
