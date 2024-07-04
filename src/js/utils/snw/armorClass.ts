import { EquipItem } from '../../domain/Equipment'
import { CharacterStats } from '../../domain/snw/CharacterStats'
import { assert } from '../assert'

type CharArmorClass = {
  aac: number
  dac: number
  armor: string
}

const ARMOR_CLASS_INVERTER = 19
const BASE_ASC_ARMOR_CLASS = 10

export const getDescArmorClass = (ascArmorClass: number): number => {
  assert(ascArmorClass > 0, 'Invalid Asc. AC')

  return ARMOR_CLASS_INVERTER - ascArmorClass
}

// Extract the modifier from the armorClass string
const getArmorClassModifier = (armorClass: string): number => {
  const match = armorClass.match(/\+(\d)/)

  return match ? parseInt(match[1], 10) : 0
}

export const getCharArmorClass = (stats: CharacterStats, items: EquipItem[]): CharArmorClass => {
  const bonus = stats.Dexterity.ArmorClass
  let highestArmorClass: CharArmorClass | null = null
  let shield: CharArmorClass | null = null

  items.forEach((item) => {
    if (!item.armorClass) {
      return
    }

    const mod = getArmorClassModifier(item.armorClass)
    const aac = BASE_ASC_ARMOR_CLASS + mod + bonus
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
    aac: (highestArmorClass as CharArmorClass).aac + 1,
    armor: `${(highestArmorClass as CharArmorClass).armor}, shield`,
    dac: getDescArmorClass((highestArmorClass as CharArmorClass).aac + 1),
  }
}
