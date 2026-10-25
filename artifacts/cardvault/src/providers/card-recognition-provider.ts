import type { Card } from "@/src/models/card";

export interface CardRecognitionProvider {
  recognizeCard(imageUri: string): Promise<Card | null>;
}
