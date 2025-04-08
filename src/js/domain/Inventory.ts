import { Character } from './snw/Character'
import { EquipItem } from './Equipment'

export type InventoryItem = EquipItem & {
  quantity: number
}

export type Inventory = {
  id: string
  name: string
  items: Record<string, InventoryItem>
  character: Character | null
  isCompact?: boolean
}
