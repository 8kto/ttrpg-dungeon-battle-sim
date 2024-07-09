import { CharacterClass, CharacterClassDef } from '../../domain/snw/CharacterClass'
import { CharacterStats } from '../../domain/snw/CharacterStats'
import { assert } from '../assert'

const ALTERNATE_QUICK_AAC_TO_HIT: Record<number, Record<CharacterClass, number>> = {
  1: {
    [CharacterClass.Assassin]: 0,
    [CharacterClass.Cleric]: 0,
    [CharacterClass.Druid]: 0,
    [CharacterClass.Fighter]: 0,
    [CharacterClass.MagicUser]: 0,
    [CharacterClass.Monk]: 0,
    [CharacterClass.Paladin]: 0,
    [CharacterClass.Ranger]: 0,
    [CharacterClass.Thief]: 0,
  },
  // Below are not used ATM, since the char generator supports only 1st level chars
  2: {
    [CharacterClass.Assassin]: 0,
    [CharacterClass.Cleric]: 0,
    [CharacterClass.Druid]: 0,
    [CharacterClass.Fighter]: 0,
    [CharacterClass.MagicUser]: 0,
    [CharacterClass.Monk]: 0,
    [CharacterClass.Paladin]: 0,
    [CharacterClass.Ranger]: 0,
    [CharacterClass.Thief]: 0,
  },
  3: {
    [CharacterClass.Assassin]: 0,
    [CharacterClass.Cleric]: 1,
    [CharacterClass.Druid]: 1,
    [CharacterClass.Fighter]: 1,
    [CharacterClass.MagicUser]: 0,
    [CharacterClass.Monk]: 1,
    [CharacterClass.Paladin]: 1,
    [CharacterClass.Ranger]: 1,
    [CharacterClass.Thief]: 0,
  },
}

const MAGIC_DEFAULT_LEVEL = 1

export const getToHitMelee = (classDef: CharacterClassDef, stats: CharacterStats): number => {
  const baseToHit = ALTERNATE_QUICK_AAC_TO_HIT[MAGIC_DEFAULT_LEVEL][classDef.name]
  assert(typeof baseToHit === 'number' && !isNaN(baseToHit), `Cannot bet base to-hit for class: ${classDef.name}`)

  let statsToHit = stats.Strength.ToHit
  if (classDef.name !== CharacterClass.Fighter && statsToHit > 0) {
    statsToHit = 0
  }

  return baseToHit + statsToHit
}

export const getToHitMissiles = (classDef: CharacterClassDef, stats: CharacterStats): number => {
  const baseToHit = ALTERNATE_QUICK_AAC_TO_HIT[MAGIC_DEFAULT_LEVEL][classDef.name]
  assert(typeof baseToHit === 'number' && !isNaN(baseToHit), `Cannot bet base to-hit for class: ${classDef.name}`)

  let statsToHit = stats.Dexterity.MissilesToHit
  // This condition is questionable, though there are no Fighters with negative To-Hit. I guess.
  if (classDef.name === CharacterClass.Fighter && stats.Strength.ToHit > 0) {
    statsToHit += stats.Strength.ToHit
  }

  return baseToHit + statsToHit
}

// TODO getDamageBonus (melee/missiles?)
