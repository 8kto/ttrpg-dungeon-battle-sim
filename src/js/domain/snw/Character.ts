import { Attributes } from './Attributes'
import { CharacterClass } from './CharacterClass'
import { Spell } from './Magic'

export type Character = {
  gold: number
  hitPoints: number
  stats: Attributes
  characterClass: CharacterClass
  spells?: Record<string, Spell> | 'All'
  prepared?: string[]
}
