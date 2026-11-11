import { recognizeText } from "expo-mlkit-ocr";
import type { OcrProvider, OcrResult } from "./ocr-types";
import { parseOcrText } from "./ocr-parser";

export class MlKitOcrProvider implements OcrProvider {
  async extractText(imageUri: string): Promise<OcrResult> {
    try {
      const recognitionResult = await recognizeText(imageUri);
      return parseOcrText(recognitionResult);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Native ML Kit OCR recognition failed.");
    }
  }
}
