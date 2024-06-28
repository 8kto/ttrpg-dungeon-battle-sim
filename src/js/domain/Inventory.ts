import { CharacterClass } from './CharacterClass'
import { CharacterStats } from './CharacterStats'
import { EquipItem } from './Equipment'

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
