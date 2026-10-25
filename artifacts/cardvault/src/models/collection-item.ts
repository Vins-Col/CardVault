import type { Card } from "@/src/models/card";

export interface CollectionItem {
  id: string;
  card: Card;
  quantity: number;
  condition: string;
  language: string;
  variant: string | null;
  purchasePrice: number | null;
  currentEstimatedPrice: number | null;
  notes: string | null;
  acquisitionDate: string | null;
  createdAt: string;
  updatedAt: string;
}
