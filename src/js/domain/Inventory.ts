import { EquipItem } from './Equipment'
import { CharacterClass } from './snw/CharacterClass'
import { CharacterStats } from './snw/CharacterStats'

export type InventoryItem = EquipItem & {
  quantity: number
}

export type Inventory = {
  id: string
  name: string
  items: Record<string, InventoryItem>
  character: {
    stats: CharacterStats
    classDef: CharacterClass
  } | null
}
