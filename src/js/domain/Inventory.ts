import type { EquipItem } from './Equipment'
import type { Character } from './snw/Character'

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
