export const OWNED_CARD_LANGUAGES = [
  "Italian",
  "English",
  "Japanese",
  "French",
  "German",
  "Spanish",
  "Korean",
  "Chinese",
] as const;

export type OwnedCardLanguage = (typeof OWNED_CARD_LANGUAGES)[number];
