import { QuickAscendingArmorClassBaseToHit } from '../../config/snw/Combat'
import { CharacterClass, CharacterClassDef } from '../../domain/snw/CharacterClass'
import { CharacterStats } from '../../domain/snw/CharacterStats'
import { assert } from '../assert'

const MAGIC_DEFAULT_LEVEL = 1

export const getToHitMelee = (classDef: CharacterClassDef, stats: CharacterStats): number => {
  const baseToHit = QuickAscendingArmorClassBaseToHit[MAGIC_DEFAULT_LEVEL][classDef.name]
  assert(typeof baseToHit === 'number' && !isNaN(baseToHit), `Cannot get Base To-Hit for class: ${classDef.name}`)

  let statsToHit = stats.Strength.ToHit
  if (classDef.name !== CharacterClass.Fighter && statsToHit > 0) {
    statsToHit = 0
  }

  return baseToHit + statsToHit
}

export const getToHitMissiles = (classDef: CharacterClassDef, stats: CharacterStats): number => {
  const baseToHit = QuickAscendingArmorClassBaseToHit[MAGIC_DEFAULT_LEVEL][classDef.name]
  assert(typeof baseToHit === 'number' && !isNaN(baseToHit), `Cannot get Base To-Hit for class: ${classDef.name}`)

  let statsToHit = stats.Dexterity.MissilesToHit
  // This condition is questionable, though there are no Fighters with negative To-Hit. I guess.
  if (classDef.name === CharacterClass.Fighter && stats.Strength.ToHit > 0) {
    statsToHit += stats.Strength.ToHit
  }

  return baseToHit + statsToHit
}

export const getDamageModifier = (classDef: CharacterClassDef, stats: CharacterStats): number => {
  let damageMod = stats.Strength.Damage

  if (classDef.name !== CharacterClass.Fighter && damageMod > 0) {
    damageMod = 0
  }

  return damageMod
}
