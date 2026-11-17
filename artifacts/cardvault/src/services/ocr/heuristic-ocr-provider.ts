import type { OcrProvider, OcrResult } from "./ocr-types";
import { parseOcrText } from "./ocr-parser";

export class HeuristicOcrProvider implements OcrProvider {
  async extractText(imageUri: string, width?: number, height?: number): Promise<OcrResult> {
    return parseOcrText(imageUri, width, height);
  }
}
