/* eslint-disable sort-keys-fix/sort-keys-fix,no-console */

import type { Inventory } from '../../domain/Inventory'
import { exportedStats } from './__tests__/mocks'
import { MAP_FIELDS_TO_CHAR_ATTRS } from './fieldsConfig'
import { EquipmentFormatter, Formatter, sortEquipmentItems } from './Formatter'

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

const processWeapons = (form: HTMLFormElement, inventory: Inventory): void => {
  const itemsArray = Object.values(inventory.items).sort(sortEquipmentItems)
  const items = itemsArray.filter((item): boolean => !!item.damage)

  const tplRowElement = form.querySelector<HTMLTableRowElement>('[data-weapon-row-template]')!
  const tbodyElement = tplRowElement.parentNode!
  const rows = [tplRowElement].concat(
    Array.from({ length: items.length - 1 }, () => {
      return tplRowElement.cloneNode(true) as HTMLTableRowElement
    }),
  )

  rows.forEach((newRowElement, index) => {
    const item = items[index]

    // TODO range + tohit
    newRowElement.querySelector<HTMLInputElement>('.weapon-input--name')!.value = item.name
    newRowElement.querySelector<HTMLInputElement>('.weapon-input--damage')!.value = item.damage!

    tbodyElement.appendChild(newRowElement)
  })
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
    processWeapons(form, inventory)
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
