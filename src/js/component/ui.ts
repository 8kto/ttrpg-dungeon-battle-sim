import { CharacterClasses } from '../config/snw/CharacterClasses'
import { AllEquipment, Armor, Equip, Weapons } from '../config/snw/Equip'
import { EquipSets } from '../config/snw/EquipSets'
import { EquipItem } from '../domain/Equipment'
import { CharacterClassDef } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { DEFAULT_INVENTORY_ID, getState, State } from '../state/State'
import {
  getBestClass,
  getCharHitPoints,
  getClassSuggestions,
  getRandomAttributes,
  getRandomClass,
} from '../utils/character'
import { getEquipNameSuffix, importEquipSet } from '../utils/equipment'
import { dispatchEvent } from '../utils/event'
import { getInventoryIdFromName } from '../utils/inventory'
import { getBaseMovementRate } from '../utils/movement'
import {
  createElementFromHtml,
  getEquipTableSection,
  markSelectedInventory,
  renderErrorMessage,
  renderInitialInventory,
  renderStatsContainer,
  scrollToElement,
  updateSpeedDisplay,
} from './utils.layout'

// TODO split up layout utils further: communicate (e.g. with events binding) through Custom Events

/**
 * Renders the specified inventory in the UI.
 */
const renderInventory = (inventoryId: string, name?: string): void => {
  const inventory = getState().getInventory(inventoryId)
  if (!inventory) {
    console.error('Inventory not found:', inventoryId)

    return
  }

  const cellClassnames = 'px-4 py-1'
  let inventoryTableContainer = document.querySelector(`#${inventoryId}-table-container`)
  if (!inventoryTableContainer) {
    renderInitialInventory(inventoryId, name)
    inventoryTableContainer = document.querySelector(`#${inventoryId}-table-container`)
  }

  const inventoryTableBody = inventoryTableContainer.querySelector<HTMLTableSectionElement>('table tbody')
  inventoryTableBody.innerHTML = ''

  let totalWeight = 0
  let totalCost = 0

  Object.values(inventory.items).forEach((item) => {
    const row = inventoryTableBody.insertRow()
    row.className = 'even:bg-gray-50 hover:bg-gen-50'

    const nameCell = row.insertCell(0)
    nameCell.innerHTML = item.name + getEquipNameSuffix(item)
    nameCell.className = cellClassnames

    const qtyCell = row.insertCell(1)
    qtyCell.textContent = item.quantity.toString()
    qtyCell.className = cellClassnames

    const weightCell = row.insertCell(2)
    weightCell.textContent = (item.weight * item.quantity).toFixed(2).replace(/\.0+$/g, '')
    weightCell.className = cellClassnames

    const costCell = row.insertCell(3)
    costCell.textContent = (item.cost * item.quantity).toFixed(2).replace(/\.0+$/g, '')
    costCell.className = cellClassnames

    // Create and append the Remove button
    const removeButton = document.createElement('button')
    removeButton.textContent = 'Remove'
    removeButton.className = 'px-4 py-1 text-sm text-red-800 hover:text-red-500'
    removeButton.onclick = (): void => {
      getState().removeFromInventory(inventoryId, item.name)
      renderInventory(inventoryId, name)
    }

    const actionsCell = row.insertCell(4)
    actionsCell.appendChild(removeButton)
    actionsCell.className = `${cellClassnames} text-center px-2 w-16`

    totalWeight += item.weight * item.quantity
    totalCost += item.cost * item.quantity
  })

  const carryModifier = 0 // FIXME Placeholder for a carry modifier
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier)

  document.getElementById(`${inventoryId}-total-weight`).textContent = totalWeight.toFixed(1)
  document.getElementById(`${inventoryId}-total-cost`).textContent = totalCost.toFixed(2)
  document.getElementById(`${inventoryId}-base-movement-rate`).textContent = baseMovementRate.toString()

  updateSpeedDisplay(inventoryId, baseMovementRate)
}

