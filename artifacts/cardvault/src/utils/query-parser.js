"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSmartQuery = parseSmartQuery;

const LANGUAGE_MAP = {
    japanese: "ja",
    giapponese: "ja",
    giaponese: "ja",
    jp: "ja",
    ja: "ja",
    english: "en",
    inglese: "en",
    en: "en",
    french: "fr",
    francese: "fr",
    fr: "fr",
    german: "de",
    tedesco: "de",
    de: "de",
    italian: "it",
    italiano: "it",
    it: "it",
    spanish: "es",
    spagnolo: "es",
    es: "es",
    korean: "ko",
    coreano: "ko",
    ko: "ko",
    chinese: "zh-cn",
    cinese: "zh-cn",
    "traditional chinese": "zh-tw",
    "cinese tradizionale": "zh-tw",
    "simplified chinese": "zh-cn",
    "cinese semplificato": "zh-cn",
    zh: "zh-cn",
    "zh-tw": "zh-tw",
    "zh-cn": "zh-cn",
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
    "wcs23",
    "evs",
]);

const COLLECTOR_NUMBER_REGEX = /\b\d+(?:[\/\-]\d+)?\b/;

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

    const lowerWorking = workingQuery.toLowerCase();
    for (const [phrase, code] of Object.entries(LANGUAGE_MAP)) {
        if (phrase.includes(" ") && !language && lowerWorking.includes(phrase)) {
            language = code;
            workingQuery = workingQuery.replace(new RegExp(phrase, "gi"), " ");
            break;
        }
    }

    const numMatch = workingQuery.match(COLLECTOR_NUMBER_REGEX);
    if (numMatch) {
        collectorNumber = numMatch[0];
        workingQuery = workingQuery.replace(collectorNumber, " ");
    }

    const tokens = workingQuery
        .split(/\s+/)
        .filter((t) => t.length > 0);

    const remainingTokens = [];

    for (const token of tokens) {
        const lowerToken = token.toLowerCase();

        if (!language && LANGUAGE_MAP[lowerToken]) {
            language = LANGUAGE_MAP[lowerToken];
            continue;
        }

        if (!rarity && RARITY_KEYWORDS.has(lowerToken)) {
            rarity = lowerToken;
            continue;
        }

        if (!set && (SET_KEYWORDS.has(lowerToken) || (collectorNumber && /^[a-z0-9]{2,6}$/i.test(token)))) {
            set = token;
            continue;
        }

        remainingTokens.push(token);
    }

    let name = remainingTokens.join(" ").trim();
    if (!name && !collectorNumber && !rarity && !set && !language) {
        name = raw;
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
        name: name || (collectorNumber || rarity || set || language ? "" : raw),
        collectorNumber,
        language,
        rarity,
        set,
        keywords,
    };
}
