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

// Collector Mode Test Cases (Search V2 Phase 1)
const c1 = parseSmartQuery("001/030");
assert.strictEqual(c1.collectorNumber, "001/030");

const c2 = parseSmartQuery("151/165");
assert.strictEqual(c2.collectorNumber, "151/165");

const c3 = parseSmartQuery("223/197");
assert.strictEqual(c3.collectorNumber, "223/197");

// Set + Number Priority Test Cases
const s1 = parseSmartQuery("WCS23 001");
assert.strictEqual(s1.set, "WCS23");
assert.strictEqual(s1.collectorNumber, "001");

const s2 = parseSmartQuery("MEW 183");
assert.strictEqual(s2.set, "MEW");
assert.strictEqual(s2.collectorNumber, "183");

const s3 = parseSmartQuery("EVS 111");
assert.strictEqual(s3.set, "EVS");
assert.strictEqual(s3.collectorNumber, "111");

// Search V2 Phase 2 Language Alias Test Cases
const l1 = parseSmartQuery("Rayquaza japanese");
assert.strictEqual(l1.name, "Rayquaza");
assert.strictEqual(l1.language, "ja");

const l2 = parseSmartQuery("Rayquaza giapponese");
assert.strictEqual(l2.name, "Rayquaza");
assert.strictEqual(l2.language, "ja");

const l3 = parseSmartQuery("Rayquaza english");
assert.strictEqual(l3.name, "Rayquaza");
assert.strictEqual(l3.language, "en");

const l4 = parseSmartQuery("Rayquaza italiano");
assert.strictEqual(l4.name, "Rayquaza");
assert.strictEqual(l4.language, "it");

console.log("All Search V2 Phase 1, Phase 2, & query parser assertions passed successfully!");
