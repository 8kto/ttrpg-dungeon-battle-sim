import { QuickAscendingArmorClassBaseToHit } from '../../config/snw/Combat'
import type { Attributes } from '../../domain/snw/Attributes'
import type { CharacterClassDef } from '../../domain/snw/CharacterClass'
import { CharacterClass } from '../../domain/snw/CharacterClass'
import { assert } from '../assert'

/** @deprecated */
const MAGIC_DEFAULT_LEVEL = 1

/**
 * TODO simlpified base to-hit mod depends of level
 */
export const getToHitMelee = (classDef: CharacterClassDef, stats: Attributes): string => {
  const baseToHit = QuickAscendingArmorClassBaseToHit[MAGIC_DEFAULT_LEVEL][classDef.name]
  assert(typeof baseToHit === 'number' && !isNaN(baseToHit), `Cannot get Base To-Hit for class: ${classDef.name}`)

  let statsToHit = stats.Strength.ToHit
  if (classDef.name !== CharacterClass.Fighter && statsToHit > 0) {
    statsToHit = 0
  }

  const res = baseToHit + statsToHit

  return res <= 0 ? res.toString() : `+${res}`
}

export const getToHitMissiles = (classDef: CharacterClassDef, stats: Attributes): string => {
  const baseToHit = QuickAscendingArmorClassBaseToHit[MAGIC_DEFAULT_LEVEL][classDef.name]
  assert(typeof baseToHit === 'number' && !isNaN(baseToHit), `Cannot get Base To-Hit for class: ${classDef.name}`)

  let statsToHit = stats.Dexterity.MissilesToHit
  // This condition is questionable, though there are no Fighters with negative To-Hit. I guess.
  if (classDef.name === CharacterClass.Fighter && stats.Strength.ToHit > 0) {
    statsToHit += stats.Strength.ToHit
  }

  const res = baseToHit + statsToHit

  return res <= 0 ? res.toString() : `+${res}`
}

export const getDamageModifier = (classDef: CharacterClassDef, stats: Attributes): string => {
  let damageMod = stats.Strength.Damage

  if (classDef.name !== CharacterClass.Fighter && damageMod > 0) {
    damageMod = 0
  }

  return damageMod <= 0 ? damageMod.toString() : `+${damageMod}`
}
