/* eslint-disable sort-keys-fix/sort-keys-fix,no-console */

import { InventoryItemFlag } from '../../domain/Equipment'
import type { Inventory } from '../../domain/Inventory'
import { CharacterClass } from '../../domain/snw/CharacterClass'
import { assert } from '../assert'
import { getElementById } from '../layout'
import { exportedStats } from './__tests__/mocks'
import { MAP_FIELDS_TO_CHAR_ATTRS } from './fieldsConfig'
import { Formatter, sortEquipmentItems } from './Formatter'

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
      // input.value = value ? value.toString() : `--${fieldName}`
      input.value = value?.toString() ?? ''
    }
  }
}

const processWeapons = (form: HTMLFormElement, inventory: Inventory): void => {
  const itemsArray = Object.values(inventory.items).sort(sortEquipmentItems)
  const items = itemsArray.filter((item): boolean => !!item.damage)
  const char = inventory.character

  assert(char, 'Character not found')

  const tplRowElement = form.querySelector<HTMLTableRowElement>('[data-weapon-row-template]')!
  const tbodyElement = tplRowElement.parentNode!
  const rowsMinimumNum = 5
  const rowsNum = Math.max(rowsMinimumNum, items.length)
  const rows = [tplRowElement].concat(
    Array.from({ length: rowsNum - 1 }, () => {
      return tplRowElement.cloneNode(true) as HTMLTableRowElement
    }),
  )

  const { damageMod, toHit } = char
  rows.forEach((newRowElement, index) => {
    const item = items[index]
    if (!item) {
      tbodyElement.appendChild(newRowElement)

      return
    }

    const isBoth = item.flags! & InventoryItemFlag.MELEE_AND_MISSILE
    const isMelee = item.flags! & InventoryItemFlag.TYPE_MELEE
    const isMissile = item.flags! & InventoryItemFlag.TYPE_MISSILE

    let toHitString = 'NA'
    if (isBoth) {
      toHitString = `${toHit.melee} / ${toHit.missiles}`
    } else if (isMelee) {
      toHitString = toHit.melee
    } else if (isMissile) {
      toHitString = toHit.missiles
    }
    let damageString = item.damage!
    if (damageMod && damageMod !== '0') {
      damageString = `${item.damage} ${damageMod}`
    }

    // TODO range
    newRowElement.querySelector<HTMLInputElement>('.weapon-input--name')!.value = item.name
    newRowElement.querySelector<HTMLInputElement>('.weapon-input--damage')!.value = damageString
    newRowElement.querySelector<HTMLInputElement>('.weapon-input--tohit')!.value = toHitString

    tbodyElement.appendChild(newRowElement)
  })
}

const processEquipment = (formElement: HTMLFormElement, inventory: Inventory): void => {
  const itemsArray = Object.values(inventory.items).sort(sortEquipmentItems)
  const items = itemsArray.filter((item): boolean => !item.damage && !item.ascArmorClass)

  const tplRowElement = formElement.querySelector<HTMLTableRowElement>('[data-equipment-row-template]')!
  const tbodyElement = tplRowElement.parentNode! as HTMLBodyElement
  const colsNum = 4
  const rowsMinimumNum = 5
  const rowsNum = Math.max(Math.ceil(items.length / colsNum), rowsMinimumNum)

  const rows: HTMLTableRowElement[] = [tplRowElement]
  for (let i = 1; i < rowsNum; i++) {
    const newRow = tplRowElement.cloneNode(true) as HTMLTableRowElement
    rows.push(newRow)
  }

  tbodyElement.innerHTML = ''
  rows.forEach((row) => {
    tbodyElement.appendChild(row)
  })

  // Fill the table column by column
  for (let col = 0; col < colsNum; col++) {
    for (let row = 0; row < rowsNum; row++) {
      const itemIndex = col * rowsNum + row
      if (itemIndex >= items.length) {
        break
      }

      const input = rows[row].querySelectorAll<HTMLInputElement>('.equipment-item-input')[col]
      if (input) {
        input.value = items[itemIndex].name
      }
    }
  }
}

const getThievingSkillsContainer = (container: HTMLFormElement): HTMLElement =>
  container.querySelector('.brick--thieving')!

const getSpellsContainer = (container: HTMLElement): HTMLElement => container.querySelector('.brick--spells')!

const getSpellsByLevelMagicUserPage = (container: HTMLElement): HTMLElement =>
  container.querySelector('.page--spells-by-level--magic-user')!

const hideSections = (containerElement: HTMLFormElement, inventory: Inventory): void => {
  const { character } = inventory
  assert(character, 'Character not found')
  const className = character.classDef.name

  if (![CharacterClass.Assassin, CharacterClass.Thief].includes(className)) {
    getThievingSkillsContainer(containerElement).setAttribute('hidden', 'true')
  }

  if (![CharacterClass.MagicUser, CharacterClass.Cleric, CharacterClass.Druid].includes(className)) {
    getSpellsContainer(containerElement).setAttribute('hidden', 'true')
    getSpellsByLevelMagicUserPage(containerElement).setAttribute('hidden', 'true')
  }

  if (className === CharacterClass.MagicUser) {
    getSpellsByLevelMagicUserPage(containerElement).removeAttribute('hidden')
  }
}

type CharacterSheetParams = {
  inventory: Inventory
  document: Document
}

const renderCharacterSheet = (params: CharacterSheetParams): void => {
  const { inventory } = params
  const formElement = getElementById<HTMLFormElement>('character-sheet-form')

  try {
    processFields(formElement, inventory)
    processWeapons(formElement, inventory)
    processEquipment(formElement, inventory)
    hideSections(formElement, inventory)
  } catch (err) {
    console.error('❌ Failed to fill character sheet', err)
  }
}

if (window.opener && window.opener !== window) {
  // Let the opener know we're ready
  window.opener.postMessage('ready', location.origin)

  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin) {
      return
    }

    const { action, value } = event.data

    if (action === 'fillSheet') {
      void renderCharacterSheet({
        inventory: value,
        document: document,
      })
    }
  })
} else {
  // FIXME remove
  // const testInventory: Inventory = Object.values(exportedStats)[0] // thief
  // const testInventory: Inventory = Object.values(exportedStats)[1] // MU
  const testInventory: Inventory = Object.values(exportedStats)[2] // fighter

  void renderCharacterSheet({
    inventory: testInventory,
    document: document,
  })
}

// TODO check AC for fighter
// TODO remove btn for each brick
// TODO class abilities
// TODO weapons range
// TODO open from main editor
