import { AllEquipment } from '../config/snw/Equip'
import { EquipItem, EquipSet, InventoryItemFlag } from '../domain/Equipment'
import { Inventory } from '../domain/Inventory'

export const getEquipNameSuffix = (item: EquipItem, damageMod?: number): string => {
  const sfx: string[] = []

  if (item.ascArmorClass) {
    sfx.push('<span class="text-alt">')
    sfx.push(`AC ${item.ascArmorClass}`)
    sfx.push('</span>')
  }

  if (item.flags) {
    sfx.push('<span class="mr-1">')

    if (item.flags & InventoryItemFlag.VAR_HANDED) {
      sfx.push('<span class="font-bold text-sub">')
      sfx.push('†')
      sfx.push('</span>')
    }
    if (item.flags & InventoryItemFlag.TWO_HANDED) {
      sfx.push('<span class="font-bold text-sub">')
      sfx.push('*')
      sfx.push('</span>')
    }
    if (item.flags & InventoryItemFlag.MELEE_AND_MISSILE) {
      sfx.push('<span class="font-bold text-sub">')
      sfx.push('‡')
      sfx.push('</span>')
    }
    sfx.push('</span>')
  }

  if (item.damage) {
    sfx.push(`<span class="text-alt hover:cursor-help" title="Weapon damage">${item.damage}</span>`)
    if (damageMod) {
      sfx.push(`<span class="text-bold text-red-500 ml-1 hover:cursor-help"  title="Damage bonus (STR)">`)
      sfx.push(`${damageMod > 0 ? '+' : ''}${damageMod}`)
      sfx.push(`</span>`)
    }
  }

  return sfx.length ? `<div class="ml-2 text-xs inline-block">${sfx.join('')}</div>` : ''
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
