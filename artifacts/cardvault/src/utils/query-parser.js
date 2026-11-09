"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSmartQuery = parseSmartQuery;
const LANGUAGE_MAP = {
    japanese: "ja",
    jp: "ja",
    ja: "ja",
    english: "en",
    en: "en",
    french: "fr",
    fr: "fr",
    german: "de",
    de: "de",
    italian: "it",
    it: "it",
    spanish: "es",
    es: "es",
    korean: "ko",
    ko: "ko",
    chinese: "zh-cn",
    zh: "zh-cn",
};
const RARITY_KEYWORDS = new Set([
    "ex",
    "gx",
    "v",
    "vmax",
    "vstar",
    "promo",
    "holo",
    "reverse holo",
    "secret",
    "radiant",
    "shiny",
    "illustration rare",
    "special illustration rare",
]);
const SET_KEYWORDS = new Set([
    "anniversary",
    "celebrations",
    "base",
    "jungle",
    "fossil",
    "evolutions",
    "paradox",
    "obsidian",
    "destinies",
    "zenith",
    "151",
]);
const COLLECTOR_NUMBER_REGEX = /\b\d+(?:\/\d+)?\b/;
function parseSmartQuery(rawQuery) {
    const raw = rawQuery.trim();
    if (!raw) {
        return {
            raw: "",
            name: "",
            keywords: [],
        };
    }
    let workingQuery = raw;
    let collectorNumber;
    let language;
    let rarity;
    let set;
    // 1. Extract collector number (e.g. 001/130 or 151)
    const numMatch = workingQuery.match(COLLECTOR_NUMBER_REGEX);
    if (numMatch) {
        collectorNumber = numMatch[0];
        workingQuery = workingQuery.replace(collectorNumber, " ");
    }
    // Tokenize remaining words
    const tokens = workingQuery
        .split(/\s+/)
        .filter((t) => t.length > 0);
    const remainingTokens = [];
    for (const token of tokens) {
        const lowerToken = token.toLowerCase();
        // Check language
        if (!language && LANGUAGE_MAP[lowerToken]) {
            language = LANGUAGE_MAP[lowerToken];
            continue;
        }
        // Check rarity
        if (!rarity && RARITY_KEYWORDS.has(lowerToken)) {
            rarity = lowerToken;
            continue;
        }
        // Check set
        if (!set && SET_KEYWORDS.has(lowerToken)) {
            set = lowerToken;
            continue;
        }
        remainingTokens.push(token);
    }
    // Handle multi-word phrases for rarity or set if needed (e.g., "illustration rare")
    // For simplicity and robustness, we can also check combined remaining tokens or phrases
    let name = remainingTokens.join(" ").trim();
    if (!name && collectorNumber) {
        name = collectorNumber;
        collectorNumber = undefined;
    }
    const keywords = [
        name,
        collectorNumber,
        language,
        rarity,
        set,
    ].filter((k) => typeof k === "string" && k.length > 0);
    return {
        raw,
        name: name || raw,
        collectorNumber,
        language,
        rarity,
        set,
        keywords,
    };
}
