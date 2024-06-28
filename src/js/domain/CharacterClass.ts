import { Dice } from './Dice'

/**
 * Enum for Character Classes
 */
export enum CharacterClass {
  Assassin = 'Assassin',
  Cleric = 'Cleric',
  Druid = 'Druid',
  Fighter = 'Fighter',
  MagicUser = 'MagicUser',
  Monk = 'Monk',
  Paladin = 'Paladin',
  Ranger = 'Ranger',
  Thief = 'Thief',
}

/**
 * Enum for Character Races
 */
export enum CharacterRace {
  Human = 'Human',
  Dwarf = 'Dwarf',
  Elf = 'Elf',
  HalfElf = 'HalfElf',
  Hobbit = 'Hobbit',
}

/**
 * Enum for Attribute Scores
 */
export enum AttrScore {
  Strength = 'Strength',
  Dexterity = 'Dexterity',
  Constitution = 'Constitution',
  Intelligence = 'Intelligence',
  Wisdom = 'Wisdom',
  Charisma = 'Charisma',
}

/**
 * Enum for Alignments
 */
export enum Alignment {
  Chaotic = 'Chaotic',
  Neutral = 'Neutral',
  Lawful = 'Lawful',
}

/**
 * Type for Prime Attribute
 */
export type PrimeAttribute = [AttrScore, number]

/**
 * Interface for Character Class Definition
 */
export interface CharacterClassDef {
  name: CharacterClass
  PrimeAttr: PrimeAttribute[]
  StrictAttr?: PrimeAttribute[]
  HitDice: Dice
  ArmorPermitted: string
  WeaponsPermitted: string
  Race: CharacterRace[]
  Alignment: Alignment[]
  $isCaster?: boolean
  $spellsAtTheFirstLevel?: number
  $meta?: string
}
