/* eslint-disable sort-keys-fix/sort-keys-fix,no-console */

import type { Inventory } from '../../domain/Inventory'
import { exportedStats } from './__tests__/mocks'
import { MAP_FIELDS_TO_CHAR_ATTRS } from './fieldsConfig'
import { Formatter } from './Formatter'

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

  return formatter(fieldName, res)
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

const sendSheet = (): void => {}

type CharacterSheetParams = {
  inventory: Inventory
  document: Document
}

const renderCharacterSheet = (params: CharacterSheetParams): void => {
  const { inventory } = params
  const form = document.getElementById('character-sheet-form')! as HTMLFormElement

  try {
    processFields(form, inventory)
    sendSheet()
  } catch (err) {
    console.error('❌ Failed to fill character sheet', err)
  }
}

// FIXME remove
const testInventory: Inventory = Object.values(exportedStats)[0]

void renderCharacterSheet({
  inventory: testInventory,
  document: document,
})
