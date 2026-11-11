export type OcrConfidence = "high" | "low";

export interface OcrResult {
  name: string;
  setCode: string;
  collectorNumber: string;
  confidence: OcrConfidence;
  rawText: string;
}

export type OcrExtractionResult = OcrResult;

export interface OcrProvider {
  extractText(imageUri: string): Promise<OcrResult>;
}
