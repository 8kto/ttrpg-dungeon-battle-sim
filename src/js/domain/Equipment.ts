export type EquipItem = {
  name: string
  weight: number
  cost: number
  ascArmorClass?: number
  damage?: string
  flags?: InventoryItemFlag
}

/**
 * Flags for special properties of inventory items.
 */
export enum InventoryItemFlag {
  TWO_HANDED = 0b000001,
  VAR_HANDED = 0b000010,
  MELEE_AND_MISSILE = 0b000100,
  TYPE_MELEE = 0b001000,
  TYPE_MISSILE = 0b010000,
}

export type EquipSet = {
  name: string
  items: Array<{ name: string; quantity: number }>
}
