/* eslint-disable sort-keys-fix/sort-keys-fix,no-console,@typescript-eslint/no-var-requires */

import type { EquipItem } from '../../domain/Equipment'
import type { Inventory, InventoryItem } from '../../domain/Inventory'
import { exportedStats } from './__tests__/mocks'
import { MAP_FIELDS_TO_CHAR_ATTRS } from './fieldsConfig'
import { Formatter } from './Formatter'

console.log('TEST')

/**
 * @param {import('js/domain/Inventory').Inventory} inventory
 * @param {string} fieldName
 */
const getAttrValue = (inventory: Inventory, fieldName: string): string | null => {
  const path: string = MAP_FIELDS_TO_CHAR_ATTRS[fieldName]

  if (!path) {
    0 && console.error(`Unhandled field: "${fieldName}"`)

    return null
  }

  const formatter = Formatter[path] ?? Formatter.default
  const chunks = path.split('.')
  let max = chunks.length
  let res: object = inventory

  while (max--) {
    const key = chunks.shift() as keyof typeof res
    res = res[key]
  }

  return formatter(res)
}

const processFields = (form: HTMLFormElement, inventory: Inventory): void => {
  const formData = new FormData(form)

  for (const [fieldName] of formData.entries()) {
    const input = form.elements.namedItem(fieldName)!

    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      const value = getAttrValue(inventory, fieldName)

      input.value = value ? value.toString() : `--${fieldName}`
    }
  }
}

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

const processEquipment = (form, itemsMap: Record<string, InventoryItem>): void => {
  // These are set in the PDF file
  const base = 'Items and Equipment '
  const minId = 2
  const maxId = 9

  const items = Object.values(itemsMap).sort(sortEquipmentItems)
  const labels = items.map((item) => {
    let sfx = ''
    if (item.ascArmorClass) {
      sfx = '**'
    }
    if (item.damage) {
      sfx = '*'
    }

    return item.quantity > 1 ? `${item.name}${sfx} (${item.quantity})` : `${item.name}${sfx}`
  })

  const numFields = maxId - minId + 1
  const totalItems = labels.length

  let itemIndex = 0

  for (let fieldIndex = 0; fieldIndex < numFields; fieldIndex++) {
    const remainingFields = numFields - fieldIndex
    const remainingItems = totalItems - itemIndex

    if (remainingItems <= 0) {
      break
    }

    const itemsInField = Math.ceil(remainingItems / remainingFields)
    const group = labels.slice(itemIndex, itemIndex + itemsInField).join('; ')

    const fieldName = base + (minId + fieldIndex)
    form.getField(fieldName).setText(group)

    itemIndex += itemsInField
  }
}

const sendSheet = (): void => {}

type CharacterSheetParams = {
  inventory: Inventory
  document: Document
}

const renderCharacterSheet = async (params: CharacterSheetParams) => {
  const { inventory } = params
  const form = document.getElementById('character-sheet-form')! as HTMLFormElement

  try {
    processFields(form, inventory)
    // processEquipment(form, inventory.items)
    sendSheet()
  } catch (err) {
    console.error('❌ Failed to fill character sheet', err)
  }
}

const testInventory: Inventory = Object.values(exportedStats)[0]

console.log(testInventory)

void renderCharacterSheet({
  inventory: testInventory,
  document: document,
})
