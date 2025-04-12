/* eslint-disable sort-keys-fix/sort-keys-fix */

import type { EquipItem } from '../../domain/Equipment'
import type { InventoryItem } from '../../domain/Inventory'
import type { ArmorClass } from '../../domain/snw/Character'
import type { PrimeAttribute } from '../../domain/snw/CharacterClass'
import type { SavingThrow } from '../../domain/snw/SavingThrow'

export const sortEquipmentItems = (a: EquipItem, b: EquipItem): number => {
  // 0 — ascArmorClass
  // 1 — damage
  // 2 — other
  const priority = (item: EquipItem): number => {
    if (item.ascArmorClass != null) {
      return 0
    }
    if (item.damage != null) {
      return 1
    }

    return 2
  }

  const pA = priority(a)
  const pB = priority(b)

  if (pA !== pB) {
    return pA - pB
  }

  if (pA === 0) {
    return b.ascArmorClass! - a.ascArmorClass! || a.name.localeCompare(b.name)
  }

  return a.name.localeCompare(b.name)
}

export const EquipmentFormatter: Record<string, (itemsMap: Array<InventoryItem>) => string> = {
  armor: (itemsArray: Array<InventoryItem>): string => {
    const filtered = itemsArray.filter((item): boolean => !!item.ascArmorClass)
    const labels = filtered.map((item) => {
      const sfx = `AC [${item.ascArmorClass}]`

      return item.quantity > 1 ? `${item.name} ${sfx} (x${item.quantity})` : `${item.name} ${sfx}`
    })

    return labels.join(', ')
  },

  weapons: (itemsArray: Array<InventoryItem>): string => {
    const filtered = itemsArray.filter((item): boolean => !!item.damage)
    const labels = filtered.map((item) => {
      const sfx = `(${item.damage})`

      return item.quantity > 1 ? `${item.name} ${sfx} (x${item.quantity})` : `${item.name} ${sfx}`
    })

    return labels.join(', ')
  },
}

export const Formatter: Record<string | 'default', CallableFunction> = {
  'character.classDef.SavingThrow': (fieldName: string, val: SavingThrow): string => val.snw.value.toString(),

  'character.armorClass': (fieldName: string, val: ArmorClass): string => `${val.dac}[${val.aac}]`,

  'character.classDef.PrimeAttr': (fieldName: string, val: PrimeAttribute[]): string =>
    val.map(([k]) => k.toUpperCase().slice(0, 3)).join(', '),

  'character.experiencePointsBonus': (fieldName: string, val: number): string => `${val}%`,

  'character.classDef.name': (fieldName: string, name: string): string => {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
  },

  'character.gold': (fieldName: string, val: number) => `${val} GP`,

  items: (fieldName: string, itemsMap: Record<string, InventoryItem>): string => {
    const itemsArray = Object.values(itemsMap).sort(sortEquipmentItems)

    let filter: (item: EquipItem) => boolean
    switch (fieldName) {
      case 'items--armor':
        return EquipmentFormatter['armor'](itemsArray)

      case 'items--weapons':
        return EquipmentFormatter['weapons'](itemsArray)

      default:
        filter = (item): boolean => !item.damage && !item.ascArmorClass
        break
    }

    const filtered = itemsArray.filter(filter)

    const labels = filtered.map((item) => (item.quantity > 1 ? `${item.name} (${item.quantity})` : item.name))

    return labels.join('; ')
  },

  default: (fieldName: string, val: unknown): string => {
    if (Array.isArray(val)) {
      return val.join(',')
    } else if (typeof val === 'object') {
      val = JSON.stringify(val)
    }

    return val?.toString() ?? 'NA'
  },
}
