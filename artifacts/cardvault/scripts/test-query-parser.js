const { parseSmartQuery } = require('../src/utils/query-parser');
const assert = require('assert');

// Assertions
const r1 = parseSmartQuery("Pikachu");
assert.strictEqual(r1.name, "Pikachu");

const r2 = parseSmartQuery("Pikachu 001/130");
assert.strictEqual(r2.name, "Pikachu");
assert.strictEqual(r2.collectorNumber, "001/130");

const r3 = parseSmartQuery("Charizard ex");
assert.strictEqual(r3.name, "Charizard");
assert.strictEqual(r3.rarity, "ex");

const r4 = parseSmartQuery("Mew japanese");
assert.strictEqual(r4.name, "Mew");
assert.strictEqual(r4.language, "ja");

const r5 = parseSmartQuery("Pikachu promo");
assert.strictEqual(r5.name, "Pikachu");
assert.strictEqual(r5.rarity, "promo");

const r6 = parseSmartQuery("Pikachu anniversary");
assert.strictEqual(r6.name, "Pikachu");
assert.strictEqual(r6.set, "anniversary");

// New Phase 2D Test Cases
const t1 = parseSmartQuery("Pikachu giapponese");
assert.strictEqual(t1.name, "Pikachu");
assert.strictEqual(t1.language, "ja");

const t2 = parseSmartQuery("Pikachu japanese");
assert.strictEqual(t2.name, "Pikachu");
assert.strictEqual(t2.language, "ja");

const t3 = parseSmartQuery("Pikachu inglese");
assert.strictEqual(t3.name, "Pikachu");
assert.strictEqual(t3.language, "en");

const t4 = parseSmartQuery("Pikachu french");
assert.strictEqual(t4.name, "Pikachu");
assert.strictEqual(t4.language, "fr");

const t5 = parseSmartQuery("001");
assert.strictEqual(t5.name, "");
assert.strictEqual(t5.collectorNumber, "001");

const t6 = parseSmartQuery("001/030");
assert.strictEqual(t6.name, "");
assert.strictEqual(t6.collectorNumber, "001/030");

const t7 = parseSmartQuery("Pikachu 001");
assert.strictEqual(t7.name, "Pikachu");
assert.strictEqual(t7.collectorNumber, "001");

const t8 = parseSmartQuery("Pikachu 001/030");
assert.strictEqual(t8.name, "Pikachu");
assert.strictEqual(t8.collectorNumber, "001/030");

console.log("All Phase 2D query parser assertions passed successfully!");
