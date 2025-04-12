/* eslint-disable sort-keys-fix/sort-keys-fix */

import type { EquipItem } from '../../domain/Equipment'
import type { InventoryItem } from '../../domain/Inventory'
import type { ArmorClass } from '../../domain/snw/Character'
import type { PrimeAttribute } from '../../domain/snw/CharacterClass'
import type { SavingThrow } from '../../domain/snw/SavingThrow'

const sortEquipmentItems = (a: EquipItem, b: EquipItem): number => {
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

export const Formatter: Record<string | 'default', CallableFunction> = {
  'character.classDef.SavingThrow': (val: SavingThrow): string => val.snw.value.toString(),

  'character.armorClass': (val: ArmorClass): string => `${val.dac}[${val.aac}]`,

  'character.classDef.PrimeAttr': (val: PrimeAttribute[]): string =>
    val.map(([k]) => k.toUpperCase().slice(0, 3)).join(', '),

  'character.experiencePointsBonus': (val: number): string => `${val}%`,

  'character.classDef.name': (name: string): string => {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
  },

  'character.gold': (val: number) => `${val} GP`,

  items: (itemsMap: Record<string, InventoryItem>) => {
    const items = Object.values(itemsMap).sort(sortEquipmentItems)
    const labels = items.map((item) => {
      let sfx = ''
      if (item.ascArmorClass) {
        sfx = '🛡'
      }
      if (item.damage) {
        sfx = '⚔'
      }

      return item.quantity > 1 ? `${item.name}${sfx} (${item.quantity})` : `${item.name}${sfx}`
    })

    return labels.join('; ')
  },

  default: (val: unknown): string => {
    if (Array.isArray(val)) {
      return val.join(',')
    } else if (typeof val === 'object') {
      val = JSON.stringify(val)
    }

    return val?.toString() ?? 'NA'
  },
}
