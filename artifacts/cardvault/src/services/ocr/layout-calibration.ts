import type { GameId, LayoutName, LayoutRegion } from "./layout-types";
import pokemonModernTemplate from "../../../assets/card-templates/pokemon-modern-template.json";
import pokemonExTemplate from "../../../assets/card-templates/pokemon-ex-template.json";
import pokemonVTemplate from "../../../assets/card-templates/pokemon-v-template.json";

export interface ReferenceTemplate {
  templateId: string;
  gameId: GameId;
  layoutName: LayoutName;
  cardNameRegion: LayoutRegion;
  hpRegion: LayoutRegion;
  setCodeRegion: LayoutRegion;
  collectorNumberRegion: LayoutRegion;
}

const templateMap: Record<string, ReferenceTemplate> = {
  PokemonModern: pokemonModernTemplate as ReferenceTemplate,
  PokemonEX: pokemonExTemplate as ReferenceTemplate,
  PokemonV: pokemonVTemplate as ReferenceTemplate,
  PokemonClassic: pokemonModernTemplate as ReferenceTemplate,
  PokemonVintage: pokemonModernTemplate as ReferenceTemplate,
  YugiohModern: pokemonModernTemplate as ReferenceTemplate,
  MtgModern: pokemonModernTemplate as ReferenceTemplate,
  OnePieceModern: pokemonModernTemplate as ReferenceTemplate,
};

const sourceFileMap: Record<string, string> = {
  PokemonModern: "pokemon-modern-template.json",
  PokemonEX: "pokemon-ex-template.json",
  PokemonV: "pokemon-v-template.json",
};

let activeTemplate: ReferenceTemplate = templateMap.PokemonModern;

export function getCalibratedTemplate(layoutName: LayoutName = "PokemonModern"): ReferenceTemplate {
  const template = templateMap[layoutName] ?? templateMap.PokemonModern;
  activeTemplate = template;
  const sourceFile = sourceFileMap[template.layoutName] ?? "pokemon-modern-template.json";

  console.log(
    `[Template Runtime]\n\nLoaded template:\n${template.layoutName}\n\nSource:\n${sourceFile}`
  );

  return template;
}

export function loadCalibration(template: ReferenceTemplate): void {
  activeTemplate = template;
  const sourceFile = sourceFileMap[template.layoutName] ?? "pokemon-modern-template.json";
  console.log(
    `[Template Runtime]\n\nLoaded template:\n${template.layoutName}\n\nSource:\n${sourceFile}`
  );
}

export function getActiveTemplate(): ReferenceTemplate {
  return activeTemplate;
}
