export type {
  OcrConfidence,
  OcrResult,
  OcrExtractionResult,
  OcrProvider,
} from "./ocr/ocr-types";

export {
  pickImageFromGallery,
  takePhotoWithCamera,
} from "./ocr/image-acquisition";

export { parseOcrText } from "./ocr/ocr-parser";
export { HeuristicOcrProvider } from "./ocr/heuristic-ocr-provider";
export { constructSearchQuery } from "./ocr/ocr-query";
export {
  setOcrProvider,
  getOcrProvider,
  extractCardFromImage,
} from "./ocr/ocr-registry";
