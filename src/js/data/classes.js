/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Dice } from '../shared/dice.js?v=$VERSION$'

/**
 * @typedef CharacterClassDef
 * @property {CharacterClass} name
 * @property {Array<PrimeAttribute>} PrimeAttr
 * @property {Array<PrimeAttribute>} [StrictAttr]
 * @property {DiceKind} HitDice
 * @property {string} ArmorPermitted
 * @property {string} WeaponsPermitted
 * @property {Array<CharacterRace>} Race
 * @property {Array<Alignment>} Alignment
 * @property {boolean} [$isCaster]
 * @property {number} [$spellsAtTheFirstLevel]
 * @property {string} [$meta]
 */

/**
 * @typedef {'Assassin' | 'Cleric' | 'Druid' | 'Fighter' | 'MagicUser' | 'Monk' | 'Paladin' | 'Ranger' | 'Thief'} CharacterClass
 * @typedef {'Human' | 'Dwarf' | 'Elf' | 'HalfElf' | 'Hobbit'} CharacterRace
 * @typedef {'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma'} AttrScore
 * @typedef {'Chaos' | 'Neutral' | 'Lawful'} Alignment
 * @typedef {[AttrScore, number]} PrimeAttribute
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
 * @type {Record<AttrScore, AttrScore>}
 */
export const AttrScore = {
  Strength: 'Strength',
  Dexterity: 'Dexterity',
  Constitution: 'Constitution',
  Intelligence: 'Intelligence',
  Wisdom: 'Wisdom',
  Charisma: 'Charisma',
}

export const Alignment = {
  Lawful: 'Lawful',
  Neutral: 'Neutral',
  Chaotic: 'Chaotic',
}

export const ANY_RACE = Object.values(CharacterRace)
export const ANY_ALIGNMENT = Object.values(Alignment)

export const PRIME_ATTR_MIN = 13

/**
 * @type {Record<CharacterClass, CharacterClassDef>}
 */
export const characterClasses = {
  [CharacterClass.Assassin]: {
    name: CharacterClass.Assassin,
    PrimeAttr: [
      [AttrScore.Strength, PRIME_ATTR_MIN],
      [AttrScore.Dexterity, PRIME_ATTR_MIN],
      [AttrScore.Intelligence, PRIME_ATTR_MIN],
    ],
    // wait...
    StrictAttr: [
      [AttrScore.Strength, 12],
      [AttrScore.Dexterity, 12],
      [AttrScore.Intelligence, 12],
    ],
    HitDice: Dice.d6,
    ArmorPermitted: 'Leather armor only, shield permitted.',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
    Alignment: [Alignment.Neutral, Alignment.Chaotic],
  },
  [CharacterClass.Cleric]: {
    name: CharacterClass.Cleric,
    PrimeAttr: [[AttrScore.Wisdom, PRIME_ATTR_MIN]],
    HitDice: Dice.d6,
    ArmorPermitted:
      'Blunt weapons only (club, flail, hammer, mace, staff, etc.). No missile weapons, other than oil or slings if the Referee permits.',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human, CharacterRace.HalfElf],
    Alignment: [Alignment.Lawful, Alignment.Chaotic],
    $isCaster: true,
    $spellsAtTheFirstLevel: 0,
  },
  [CharacterClass.Druid]: {
    name: CharacterClass.Druid,
    PrimeAttr: [
      [AttrScore.Wisdom, PRIME_ATTR_MIN],
      [AttrScore.Charisma, PRIME_ATTR_MIN],
    ],
    StrictAttr: [
      [AttrScore.Wisdom, 12],
      [AttrScore.Charisma, 14],
    ],
    HitDice: Dice.d6,
    ArmorPermitted: 'Leather armor, wooden shield',
    WeaponsPermitted: 'Dagger, sickle-shaped sword (treat as short sword), spear, sling, oil',
    Race: [CharacterRace.Human],
    Alignment: [Alignment.Neutral],
    $isCaster: true,
    $spellsAtTheFirstLevel: 1,
  },
  [CharacterClass.Fighter]: {
    name: CharacterClass.Fighter,
    PrimeAttr: [[AttrScore.Strength, PRIME_ATTR_MIN]],
    HitDice: Dice.d8,
    ArmorPermitted: 'All',
    WeaponsPermitted: 'All',
    Race: ANY_RACE,
    Alignment: ANY_ALIGNMENT,
  },
  [CharacterClass.MagicUser]: {
    name: CharacterClass.MagicUser,
    PrimeAttr: [[AttrScore.Intelligence, PRIME_ATTR_MIN]],
    HitDice: Dice.d4,
    ArmorPermitted: 'None',
    WeaponsPermitted: 'Dagger, staff, and darts',
    Race: [CharacterRace.Elf, CharacterRace.HalfElf, CharacterRace.Human],
    Alignment: ANY_ALIGNMENT,
    $isCaster: true,
    $spellsAtTheFirstLevel: 1,
  },
  [CharacterClass.Monk]: {
    name: CharacterClass.Monk,
    PrimeAttr: [[AttrScore.Wisdom, PRIME_ATTR_MIN]],
    StrictAttr: [
      [AttrScore.Strength, 12],
      [AttrScore.Dexterity, 15],
      [AttrScore.Wisdom, 15],
    ],
    HitDice: Dice.d4,
    ArmorPermitted: 'None',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
    Alignment: ANY_ALIGNMENT,
  },
  [CharacterClass.Paladin]: {
    name: CharacterClass.Paladin,
    PrimeAttr: [[AttrScore.Strength, PRIME_ATTR_MIN]],
    StrictAttr: [[AttrScore.Charisma, 17]],
    HitDice: Dice.d8,
    ArmorPermitted: 'All',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
    Alignment: [Alignment.Lawful],
  },
  [CharacterClass.Ranger]: {
    name: CharacterClass.Ranger,
    PrimeAttr: [[AttrScore.Strength, PRIME_ATTR_MIN]],
    StrictAttr: [
      [AttrScore.Constitution, 15],
      [AttrScore.Intelligence, 12],
      [AttrScore.Wisdom, 12],
    ],
    HitDice: Dice.d8,
    ArmorPermitted: 'All',
    WeaponsPermitted: 'All',
    Race: [CharacterRace.Human],
    Alignment: [Alignment.Lawful],
    $meta: '2d8 at first level, 1d8/level thereafter',
  },
  [CharacterClass.Thief]: {
    name: CharacterClass.Thief,
    PrimeAttr: [[AttrScore.Dexterity, PRIME_ATTR_MIN]],
    HitDice: Dice.d4,
    ArmorPermitted: 'Leather armor only; no shield',
    WeaponsPermitted: 'All, but magical weapons are limited to daggers and swords',
    Race: ANY_RACE,
    Alignment: [Alignment.Neutral, Alignment.Chaotic],
  },
}

// console.log(
//   JSON.stringify(
//     Object.values(characterClasses).map(({ name, PrimeAttr }) => {
//       return {
//         name,
//         PrimeAttr: PrimeAttr.map(([k, v]) => String(k)).join(', '),
//       }
//     }),
//     null,
//     2,
//   ),
// )
