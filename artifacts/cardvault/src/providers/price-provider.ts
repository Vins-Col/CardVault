import type { Card } from "@/src/models/card";

export interface PriceQuote {
  amount: number;
  currency: string;
}

export interface PriceProvider {
  getCurrentPrice(card: Card): Promise<PriceQuote | null>;
}