const addEquipmentToTable = (tableBody: HTMLTableSectionElement, item: EquipItem): void => {
  const row = tableBody.insertRow()
  row.className = 'even:bg-gray-50 hover:bg-gen-50'

  const cellClassnames = 'px-4 py-1'

  // Create and set properties for the name cell
  const nameCell = row.insertCell(0)

  nameCell.innerHTML = item.name + getEquipNameSuffix(item)
  nameCell.className = cellClassnames

  // Create and set properties for the weight cell
  const weightCell = row.insertCell(1)
  weightCell.textContent = item.weight.toString()
  weightCell.className = cellClassnames

  // Create and set properties for the cost cell
  const costCell = row.insertCell(2)
  costCell.textContent = item.cost.toString()
  costCell.className = cellClassnames

  // Create and set properties for the button cell
  const addButton = document.createElement('button')
  addButton.textContent = 'Add'
  addButton.className = 'px-4 text-sm text-left font-medium text-sub hover:text-red-800'
  addButton.onclick = (): void => {
    const state = getState()
    const inventoryId = state.getCurrentInventoryId()
    state.addToInventory(inventoryId, item)
    renderInventory(inventoryId, inventoryId)
  }

  const actionsCell = row.insertCell(3)
  actionsCell.appendChild(addButton)
  actionsCell.className = `${cellClassnames} text-center px-2 w-16`
}

const createCategorySection = (container: HTMLElement, categoryName: string, items: EquipItem[]): void => {
  const sectionHtml = getEquipTableSection(categoryName)
  const section = createElementFromHtml(sectionHtml)
  container.appendChild(section)

  const tableBody = section.querySelector('tbody')
  items.forEach((item) => addEquipmentToTable(tableBody, item))
}

const bindConversionControls = (): void => {
  /** @type {HTMLInputElement} */
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

const renderEquipSets = (): void => {
  const dropdown = document.getElementById('equip-set-dropdown') as HTMLSelectElement
  const equipSetsContainer = document.getElementById('equip-sets-container')

  for (const key in EquipSets) {
    const option = document.createElement('option')
    option.value = key
    option.textContent = EquipSets[key].name
    option.classList.add('text-base')
    dropdown.appendChild(option)
  }

  dropdown.addEventListener('change', function () {
    const selectedSetKey = this.value
    equipSetsContainer.innerHTML = ''

    if (selectedSetKey) {
      renderEquipSetTable(equipSetsContainer, selectedSetKey)
    }
  })
}

const renderEquipSetTable = (container: HTMLElement, selectedKey: string): void => {
  const selectedSet = EquipSets[selectedKey]
  const itemList = document.createElement('ul')
  itemList.className = 'list-disc list-inside two-columns'

  selectedSet.items.forEach((item) => {
    const listItem = document.createElement('li')
    listItem.textContent = item.quantity > 1 ? `${item.name} (${item.quantity})` : item.name
    itemList.appendChild(listItem)
  })

  container.appendChild(itemList)
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

const renderInventories = (): void => {
  const inventoryTableContainer = document.getElementById('inventories-container')
  inventoryTableContainer.innerHTML = ''
  getState()
    .getInventories()
    .forEach((inventory) => {
      renderInventory(inventory.id, inventory.name)

      if (inventory.character) {
        renderCharacterSection(inventory.id, inventory.character.stats, inventory.character.classDef)
        document.querySelector(`#${inventory.id}-inventory-controls-top-section`).classList.add('hidden')
      }
    })
}

// FIXME order
const renderCharacterSection = (inventoryId: string, charStats: CharacterStats, charClass: CharacterClassDef): void => {
  const container = document.querySelector<HTMLElement>(`#${inventoryId}-container .char-stats`)

  container.innerHTML = ''
  renderStatsContainer(container, charClass, charStats)
}

const handleNewRandomCharInit = (): void => {
  const state = getState()
  const charStats = getRandomAttributes()
  const suggestions = getClassSuggestions(charStats, 'PrimeAttr')
  const matched = getBestClass(suggestions)

  // FIXME debug
  // const matched = getBestClass([['Cleric', [['Wisdom', 13]], { Constitution: 14, Wisdom: 16 }]])

  let charClass
  if (matched) {
    charClass = CharacterClasses[matched]
  } else {
    console.info('No matching classes. Choosing random')
    charClass = getRandomClass()
  }

  charStats.HitPoints = getCharHitPoints(charClass, charStats.Constitution.HitPoints)
  const currentInventoryId = state.getCurrentInventoryId()
  state.setCharacter(currentInventoryId, charStats, charClass)
  renderCharacterSection(currentInventoryId, charStats, charClass)
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

  createCategorySection(equipmentContainer, 'Armor', Armor)
  createCategorySection(equipmentContainer, 'Weapons', Weapons)
  createCategorySection(equipmentContainer, 'Equipment', Equip)

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
