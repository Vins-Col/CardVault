import type { CardLayout } from "./layout-types";
import { getCalibratedTemplate } from "./layout-calibration";

const modernRef = getCalibratedTemplate("PokemonModern");
const exRef = getCalibratedTemplate("PokemonEX");
const vRef = getCalibratedTemplate("PokemonV");
const classicRef = getCalibratedTemplate("PokemonClassic");
const vintageRef = getCalibratedTemplate("PokemonVintage");

export const PokemonModernLayout: CardLayout = {
  gameId: modernRef.gameId,
  layoutName: modernRef.layoutName,
  cardNameRegion: modernRef.cardNameRegion,
  hpRegion: modernRef.hpRegion,
  setCodeRegion: modernRef.setCodeRegion,
  collectorNumberRegion: modernRef.collectorNumberRegion,
  get nameRegion() {
    return this.cardNameRegion;
  },
};

export const PokemonEXLayout: CardLayout = {
  gameId: exRef.gameId,
  layoutName: exRef.layoutName,
  cardNameRegion: exRef.cardNameRegion,
  hpRegion: exRef.hpRegion,
  setCodeRegion: exRef.setCodeRegion,
  collectorNumberRegion: exRef.collectorNumberRegion,
  get nameRegion() {
    return this.cardNameRegion;
  },
};

export const PokemonVLayout: CardLayout = {
  gameId: vRef.gameId,
  layoutName: vRef.layoutName,
  cardNameRegion: vRef.cardNameRegion,
  hpRegion: vRef.hpRegion,
  setCodeRegion: vRef.setCodeRegion,
  collectorNumberRegion: vRef.collectorNumberRegion,
  get nameRegion() {
    return this.cardNameRegion;
  },
};

export const PokemonClassicLayout: CardLayout = {
  gameId: classicRef.gameId,
  layoutName: classicRef.layoutName,
  cardNameRegion: classicRef.cardNameRegion,
  hpRegion: classicRef.hpRegion,
  setCodeRegion: classicRef.setCodeRegion,
  collectorNumberRegion: classicRef.collectorNumberRegion,
  get nameRegion() {
    return this.cardNameRegion;
  },
};

export const PokemonVintageLayout: CardLayout = {
  gameId: vintageRef.gameId,
  layoutName: vintageRef.layoutName,
  cardNameRegion: vintageRef.cardNameRegion,
  hpRegion: vintageRef.hpRegion,
  setCodeRegion: vintageRef.setCodeRegion,
  collectorNumberRegion: vintageRef.collectorNumberRegion,
  get nameRegion() {
    return this.cardNameRegion;
  },
};
