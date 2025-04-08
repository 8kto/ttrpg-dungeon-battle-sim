import { Dice } from '../../domain/Dice'
import type { CharacterClassDef } from '../../domain/snw/CharacterClass'
import { Alignment, AttrScore, CharacterClass, CharacterRace } from '../../domain/snw/CharacterClass'
import { ClericSavingThrows, FightersSavingThrows, MagicUsersSavingThrows } from './SavingThrows'

export const ANY_RACE = Object.values(CharacterRace) as CharacterRace[]

export const ANY_ALIGNMENT = Object.values(Alignment) as Alignment[]

export const PRIME_ATTR_MIN = 13

const AssassinClassDef: CharacterClassDef = {
  name: CharacterClass.Assassin,
  PrimeAttr: [
    [AttrScore.Strength, PRIME_ATTR_MIN],
    [AttrScore.Dexterity, PRIME_ATTR_MIN],
    [AttrScore.Intelligence, PRIME_ATTR_MIN],
  ],
  StrictAttr: [
    [AttrScore.Strength, 12],
    [AttrScore.Dexterity, 12],
    [AttrScore.Intelligence, 12],
  ],
  SavingThrow: { snw: { value: 15, details: null }, alternative: MagicUsersSavingThrows },
  HitDice: Dice.d6,
  ArmorPermitted: 'Leather armor only, shield permitted',
  WeaponsPermitted: 'Any',
  Race: [CharacterRace.Human],
  Alignment: [Alignment.Neutral, Alignment.Chaotic],
}

const ClericClassDef: CharacterClassDef = {
  name: CharacterClass.Cleric,
  PrimeAttr: [[AttrScore.Wisdom, PRIME_ATTR_MIN]],
  SavingThrow: {
    snw: { value: 15, details: '+2 against being paralyzed or poisoned' },
    alternative: ClericSavingThrows,
  },
  HitDice: Dice.d6,
  ArmorPermitted: 'Any',
  WeaponsPermitted:
    'Blunt weapons only (club, flail, hammer, mace, staff, etc.). ' +
    'No missile weapons other than oil or slings if the Referee permits.',
  Race: [CharacterRace.Human, CharacterRace.HalfElf],
  Alignment: [Alignment.Lawful, Alignment.Chaotic],
  $isCaster: true,
  $spellsAtTheFirstLevel: 0,
}

const DruidClassDef: CharacterClassDef = {
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
  SavingThrow: { snw: { value: 15, details: '+2 bonus against fire' }, alternative: ClericSavingThrows },
  ArmorPermitted: 'Leather armor, wooden shield',
  WeaponsPermitted: 'Dagger, sickle-shaped sword (treat as short sword), spear, sling, oil',
  Race: [CharacterRace.Human],
  Alignment: [Alignment.Neutral],
  $isCaster: true,
  $spellsAtTheFirstLevel: 1,
}

const FighterClassDef: CharacterClassDef = {
  name: CharacterClass.Fighter,
  PrimeAttr: [[AttrScore.Strength, PRIME_ATTR_MIN]],
  SavingThrow: {
    snw: {
      value: 15,
      details: '+1 bonus on all saving throws except against spells (including those from wands and staffs)',
    },
    alternative: FightersSavingThrows,
  },
  HitDice: Dice.d8,
  ArmorPermitted: 'Any',
  WeaponsPermitted: 'Any',
  Race: ANY_RACE,
  Alignment: ANY_ALIGNMENT,
}

const MagicUserClassDef: CharacterClassDef = {
  name: CharacterClass.MagicUser,
  PrimeAttr: [[AttrScore.Intelligence, PRIME_ATTR_MIN]],
  SavingThrow: {
    snw: { value: 15, details: '+2 against spells, including spells from magic wands and staffs' },
    alternative: MagicUsersSavingThrows,
  },
  HitDice: Dice.d4,
  ArmorPermitted: 'None',
  WeaponsPermitted: 'Dagger, staff, and darts',
  Race: [CharacterRace.Elf, CharacterRace.HalfElf, CharacterRace.Human],
  Alignment: ANY_ALIGNMENT,
  $isCaster: true,
  $spellsAtTheFirstLevel: 1,
}

const MonkClassDef: CharacterClassDef = {
  name: CharacterClass.Monk,
  PrimeAttr: [[AttrScore.Wisdom, PRIME_ATTR_MIN]],
  StrictAttr: [
    [AttrScore.Strength, 12],
    [AttrScore.Dexterity, 15],
    [AttrScore.Wisdom, 15],
  ],
  SavingThrow: {
    snw: { value: 15, details: '+2 bonus against paralysis and poisons (when Wisdom is 12+)' },
    alternative: ClericSavingThrows,
  },
  HitDice: Dice.d4,
  ArmorPermitted: 'None',
  WeaponsPermitted: 'Any',
  Race: [CharacterRace.Human],
  Alignment: ANY_ALIGNMENT,
}

const PaladinClassDef: CharacterClassDef = {
  name: CharacterClass.Paladin,
  PrimeAttr: [[AttrScore.Strength, PRIME_ATTR_MIN]],
  StrictAttr: [[AttrScore.Charisma, 17]],
  SavingThrow: { snw: { value: 12, details: null }, alternative: FightersSavingThrows },
  HitDice: Dice.d8,
  ArmorPermitted: 'Any',
  WeaponsPermitted: 'Any',
  Race: [CharacterRace.Human],
  Alignment: [Alignment.Lawful],
}

const RangerClassDef: CharacterClassDef = {
  name: CharacterClass.Ranger,
  PrimeAttr: [[AttrScore.Strength, PRIME_ATTR_MIN]],
  StrictAttr: [
    [AttrScore.Constitution, 15],
    [AttrScore.Intelligence, 12],
    [AttrScore.Wisdom, 12],
  ],
  SavingThrow: { snw: { value: 14, details: null }, alternative: FightersSavingThrows },
  HitDice: Dice.d8,
  ArmorPermitted: 'Any',
  WeaponsPermitted: 'Any',
  Race: [CharacterRace.Human],
  Alignment: [Alignment.Lawful],
  $meta: '2d8 at first level, 1d8/level thereafter',
}

const ThiefClassDef: CharacterClassDef = {
  name: CharacterClass.Thief,
  PrimeAttr: [[AttrScore.Dexterity, PRIME_ATTR_MIN]],
  SavingThrow: {
    snw: {
      value: 15,
      details: '+2 against devices, including traps, magical wands or staffs, and other magical devices',
    },
    alternative: MagicUsersSavingThrows,
  },
  HitDice: Dice.d4,
  ArmorPermitted: 'Leather armor only; no shield',
  WeaponsPermitted: 'All, but magical weapons are limited to daggers and swords',
  Race: ANY_RACE,
  Alignment: [Alignment.Neutral, Alignment.Chaotic],
}

/**
 * Record for Character Class Definitions
 */
export const CharacterClasses: Record<CharacterClass, CharacterClassDef> = {
  [CharacterClass.Assassin]: AssassinClassDef,
  [CharacterClass.Cleric]: ClericClassDef,
  [CharacterClass.Druid]: DruidClassDef,
  [CharacterClass.Fighter]: FighterClassDef,
  [CharacterClass.MagicUser]: MagicUserClassDef,
  [CharacterClass.Monk]: MonkClassDef,
  [CharacterClass.Paladin]: PaladinClassDef,
  [CharacterClass.Ranger]: RangerClassDef,
  [CharacterClass.Thief]: ThiefClassDef,
}
