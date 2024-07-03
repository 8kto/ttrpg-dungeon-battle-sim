import { AllEquipment } from '../config/snw/Equip'
import { EquipItem, EquipSet, InventoryItemFlag } from '../domain/Equipment'
import { Inventory } from '../domain/Inventory'

export const getEquipNameSuffix = (item: EquipItem): string => {
  let sfx = ''

  if (item.armorClass) {
    sfx += `AC ${item.armorClass}`
  }

  if (item.damage) {
    sfx += `${item.damage} `
  }

  if (item.flags) {
    if (item.flags & InventoryItemFlag.VAR_HANDED) {
      sfx += '†'
    }
    if (item.flags & InventoryItemFlag.TWO_HANDED) {
      sfx += '*'
    }
    if (item.flags & InventoryItemFlag.MELEE_AND_MISSILE) {
      sfx += '‡'
    }
  }
  // Line breaks not allowed
  sfx = sfx.replaceAll(' ', '&nbsp;')

  return sfx ? `<span class="text-alt ml-3 text-xs">${sfx}</span>` : ''
}

export const importEquipSet = (inventory: Inventory, equipSet: EquipSet): void => {
  equipSet.items.forEach((item) => {
    const originalItem = AllEquipment.find((i) => i.name === item.name)
    if (!originalItem) {
      throw new Error(`Original equip item not found for ${item.name}`)
    }

    inventory.items[item.name] = {
      ...originalItem,
      quantity: item.quantity + (inventory.items[item.name]?.quantity || 0),
    }
  })
}
