export interface ParsedQuery {
  raw: string;
  name: string;
  collectorNumber?: string;
  language?: string;
  rarity?: string;
  set?: string;
  keywords: readonly string[];
}

const LANGUAGE_MAP: Record<string, string> = {
  japanese: "ja",
  giapponese: "ja",
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
]);

const COLLECTOR_NUMBER_REGEX = /\b\d+(?:\/\d+)?\b/;

export function parseSmartQuery(rawQuery: string): ParsedQuery {
  const raw = rawQuery.trim();
  if (!raw) {
    return {
      raw: "",
      name: "",
      keywords: [],
    };
  }

  let workingQuery = raw;
  let collectorNumber: string | undefined;
  let language: string | undefined;
  let rarity: string | undefined;
  let set: string | undefined;

  // Check multi-word language phrases first
  const lowerWorking = workingQuery.toLowerCase();
  for (const [phrase, code] of Object.entries(LANGUAGE_MAP)) {
    if (phrase.includes(" ") && !language && lowerWorking.includes(phrase)) {
      language = code;
      workingQuery = workingQuery.replace(new RegExp(phrase, "gi"), " ");
      break;
    }
  }

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

  const remainingTokens: string[] = [];

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
  ].filter((k): k is string => typeof k === "string" && k.length > 0);

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
