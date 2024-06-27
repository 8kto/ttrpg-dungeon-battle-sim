import { characterClasses } from '../data/classes'
import { AllEquipment, Armor, Equipment, EquipSets, Weapons } from '../data/equipment'
import {
  getBestClass,
  getCharHitPoints,
  getClassSuggestions,
  getRandomAttributes,
  getRandomClass,
} from '../shared/character'
import { DEFAULT_INVENTORY_ID, getState, State } from './State'
import {
  dispatchEvent,
  getBaseMovementRate,
  getEquipNameSuffix,
  getIdFromName,
  getSpeed,
  importEquipSet,
  renderErrorMessage,
} from './utils'
import {
  createElementFromHtml,
  getEquipTableSection,
  markSelectedInventory,
  renderInitialInventory,
  renderStatsContainer,
  scrollToElement,
} from './utils.layout'

/**
 * @typedef {Object} InventoryItem
 * @property {string} name - The name of the item.
 * @property {number} weight - The weight of the item in pounds.
 * @property {number} cost - The cost of the item in gold pieces.
 * @property {number} quantity - The quantity of the item in the index.
 * @property {InventoryItemFlag} [flags] - Binary flags
 */

/**
 * Updates the HTML element with speeds for walking, running, and combat based on the base movement rate.
 * @param {string} inventoryId
 * @param {number} baseMovementRate The base movement rate of a character.
 */
const updateSpeedDisplay = (inventoryId, baseMovementRate) => {
  const speeds = getSpeed(baseMovementRate)
  document.getElementById(`${inventoryId}-speed-feet-per-turn`).innerHTML =
    `Walking: <span class="text-alt">${speeds.walking}</span>` +
    ` • Running: <span class="text-alt">${speeds.running}</span>` +
    ` • Combat: <span class="text-alt">${speeds.combat}</span>`
}

/**
 * Renders the specified inventory in the UI.
 * @param {string} id - The identifier for the inventory to be rendered.
 * @param {string} [name]
 */
const renderInventory = (id, name) => {
  const inventory = getState().getInventory(id)
  if (!inventory) {
    console.error('Inventory not found:', id)

    return
  }

  const cellClassnames = 'px-4 py-1'
  let inventoryTableContainer = document.querySelector(`#${id}-table-container`)
  if (!inventoryTableContainer) {
    renderInitialInventory(id, name)
    inventoryTableContainer = document.querySelector(`#${id}-table-container`)
  }

  const inventoryTableBody = inventoryTableContainer.querySelector('table tbody')
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
    removeButton.onclick = () => {
      getState().removeFromInventory(id, item.name)
      renderInventory(id, name)
    }

    const actionsCell = row.insertCell(4)
    actionsCell.appendChild(removeButton)
    actionsCell.className = `${cellClassnames} text-center px-2 w-16`

    totalWeight += item.weight * item.quantity
    totalCost += item.cost * item.quantity
  })

  const carryModifier = 0 // FIXME Placeholder for a carry modifier
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier)

  document.getElementById(`${id}-total-weight`).textContent = totalWeight.toFixed(1)
  document.getElementById(`${id}-total-cost`).textContent = totalCost.toFixed(2)
  document.getElementById(`${id}-base-movement-rate`).textContent = baseMovementRate.toString()

  updateSpeedDisplay(id, baseMovementRate)
}

/**
 * @param {HTMLTableSectionElement} tableBody
 * @param {EquipItem} item
 */
const addEquipmentToTable = (tableBody, item) => {
  const row = tableBody.insertRow()
  row.className = 'even:bg-gray-50 hover:bg-gen-50'

  const cellClassnames = 'px-4 py-1'

  // Create and set properties for the name cell
  const nameCell = row.insertCell(0)

  nameCell.innerHTML = item.name + getEquipNameSuffix(item)
  nameCell.className = cellClassnames

  // Create and set properties for the weight cell
  const weightCell = row.insertCell(1)
  weightCell.textContent = item.weight
  weightCell.className = cellClassnames

  // Create and set properties for the cost cell
  const costCell = row.insertCell(2)
  costCell.textContent = item.cost
  costCell.className = cellClassnames

  // Create and set properties for the button cell
  const addButton = document.createElement('button')
  addButton.textContent = 'Add'
  addButton.className = 'px-4 text-sm text-left font-medium text-sub hover:text-red-800'
  addButton.onclick = () => {
    const state = getState()
    const inventoryId = state.getCurrentInventoryId()
    state.addToInventory(inventoryId, item)
    renderInventory(inventoryId, inventoryId)
  }

  const actionsCell = row.insertCell(3)
  actionsCell.appendChild(addButton)
  actionsCell.className = `${cellClassnames} text-center px-2 w-16`
}

/**
 * @param {HTMLElement} container
 * @param {string} categoryName
 * @param {Array<EquipItem>} items
 */
const createCategorySection = (container, categoryName, items) => {
  const sectionHtml = getEquipTableSection(categoryName)
  const section = createElementFromHtml(sectionHtml)
  container.appendChild(section)

  const tableBody = section.querySelector('tbody')
  items.forEach((item) => addEquipmentToTable(tableBody, item))
}

