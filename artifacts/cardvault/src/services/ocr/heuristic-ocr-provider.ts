import type { OcrProvider, OcrResult } from "./ocr-types";
import { parseOcrText } from "./ocr-parser";

export class HeuristicOcrProvider implements OcrProvider {
  async extractText(imageUri: string): Promise<OcrResult> {
    const decodedUri = decodeURIComponent(imageUri);
    return parseOcrText(decodedUri);
  }
}
