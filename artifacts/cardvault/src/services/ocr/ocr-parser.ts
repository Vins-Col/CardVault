import type { RecognitionResult, TextBlock } from "expo-mlkit-ocr";
import type { OcrResult } from "./ocr-types";
import type { CardLayout, LayoutName } from "./layout-types";
import { getLayoutByName } from "./layout-registry";

const KNOWN_SETS = new Set([
  "WCS23",
  "DLR",
  "MEW",
  "SWSH7",
  "PAR",
  "PAL",
  "EVS",
  "151",
  "SV2A",
  "SV4A",
  "M2A",
]);

const INVALID_NAMES = new Set([
  "BASIC",
  "BASE",
  "STAGE",
  "STAGE 1",
  "STAGE 2",
  "HP",
  "PS",
]);

function isInsideRegion(
  bx: number,
  by: number,
  bw: number,
  bh: number,
  region: { x: number; y: number; width: number; height: number },
): boolean {
  const right = bx + bw;
  const bottom = by + bh;
  const regRight = region.x + region.width;
  const regBottom = region.y + region.height;

  return (
    bx < regRight &&
    right > region.x &&
    by < regBottom &&
    bottom > region.y
  );
}

function intersectsRegion(
  bx: number,
  by: number,
  bw: number,
  bh: number,
  region: { x: number; y: number; width: number; height: number },
): boolean {
  const right = bx + bw;
  const bottom = by + bh;
  const regRight = region.x + region.width;
  const regBottom = region.y + region.height;

  return (
    bx < regRight &&
    right > region.x &&
    by < regBottom &&
    bottom > region.y
  );
}

export function cleanCardName(rawName: string): string {
  if (!rawName) return "";
  return rawName
    .replace(/^(BASE|BASIC|STAGE\s*[12]?)\s+/i, "")
    .trim();
}

export function getCandidateValidation(line: string): { valid: boolean; reason: string } {
  if (!line || line.length <= 1) {
    return { valid: false, reason: "empty" };
  }

  const upperLine = line.toUpperCase();
  if (INVALID_NAMES.has(upperLine)) {
    return { valid: false, reason: "numeric-like" };
  }

  // Check collector number pattern
  if (/\b\d{1,3}\/\d{1,3}\b/.test(line) || /\b\d{1,3}-\d{1,3}\b/.test(line)) {
    return { valid: false, reason: "collector-number" };
  }

  // Conservative sentence / description rejection rule
  const words = line.split(/\s+/);
  if (words.length > 4 || /[.,;:!?]/.test(line) || /\b(in|e|assegna|non|ecco|per)\b/i.test(line)) {
    return { valid: false, reason: "numeric-like" };
  }

  const letterCount = (line.match(/\p{L}/gu) || []).length;
  const digitCount = (line.match(/\d/g) || []).length;

  const stripped = line
    .replace(/\b(HP|PS)\b/gi, "")
    .replace(/[\s\p{P}\p{S}„•\-\d]/gu, "")
    .trim();

  if (stripped.length === 0 || digitCount >= letterCount) {
    return { valid: false, reason: "numeric-like" };
  }

  return { valid: true, reason: "none" };
}

function extractNameCandidate(blocks: TextBlock[], layout: CardLayout, imageWidth?: number, imageHeight?: number): string {
  const maxBlockX = blocks.reduce((max, b) => Math.max(max, (b.boundingBox?.x ?? 0) + (b.boundingBox?.width ?? 0)), 1000);
  const maxBlockY = blocks.reduce((max, b) => Math.max(max, (b.boundingBox?.y ?? 0) + (b.boundingBox?.height ?? 0)), 1400);
  const imgWidth = imageWidth ?? maxBlockX;
  const imgHeight = imageHeight ?? maxBlockY;

  for (const block of blocks) {
    const bx = block.boundingBox?.x ?? 0;
    const by = block.boundingBox?.y ?? 0;
    const bw = block.boundingBox?.width ?? 0;
    const bh = block.boundingBox?.height ?? 0;

    const normX = imgWidth > 0 ? bx / imgWidth : 0;
    const normY = imgHeight > 0 ? by / imgHeight : 0;
    const normW = imgWidth > 0 ? bw / imgWidth : 0;
    const normH = imgHeight > 0 ? bh / imgHeight : 0;

    const inNameRegion = isInsideRegion(normX, normY, normW, normH, layout.cardNameRegion);
    const inHpRegion = intersectsRegion(normX, normY, normW, normH, layout.hpRegion);

    if (inNameRegion && !inHpRegion) {
      const lines = block.text.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        const cleaned = cleanCardName(line);
        const val = getCandidateValidation(cleaned);
        if (val.valid) {
          console.log(`[OCR Debug] Region=cardNameRegion Candidate=${cleaned}`);
          return cleaned;
        } else {
          console.log(`[OCR Debug] Region=cardNameRegion RejectedCandidate=${cleaned} Reason=${val.reason}`);
          return cleaned;
        }
      }
    }
  }

  return "";
}

