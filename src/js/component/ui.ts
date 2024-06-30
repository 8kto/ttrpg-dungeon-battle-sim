import { CharacterClasses } from '../config/snw/CharacterClasses'
import { AllEquipment, Armor, Equip, Weapons } from '../config/snw/Equip'
import { EquipSets } from '../config/snw/EquipSets'
import { DEFAULT_INVENTORY_ID, getState, State } from '../state/State'
import { importEquipSet } from '../utils/equipment'
import { dispatchEvent } from '../utils/event'
import { getInventoryIdFromName } from '../utils/inventory'
import { scrollToElement } from '../utils/layout'
import {
  getBestClass,
  getCharHitPoints,
  getClassSuggestions,
  getRandomAttributes,
  getRandomClass,
} from '../utils/snw/character'
import { renderCharacterSection } from './character.ui'
import {
  markSelectedInventory,
  renderCategorySection,
  renderEquipSets,
  renderErrorMessage,
  renderInventories,
  renderInventory,
} from './inventory.ui'

// TODO split up layout utils further: communicate (e.g. with events binding) through Custom Events

const bindConversionControls = (): void => {
  const allowOnlyExistingCheckbox = document.getElementById('equip-import-allow-only-existing') as HTMLInputElement

  document.getElementById('convert-button').addEventListener('click', function () {
    const state = getState()
    const isStrictEquality = !!allowOnlyExistingCheckbox.checked
    const currentInventoryId = state.getCurrentInventoryId()
    const input = (document.getElementById('equipment-input') as HTMLInputElement).value
    const itemList = input.split('\n') // Split input by new lines to get individual items
    const notFoundItems = [] // To store items not found in the lists

    itemList.forEach((itemName) => {
      const cleanedItemName = itemName.trim().toLowerCase()

      const item = AllEquipment.find((i) => i.name.toLowerCase() === cleanedItemName)
      if (item) {
        state.addToInventory(currentInventoryId, item)
      } else if (isStrictEquality) {
        notFoundItems.push(itemName)
      } else {
        // TODO some qty/weight modifiers?
        state.addToInventory(currentInventoryId, {
          cost: 0,
          name: itemName,
          weight: 0,
        })
      }
    })

    // Update the error output
    if (notFoundItems.length > 0) {
      document.getElementById('error-output').textContent = `Items not found: ${notFoundItems.join(', ')}`
    } else {
      document.getElementById('error-output').textContent = ''
    }

    renderInventory(currentInventoryId)
  })
}

const addInventory = (inventoryName: string): string => {
  const inventoryId = getInventoryIdFromName(inventoryName)
  const state = getState()

  if (!state.getInventory(inventoryId)) {
    state.setInventory(inventoryId, State.getNewInventory(inventoryId, inventoryName))
    renderInventory(inventoryId, inventoryName)

    const element = document.getElementById(`${inventoryId}-container`)
    scrollToElement(element)
  }

  return inventoryId
}

/**
 * Initializes the UI for managing multiple inventories.
 */
const bindInventoryControls = (): void => {
  document.getElementById('add-inventory-button').addEventListener('click', () => {
    const newNameInputElement = document.getElementById('new-inventory-name') as HTMLInputElement
    const inventoryName = newNameInputElement?.value.trim() || DEFAULT_INVENTORY_ID
    const inventoryId = addInventory(inventoryName)

    getState().setCurrentInventoryId(inventoryId)
    markSelectedInventory(inventoryId)
  })
}

const bindDumpingControls = (): void => {
  const container = document.getElementById('dump-domain-container--json-container')

  document.getElementById('dump-json-button').addEventListener('click', () => {
    container.textContent = getState().getSerializeInventories()
  })

  document.getElementById('copy-json-button').addEventListener('click', function () {
    const textToCopy = container.textContent

    // Create a temporary textarea element to hold the text
    const tempTextArea = document.createElement('textarea')
    tempTextArea.value = textToCopy
    document.body.appendChild(tempTextArea)

    // Select the text and copy it to the clipboard
    tempTextArea.select()
    document.execCommand('copy')

    // Remove the temporary textarea element
    document.body.removeChild(tempTextArea)

    alert('Copied to clipboard!')
  })
}

