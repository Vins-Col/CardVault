import type { OcrProvider, OcrResult } from "./ocr-types";
import { MlKitOcrProvider } from "./mlkit-ocr-provider";

let activeProvider: OcrProvider = new MlKitOcrProvider();

export function setOcrProvider(provider: OcrProvider): void {
  activeProvider = provider;
}

export function getOcrProvider(): OcrProvider {
  return activeProvider;
}

export async function extractCardFromImage(imageUri: string, width?: number, height?: number): Promise<OcrResult> {
  return activeProvider.extractText(imageUri, width, height);
}
