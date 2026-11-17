import { getCandidateValidation, parseOcrText } from "../src/services/ocr/ocr-parser";

function assertEq(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message} (expected ${expected}, got ${actual})`);
  }
}

// Test Part 1 & Part 6: Robust Name Validation
const testCases = [
  { input: "-220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "„220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "•220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "HP 220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "HP220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "340 HP", expectedValid: false, expectedReason: "numeric-like" },
  { input: "175/217", expectedValid: false, expectedReason: "collector-number" },
  { input: "Hoopa V", expectedValid: true, expectedReason: "none" },
  { input: "Mega Lucario ex", expectedValid: true, expectedReason: "none" },
  { input: "Komala di Ubaldo", expectedValid: true, expectedReason: "none" },
  { input: "ピカチュウex", expectedValid: true, expectedReason: "none" },
];

for (const tc of testCases) {
  const res = getCandidateValidation(tc.input);
  assertEq(res.valid, tc.expectedValid, `Validation failed for "${tc.input}"`);
  assertEq(res.reason, tc.expectedReason, `Reason failed for "${tc.input}"`);
}

console.log("All name validation test cases passed successfully!");

// Test parseOcrText with mock OCR recognition result for Hoopa V
const mockHoopaResult = {
  text: "Hoopa V SWSH7 114/203",
  blocks: [
    {
      text: "Hoopa V",
      boundingBox: { x: 10, y: 10, width: 200, height: 40 },
      lines: [],
    },
    {
      text: "SWSH7",
      boundingBox: { x: 100, y: 800, width: 100, height: 30 },
      lines: [],
    },
    {
      text: "114/203",
      boundingBox: { x: 600, y: 800, width: 150, height: 30 },
      lines: [],
    }
  ]
};

const ocrResultHoopa = parseOcrText(mockHoopaResult);
assertEq(ocrResultHoopa.name, "Hoopa V", "Hoopa V name extraction");
assertEq(ocrResultHoopa.setCode, "SWSH7", "Hoopa V setCode extraction");
assertEq(ocrResultHoopa.collectorNumber, "114/203", "Hoopa V collectorNumber extraction");
assertEq(ocrResultHoopa.confidence, "high", "Hoopa V confidence");

console.log("Hoopa V mock OCR parse test passed successfully!");
