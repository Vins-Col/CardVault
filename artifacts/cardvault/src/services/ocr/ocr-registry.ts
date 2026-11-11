import type { OcrProvider, OcrResult } from "./ocr-types";
import { HeuristicOcrProvider } from "./heuristic-ocr-provider";

let activeProvider: OcrProvider = new HeuristicOcrProvider();

export function setOcrProvider(provider: OcrProvider): void {
  activeProvider = provider;
}

export function getOcrProvider(): OcrProvider {
  return activeProvider;
}

export async function extractCardFromImage(imageUri: string): Promise<OcrResult> {
  return activeProvider.extractText(imageUri);
}