function extractFieldsWithLayout(
  blocks: TextBlock[],
  layout: CardLayout,
  rawText: string,
  validCandidate: string,
  imageWidth?: number,
  imageHeight?: number,
): OcrResult {
  const maxBlockX = blocks.reduce((max, b) => Math.max(max, (b.boundingBox?.x ?? 0) + (b.boundingBox?.width ?? 0)), 1000);
  const maxBlockY = blocks.reduce((max, b) => Math.max(max, (b.boundingBox?.y ?? 0) + (b.boundingBox?.height ?? 0)), 1400);
  const imgWidth = imageWidth ?? maxBlockX;
  const imgHeight = imageHeight ?? maxBlockY;

  const collectorNumberBlocks: TextBlock[] = [];
  const setCodeBlocks: TextBlock[] = [];

  for (const block of blocks) {
    const bx = block.boundingBox?.x ?? 0;
    const by = block.boundingBox?.y ?? 0;
    const bw = block.boundingBox?.width ?? 0;
    const bh = block.boundingBox?.height ?? 0;

    const normX = imgWidth > 0 ? bx / imgWidth : 0;
    const normY = imgHeight > 0 ? by / imgHeight : 0;
    const normW = imgWidth > 0 ? bw / imgWidth : 0;
    const normH = imgHeight > 0 ? bh / imgHeight : 0;

    if (isInsideRegion(normX, normY, normW, normH, layout.collectorNumberRegion)) {
      collectorNumberBlocks.push(block);
    }
    if (isInsideRegion(normX, normY, normW, normH, layout.setCodeRegion)) {
      setCodeBlocks.push(block);
    }
  }

  // 1. Collector Number Extraction
  let collectorNumber = "";
  const collectorText = collectorNumberBlocks.map((b) => b.text).join(" ");
  const collectorNumMatch =
    collectorText.match(/\b\d{1,3}\/\d{1,3}\b/) ||
    collectorText.match(/\b\d{1,3}-\d{1,3}\b/);

  if (collectorNumMatch) {
    collectorNumber = collectorNumMatch[0].replace("-", "/");
  }

  // 2. Set Code Extraction
  let setCode = "";
  const setCodeText = setCodeBlocks.map((b) => b.text).join(" ");
  for (const set of KNOWN_SETS) {
    if (new RegExp(`\\b${set}\\b`, "i").test(setCodeText)) {
      setCode = set;
      break;
    }
  }

  if (!setCode) {
    const potentialSetMatch = setCodeText.match(/\b([A-Z0-9]{3,5})(?:\s+[A-Z]{2})?\b/);
    if (
      potentialSetMatch &&
      potentialSetMatch[1] &&
      !KNOWN_SETS.has(potentialSetMatch[1].toUpperCase())
    ) {
      setCode = potentialSetMatch[1];
    }
  }

  const setCodeClean = setCode ? (setCode.split(/\s+/)[0] ?? setCode) : "";

  const nameValid = Boolean(validCandidate && getCandidateValidation(validCandidate).valid);
  const hasCompleteData = Boolean(
    collectorNumber && setCodeClean && nameValid,
  );
  const confidence = hasCompleteData ? "high" : "low";

  return {
    name: nameValid ? validCandidate : "",
    setCode: setCodeClean.toUpperCase(),
    collectorNumber,
    confidence,
    rawText,
  };
}

export function parseOcrText(
  recognitionResult: RecognitionResult | string,
  imageWidth?: number,
  imageHeight?: number,
): OcrResult {
  let rawText = "";
  let blocks: TextBlock[] = [];

  if (typeof recognitionResult === "string") {
    rawText = recognitionResult;
  } else {
    rawText = recognitionResult.text ?? "";
    blocks = recognitionResult.blocks ?? [];
  }

  const templatesToEvaluate: LayoutName[] = ["PokemonModern", "PokemonEX", "PokemonV"];
  let bestTemplate: LayoutName = "PokemonModern";
  let bestCandidate = "";
  let bestScore = -1;
  let validCandidatesCount = 0;

  for (const tmplName of templatesToEvaluate) {
    const layout = getLayoutByName(tmplName);
    const candidate = extractNameCandidate(blocks, layout, imageWidth, imageHeight);
    const cleaned = cleanCardName(candidate);
    const val = getCandidateValidation(cleaned);

    let score = 0;
    if (val.valid) {
      const letterCount = (cleaned.match(/\p{L}/gu) || []).length;
      score = 50 + Math.min(20, letterCount * 2);

      const hasExEvidence = /\bex\b/i.test(cleaned);
      const hasVEvidence = /\b(V|VMAX|VSTAR)\b/i.test(cleaned);

      if (tmplName === "PokemonEX") {
        if (hasExEvidence) {
          score += 40;
        } else {
          score = 0;
        }
      } else if (tmplName === "PokemonV") {
        if (hasVEvidence) {
          score += 40;
        } else {
          score = 0;
        }
      } else if (tmplName === "PokemonModern") {
        if (!hasExEvidence && !hasVEvidence) {
          score += 20;
        }
      }
    }

    const finalValid = val.valid && score > 0;
    if (finalValid) {
      validCandidatesCount++;
    }

    console.log(
      `[Template Candidate]\n\nTemplate:\n${tmplName}\n\nRaw Candidate:\n${candidate || "<empty>"}\n\nValid:\n${finalValid}\n\nRejection Reason:\n${finalValid ? "none" : val.reason}\n\nScore:\n${score}`
    );

    if (finalValid && score > bestScore) {
      bestScore = score;
      bestTemplate = tmplName;
      bestCandidate = cleaned;
    }
  }

  if (validCandidatesCount === 0 || bestScore <= 0) {
    console.log(
      `[Template Detection]\n\nLayout fallback:\nPokemonModern\n\nSelected Candidate:\n<empty>\n\nReason:\nno valid candidate`
    );
    return {
      name: "",
      setCode: "",
      collectorNumber: "",
      confidence: "low",
      rawText,
    };
  } else {
    console.log(
      `[Template Detection]\n\nValid detected template:\n${bestTemplate}\n\nSelected Candidate:\n${bestCandidate}\n\nReason:\nhighest valid candidate score`
    );
  }

  const selectedLayout = getLayoutByName(bestTemplate);
  return extractFieldsWithLayout(blocks, selectedLayout, rawText, bestCandidate, imageWidth, imageHeight);
}
