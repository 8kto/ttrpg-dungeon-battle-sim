/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Dice } from '../shared/dice.js?v=$VERSION$'

/**
 * @typedef {Object} CharacterClassDef
 * @property {PrimeAttribute[]} PrimeAttr
 * @property {PrimeAttribute[]} [StrictAttr]
 * @property {DiceKind} HitDice
 * @property {string} ArmorPermitted
 * @property {string} WeaponsPermitted
 * @property {CharacterRace[]} Race
 * @property {boolean} isCaster
 * @property {string} $meta
 */

/**
 * @typedef {'Assassin' | 'Cleric' | 'Druid' | 'Fighter' | 'MagicUser' | 'Monk' | 'Paladin' | 'Ranger' | 'Thief'} CharacterClass
 * @typedef {'Human' | 'Dwarf' | 'Elf' | 'HalfElf' | 'Hobbit'} CharacterRace
 * @typedef {'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma'} CharacterAttrScore
 * @typedef {[CharacterAttrScore, number]} PrimeAttribute
 */

/**
 * @type {Record<CharacterClass, CharacterClass>}
 */
export const CharacterClass = {
  Assassin: 'Assassin',
  Cleric: 'Cleric',
  Druid: 'Druid',
  Fighter: 'Fighter',
  MagicUser: 'MagicUser',
  Monk: 'Monk',
  Paladin: 'Paladin',
  Ranger: 'Ranger',
  Thief: 'Thief',
}

/**
 * @type {Record<CharacterRace, CharacterRace>}
 */
export const CharacterRace = {
  Human: 'Human',
  Dwarf: 'Dwarf',
  Elf: 'Elf',
  HalfElf: 'HalfElf',
  Hobbit: 'Hobbit',
}

/**
 * @type {Record<CharacterAttrScore, CharacterAttrScore>}
 */
export const CharacterAttrScore = {
  Strength: 'Strength',
  Dexterity: 'Dexterity',
  Constitution: 'Constitution',
  Intelligence: 'Intelligence',
  Wisdom: 'Wisdom',
  Charisma: 'Charisma',
}

export const ANY_RACE = Object.values(CharacterRace)

export const PRIME_ATTR_MIN = 13

/**
 * @type {Record<CharacterClass, CharacterClassDef>}
 */
export const characterClasses = {
  [CharacterClass.Assassin]: {
    PrimeAttr: [
      [CharacterAttrScore.Strength, PRIME_ATTR_MIN],
      [CharacterAttrScore.Dexterity, PRIME_ATTR_MIN],
      [CharacterAttrScore.Intelligence, PRIME_ATTR_MIN],
    ],
    // wait...
    StrictAttr: [
      [CharacterAttrScore.Strength, 12],
      [CharacterAttrScore.Dexterity, 12],
      [CharacterAttrScore.Intelligence, 12],
    ],
    HitDice: Dice.d6,
    ArmorPermitted: 'Leather armor only, shield permitted.',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
  },
  [CharacterClass.Cleric]: {
    PrimeAttr: [[CharacterAttrScore.Wisdom, PRIME_ATTR_MIN]],
    HitDice: Dice.d6,
    ArmorPermitted:
      'Blunt weapons only (club, flail, hammer, mace, staff, etc.). No missile weapons, other than oil or slings if the Referee permits.',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human, CharacterRace.HalfElf],
  },
  [CharacterClass.Druid]: {
    PrimeAttr: [
      [CharacterAttrScore.Wisdom, PRIME_ATTR_MIN],
      [CharacterAttrScore.Charisma, PRIME_ATTR_MIN],
    ],
    StrictAttr: [
      [CharacterAttrScore.Wisdom, 12],
      [CharacterAttrScore.Charisma, 14],
    ],
    HitDice: Dice.d6,
    ArmorPermitted: 'Leather armor, wooden shield',
    WeaponsPermitted: 'Dagger, sickle-shaped sword (treat as short sword), spear, sling, oil',
    Race: [CharacterRace.Human],
  },
  [CharacterClass.Fighter]: {
    PrimeAttr: [[CharacterAttrScore.Strength, PRIME_ATTR_MIN]],
    HitDice: Dice.d8,
    ArmorPermitted: 'All',
    WeaponsPermitted: 'All',
    Race: ANY_RACE,
  },
  [CharacterClass.MagicUser]: {
    PrimeAttr: [[CharacterAttrScore.Intelligence, PRIME_ATTR_MIN]],
    HitDice: Dice.d4,
    ArmorPermitted: 'None',
    WeaponsPermitted: 'Dagger, staff, and darts',
    Race: [CharacterRace.Elf, CharacterRace.HalfElf, CharacterRace.Human],
  },
  [CharacterClass.Monk]: {
    PrimeAttr: [[CharacterAttrScore.Wisdom, PRIME_ATTR_MIN]],
    StrictAttr: [
      [CharacterAttrScore.Strength, 12],
      [CharacterAttrScore.Dexterity, 15],
      [CharacterAttrScore.Wisdom, 15],
    ],
    HitDice: Dice.d4,
    ArmorPermitted: 'None',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
  },
  [CharacterClass.Paladin]: {
    PrimeAttr: [[CharacterAttrScore.Strength, PRIME_ATTR_MIN]],
    StrictAttr: [[CharacterAttrScore.Charisma, 17]],
    HitDice: Dice.d8,
    ArmorPermitted: 'All',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
  },
  [CharacterClass.Ranger]: {
    PrimeAttr: [[CharacterAttrScore.Strength, PRIME_ATTR_MIN]],
    StrictAttr: [
      [CharacterAttrScore.Constitution, 15],
      [CharacterAttrScore.Intelligence, 12],
      [CharacterAttrScore.Wisdom, 12],
    ],
    HitDice: Dice.d8,
    ArmorPermitted: 'All',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
    $meta: '2d8 at first level, 1d8/level thereafter',
  },
  [CharacterClass.Thief]: {
    PrimeAttr: [[CharacterAttrScore.Dexterity, PRIME_ATTR_MIN]],
    HitDice: Dice.d4,
    ArmorPermitted: 'Leather armor only; no shield',
    WeaponsPermitted: 'All, but magical weapons are limited to daggers and swords',
    Race: ANY_RACE,
  },
}
