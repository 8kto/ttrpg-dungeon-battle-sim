import type { Attributes } from './Attributes'
import type { CharacterClass, CharacterClassDef, CharacterRace } from './CharacterClass'
import type { Spell } from './Magic'

export type ToHit = {
  melee: string
  missiles: string
}

export type ArmorClass = {
  aac: number
  dac: number
  armor: string | 'None'
}

export type Character = {
  stats: Attributes // TODO rename to attributes
  classDef: CharacterClassDef

  hitPoints: number
  level: number
  ancestry: CharacterRace
  gold: number

  // Combat
  armorClass: ArmorClass
  toHit: ToHit
  damageMod: string

  // Caster props
  spells?: Record<string, Spell> | 'All'
  prepared?: string[]

  // Internal props
  $isDirty?: boolean
  $classDefName?: CharacterClass
}
