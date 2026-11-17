const { getCandidateValidation, parseOcrText } = require('../src/services/ocr/ocr-parser');
const assert = require('assert');

// Test Part 1: Robust Name Validation
const testCases = [
  { input: "-220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "„220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "HP 220", expectedValid: false, expectedReason: "numeric-like" },
  { input: "175/217", expectedValid: false, expectedReason: "collector-number" },
  { input: "Hoopa V", expectedValid: true, expectedReason: "none" },
  { input: "Mega Lucario ex", expectedValid: true, expectedReason: "none" },
  { input: "Komala di Ubaldo", expectedValid: true, expectedReason: "none" },
  { input: "ピカチュウex", expectedValid: true, expectedReason: "none" },
];

for (const tc of testCases) {
  const res = getCandidateValidation(tc.input);
  assert.strictEqual(
    res.valid,
    tc.expectedValid,
    `Validation failed for "${tc.input}": expected valid=${tc.expectedValid}, got ${res.valid}`
  );
  assert.strictEqual(
    res.reason,
    tc.expectedReason,
    `Reason failed for "${tc.input}": expected reason=${tc.expectedReason}, got ${res.reason}`
  );
}

console.log("All name validation test cases passed successfully!");

// Test parseOcrText with mock OCR recognition result
const mockRecognitionResult = {
  text: "Hoopa V SWSH7 114/203",
  blocks: [
    {
      text: "Hoopa V",
      boundingBox: { x: 10, y: 10, width: 200, height: 40 },
    },
    {
      text: "SWSH7",
      boundingBox: { x: 100, y: 800, width: 100, height: 30 },
    },
    {
      text: "114/203",
      boundingBox: { x: 600, y: 800, width: 150, height: 30 },
    }
  ]
};

const ocrResult = parseOcrText(mockRecognitionResult);
assert.strictEqual(ocrResult.name, "Hoopa V");
assert.strictEqual(ocrResult.setCode, "SWSH7");
assert.strictEqual(ocrResult.collectorNumber, "114/203");

console.log("Mock OCR parse test passed successfully!");
