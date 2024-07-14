import { EquipItem } from './Equipment'
import { CharacterClass } from './snw/CharacterClass'
import { CharacterStats } from './snw/CharacterStats'
import { Spell } from './snw/Magic'

export type InventoryItem = EquipItem & {
  quantity: number
}

export type Character = {
  stats: CharacterStats
  characterClass: CharacterClass
  spells?: Record<string, Spell> | 'All'
  prepared?: string[]
}

export type Inventory = {
  id: string
  name: string
  items: Record<string, InventoryItem>
  character: Character | null
  isCompact?: boolean
}