const bindEquipSetImportControls = (): void => {
  const dropdown = document.getElementById('equip-set-dropdown') as HTMLSelectElement
  const state = getState()

  document.getElementById('import-equip-set-button').addEventListener('click', () => {
    const equipSet = dropdown.value
    if (equipSet in EquipSets) {
      importEquipSet(state.getInventory(state.getCurrentInventoryId()), EquipSets[equipSet])
      state.serializeInventories()
      dispatchEvent('RenderInventories')
    }

    dropdown.value = ''
    dropdown.dispatchEvent(new Event('change'))
  })
}

const bindNewItemControl = (): void => {
  document.getElementById('add-new-item-button').addEventListener('click', () => {
    const inputNameElement = document.getElementById('new-item-name') as HTMLInputElement
    const inputWeightElement = document.getElementById('new-item-weight') as HTMLInputElement

    const itemName = inputNameElement.value.trim()
    const itemWeight = Math.max(parseInt(inputWeightElement.value) || 0, 0)

    if (!itemName) {
      console.error('No item name provided')

      return
    }

    const state = getState()
    const inventory = state.getInventory(state.getCurrentInventoryId())

    if (!inventory.items[itemName]) {
      inventory.items[itemName] = {
        cost: 0,
        name: itemName,
        quantity: 1,
        weight: itemWeight,
      }
    } else {
      inventory.items[itemName].quantity++
      inventory.items[itemName].weight = itemWeight
    }

    state.serializeInventories()
    dispatchEvent('RenderInventories')
  })
}

const handleNewRandomCharInit = (): void => {
  const state = getState()
  const charStats = getRandomAttributes()
  const suggestions = getClassSuggestions(charStats, 'PrimeAttr')

  let charClass
  try {
    const matched = getBestClass(suggestions)

    // FIXME debug
    // const matched = getBestClass([['Cleric', [['Wisdom', 13]], { Constitution: 14, Wisdom: 16 }]])

    if (matched) {
      charClass = CharacterClasses[matched]
    } else {
      throw new Error('Character class not found')
    }
  } catch (err) {
    console.info('No matching classes. Choosing random', err.message)
    charClass = getRandomClass()
  }

  charStats.HitPoints = getCharHitPoints(charClass, charStats.Constitution.HitPoints)
  const currentInventoryId = state.getCurrentInventoryId()
  state.setCharacter(currentInventoryId, charClass, charStats)
  renderCharacterSection(currentInventoryId, charClass, charStats)
}

const subscribeToEvents = (): void => {
  document.addEventListener('SelectInventory', (event: CustomEvent) => {
    if (!event.detail.id) {
      throw new Error('No inventory ID passed')
    }

    getState().setCurrentInventoryId(event.detail.id)
    markSelectedInventory(event.detail.id)
  })

  document.addEventListener('RenderInventories', () => {
    renderInventories()
  })

  document.addEventListener('RenderNewRandomCharacter', () => {
    handleNewRandomCharInit()
  })

  document.addEventListener('SerializeState', () => {
    getState().serializeInventories()
  })
}

const main = (): void => {
  subscribeToEvents()

  const currentInventoryId = getState().getCurrentInventoryId()
  const equipmentContainer = document.getElementById('equipment-container')

  renderCategorySection(equipmentContainer, 'Armor', Armor)
  renderCategorySection(equipmentContainer, 'Weapons', Weapons)
  renderCategorySection(equipmentContainer, 'Equipment', Equip)

  bindConversionControls()
  bindInventoryControls()
  dispatchEvent('RenderInventories')
  markSelectedInventory(currentInventoryId)
  bindDumpingControls()

  renderEquipSets()
  bindEquipSetImportControls()
  bindNewItemControl()
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    main()
  } catch (err) {
    console.error(err)

    renderErrorMessage(
      'Error during page initialization. Try refreshing, clearing the cache, or using a different browser.',
    )
  }
})