const bindConversionControls = () => {
  /** @type {HTMLInputElement} */
  const allowOnlyExistingCheckbox = document.getElementById('equip-import-allow-only-existing')

  document.getElementById('convert-button').addEventListener('click', function () {
    const state = getState()
    const isStrictEquality = !!allowOnlyExistingCheckbox.checked
    const currentInventoryId = state.getCurrentInventoryId()
    const input = document.getElementById('equipment-input').value
    const itemList = input.split('\n') // Split input by new lines to get individual items
    const notFoundItems = [] // To store items not found in the lists

    itemList.forEach((itemName) => {
      const cleanedItemName = itemName.trim().toLowerCase()

      const item = AllEquipment.find((i) => i.name.toLowerCase() === cleanedItemName)
      if (item) {
        state.addToInventory(currentInventoryId, { ...item, quantity: 1 })
      } else if (isStrictEquality) {
        notFoundItems.push(itemName)
      } else {
        // TODO some qty/weight modifiers?
        state.addToInventory(currentInventoryId, {
          cost: 0,
          name: itemName,
          quantity: 1,
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

/**
 * Adds a new inventory with a given name.
 * @param {string} name - The name for the new inventory.
 * @returns {string} inventoryId
 */
const addInventory = (name) => {
  const inventoryId = getIdFromName(name)
  const state = getState()

  if (!state.getInventory(inventoryId)) {
    state.setInventory(inventoryId, State.getNewInventory(inventoryId, name))
    renderInventory(inventoryId, name)

    const element = document.getElementById(`${inventoryId}-container`)
    scrollToElement(element)
  }

  return inventoryId
}

/**
 * Initializes the UI for managing multiple inventories.
 */
const bindInventoryControls = () => {
  document.getElementById('add-inventory-button').addEventListener('click', () => {
    const inventoryName = document.getElementById('new-inventory-name')?.value.trim() || DEFAULT_INVENTORY_ID
    const inventoryId = addInventory(inventoryName)
    getState().setCurrentInventoryId(inventoryId)
    markSelectedInventory(inventoryId)
  })
}

const bindDumpingControls = () => {
  const container = document.getElementById('dump-data-container--json-container')

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

const renderEquipSets = () => {
  const dropdown = document.getElementById('equip-set-dropdown')
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

/**
 * @param {HTMLElement} container
 * @param {string} selectedKey
 */
const renderEquipSetTable = (container, selectedKey) => {
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

const bindEquipSetImportControls = () => {
  const dropdown = document.getElementById('equip-set-dropdown')
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

const bindNewItemControl = () => {
  document.getElementById('add-new-item-button').addEventListener('click', () => {
    const itemName = document.getElementById('new-item-name').value.trim()
    const itemWeight = Math.max(parseInt(document.getElementById('new-item-weight').value) || 0, 0)

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

const renderInventories = () => {
  const inventoryTableContainer = document.getElementById('inventories-container')
  inventoryTableContainer.innerHTML = ''
  getState().getInventories().forEach((inventory) => {
    renderInventory(inventory.id, inventory.name)

    if (inventory.character) {
      renderCharacterSection(inventory.id, inventory.character.stats, inventory.character.classDef)
      document.querySelector(`#${inventory.id}-inventory-controls-top-section`).classList.add('hidden')
    }
  })
}

/**
 * @param {string} inventoryId
 * @param {CharacterStats} charStats
 * @param {CharacterClass} charClass
 */
const renderCharacterSection = (inventoryId, charStats, charClass) => {
  const container = document.querySelector(`#${inventoryId}-container .char-stats`)

  container.innerHTML = ''
  renderStatsContainer(container, charStats, charClass)
}

const handleNewRandomCharInit = () => {
  const state = getState()
  const charStats = getRandomAttributes()
  const suggestions = getClassSuggestions(charStats, 'PrimeAttr')
  const matched = getBestClass(suggestions)

  // FIXME debug
  // const matched = getBestClass([['Cleric', [['Wisdom', 13]], { Constitution: 14, Wisdom: 16 }]])

  let charClass
  if (matched) {
    charClass = characterClasses[matched]
  } else {
    console.info('No matching classes. Choosing random')
    charClass = getRandomClass()
  }

  charStats.HitPoints = getCharHitPoints(charClass, charStats.Constitution.HitPoints)
  const currentInventoryId = state.getCurrentInventoryId()
  state.setCharacter(currentInventoryId, charStats, charClass)
  renderCharacterSection(currentInventoryId, charStats, charClass)
}

const subscribeToEvents = () => {
  document.addEventListener('SelectInventory', (event) => {
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

const main = () => {
  subscribeToEvents()

  const currentInventoryId = getState().getCurrentInventoryId()
  const equipmentContainer = document.getElementById('equipment-container')

  createCategorySection(equipmentContainer, 'Armor', Armor)
  createCategorySection(equipmentContainer, 'Weapons', Weapons)
  createCategorySection(equipmentContainer, 'Equipment', Equipment)

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
