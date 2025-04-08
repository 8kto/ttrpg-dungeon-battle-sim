import type { InventoryItem } from '../../domain/Inventory'
import type { Attributes } from '../../domain/snw/Attributes'
import type { ArmorClass } from '../../domain/snw/Character'
import { assert } from '../assert'

const ARMOR_CLASS_INVERTER = 19
const BASE_ASC_ARMOR_CLASS = 10

export const getDescArmorClass = (ascArmorClass: number): number => {
  assert(ascArmorClass > 0, 'Invalid Asc. AC')

  return ARMOR_CLASS_INVERTER - ascArmorClass
}

export const getCharArmorClass = (stats: Attributes, items: Record<string, InventoryItem>): ArmorClass => {
  const bonus = stats.Dexterity.ArmorClass
  let highestArmorClass: ArmorClass | null = null
  let shield: ArmorClass | null = null

  Object.values(items).forEach((item) => {
    if (!item.ascArmorClass) {
      return
    }

    const aac = BASE_ASC_ARMOR_CLASS + item.ascArmorClass + bonus
    const dac = getDescArmorClass(aac)

    const armorClass = { aac, armor: item.name, dac }

    if (item.name === 'Shield') {
      shield = armorClass
    } else if (!highestArmorClass || highestArmorClass.aac < armorClass.aac) {
      highestArmorClass = armorClass
    }
  })

  if (!highestArmorClass && shield) {
    return shield
  }

  if (!highestArmorClass) {
    return { aac: BASE_ASC_ARMOR_CLASS, armor: 'None', dac: getDescArmorClass(BASE_ASC_ARMOR_CLASS) }
  }

  if (!shield) {
    return highestArmorClass
  }

  return {
    aac: (highestArmorClass as ArmorClass).aac + 1,
    armor: `${(highestArmorClass as ArmorClass).armor}, shield`,
    dac: getDescArmorClass((highestArmorClass as ArmorClass).aac + 1),
  }
}
