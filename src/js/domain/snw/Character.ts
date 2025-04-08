import type { Attributes } from './Attributes'
import type { CharacterClass } from './CharacterClass'
import type { Spell } from './Magic'

export type Character = {
  gold: number
  hitPoints: number
  level: number
  stats: Attributes
  characterClass: CharacterClass
  spells?: Record<string, Spell> | 'All'
  prepared?: string[]
}
