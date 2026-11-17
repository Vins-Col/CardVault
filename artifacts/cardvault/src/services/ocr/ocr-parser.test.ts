import { getCandidateValidation, parseOcrText, cleanCardName } from "./ocr-parser";

function assertEq(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message} (expected ${expected}, got ${actual})`);
  }
}

// 1. Name Cleanup & Prefix stripping
assertEq(cleanCardName("BASE Komala di Ubaldo"), "Komala di Ubaldo", "BASE prefix stripping");
assertEq(cleanCardName("BASIC Eevee"), "Eevee", "BASIC prefix stripping");
assertEq(cleanCardName("STAGE 1 Crobat"), "Crobat", "STAGE 1 prefix stripping");

// 2. Robust Name Validation & Invalid Candidates
const testCases = [
  { input: "-220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "„90", expectedValid: false, expectedReason: "numeric-like" },
  { input: "•220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "HP 220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "175/217", expectedValid: false, expectedReason: "collector-number" },
  { input: "Komala di Ubaldo", expectedValid: true, expectedReason: "none" },
  { input: "Mega Lucario ex", expectedValid: true, expectedReason: "none" },
  { input: "Hoopa V", expectedValid: true, expectedReason: "none" },
];

for (const tc of testCases) {
  const res = getCandidateValidation(tc.input);
  assertEq(res.valid, tc.expectedValid, `Validation failed for "${tc.input}"`);
  assertEq(res.reason, tc.expectedReason, `Reason failed for "${tc.input}"`);
}

// 3. All candidates invalid -> empty selected name and low confidence
const mockAllInvalid = {
  text: "-220 „90 175/217",
  blocks: [
    {
      text: "-220",
      boundingBox: { x: 10, y: 10, width: 100, height: 30 },
      lines: [],
    }
  ]
};

const resultInvalid = parseOcrText(mockAllInvalid);
assertEq(resultInvalid.name, "", "All invalid name empty");
assertEq(resultInvalid.confidence, "low", "All invalid confidence low");

// 4. Hoopa V -> PokemonV
const mockHoopaV = {
  text: "Hoopa V SWSH7 114/203",
  blocks: [
    {
      text: "Hoopa V",
      boundingBox: { x: 10, y: 10, width: 200, height: 40 },
      lines: [],
    }
  ]
};
const resultHoopa = parseOcrText(mockHoopaV);
assertEq(resultHoopa.name, "Hoopa V", "Hoopa V name");

console.log("All OCR stabilization test cases passed successfully!");
