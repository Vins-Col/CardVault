import type { Card } from "@/src/models/card";

export interface CollectionItem {
  id: string;
  card: Card;
  quantity: number;
  condition: string;
  /** Language printed on the physical copy owned by the user. */
  language: string;
  variant: string | null;
  purchasePrice: number | null;
  currentEstimatedPrice: number | null;
  notes: string | null;
  acquisitionDate: string | null;
  createdAt: string;
  updatedAt: string;
}
