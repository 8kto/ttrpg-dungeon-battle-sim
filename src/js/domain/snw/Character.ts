import type { Attributes } from './Attributes'
import type { CharacterClassDef, CharacterRace } from './CharacterClass'
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
  gold: number
  hitPoints: number
  level: number
  ancestry: CharacterRace
  stats: Attributes
  classDef: CharacterClassDef
  armorClass: ArmorClass
  toHit: ToHit
  // damage: {}

  spells?: Record<string, Spell> | 'All'
  prepared?: string[]
  $isDirty?: boolean
}
