import { AllEquipment, Armor, Equipment, Weapons } from '../data/equipment.js'
import { DEFAULT_INVENTORY_ID, getState, State } from './State.js'
import { dispatchEvent, getBaseMovementRate, getEquipNameSuffix, getIdFromName, getSpeed } from './utils.js'
import { createElementFromHtml, getEquipTable, markSelectedInventory, renderInitialInventory } from './utils.layout.js'

const state = getState()

/**
 * @typedef {Object} InventoryItem
 * @property {string} name - The name of the item.
 * @property {number} weightLbs - The weight of the item in pounds.
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
  document.getElementById(`${inventoryId}-speed-feet-per-turn`).textContent =
    `Walking: ${speeds.walking} • Running: ${speeds.running} • Combat: ${speeds.combat}`
}

/**
 * Renders the specified inventory in the UI.
 * @param {string} id - The identifier for the inventory to be rendered.
 * @param {string} [name]
 */
const renderInventory = (id, name) => {
  const inventory = state.getInventory(id)
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
    row.className = 'even:bg-gray-50 hover:bg-gray-100'

    const nameCell = row.insertCell(0)
    nameCell.innerHTML = item.name + getEquipNameSuffix(item.flags)
    nameCell.className = cellClassnames

    const qtyCell = row.insertCell(1)
    qtyCell.textContent = item.quantity
    qtyCell.className = cellClassnames

    const weightCell = row.insertCell(2)
    weightCell.textContent = item.weightLbs * item.quantity
    weightCell.className = cellClassnames

    const costCell = row.insertCell(3)
    costCell.textContent = item.cost * item.quantity
    costCell.className = cellClassnames

    // Create and append the Remove button
    const removeButton = document.createElement('button')
    removeButton.textContent = 'Remove'
    removeButton.className = 'px-4 py-1 text-sm text-red-500 hover:text-red-700'
    removeButton.onclick = () => {
      state.removeFromInventory(id, item.name)
      renderInventory(id, name)
    }

    const actionsCell = row.insertCell(4)
    actionsCell.appendChild(removeButton)
    actionsCell.className = cellClassnames

    totalWeight += item.weightLbs * item.quantity
    totalCost += item.cost * item.quantity
  })

  const carryModifier = 0 // Placeholder for a carry modifier
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier)

  document.getElementById(`${id}-total-weight`).textContent = totalWeight.toFixed(1)
  document.getElementById(`${id}-total-cost`).textContent = totalCost.toFixed(2)
  document.getElementById(`${id}-base-movement-rate`).textContent = baseMovementRate

  updateSpeedDisplay(id, baseMovementRate)
}

/**
 * @param {HTMLTableSectionElement} tableBody
 * @param {EquipItem} item
 */
const addEquipmentToTable = (tableBody, item) => {
  const row = tableBody.insertRow()
  row.className = 'even:bg-gray-50 hover:bg-gray-100'

  const cellClassnames = 'px-4 py-1'

  // Create and set properties for the name cell
  const nameCell = row.insertCell(0)

  nameCell.innerHTML = item.name + getEquipNameSuffix(item.flags)
  nameCell.className = cellClassnames

  // Create and set properties for the weight cell
  const weightCell = row.insertCell(1)
  weightCell.textContent = item.weightLbs
  weightCell.className = cellClassnames

  // Create and set properties for the cost cell
  const costCell = row.insertCell(2)
  costCell.textContent = item.cost
  costCell.className = cellClassnames

  // Create and set properties for the button cell
  const addButton = document.createElement('button')
  addButton.textContent = 'Add'
  addButton.className = 'px-4 text-sm text-left font-medium text-blue-900 hover:text-red-800'
  addButton.onclick = () => {
    const inventoryId = state.getCurrentInventoryId()
    state.addToInventory(inventoryId, item)
    renderInventory(inventoryId, inventoryId)
  }

  const addCell = row.insertCell(3)
  addCell.appendChild(addButton)
  addCell.className = cellClassnames
}

/**
 * @param {HTMLElement} container
 * @param {string} categoryName
 * @param {Array<EquipItem>} items
 */
const createCategorySection = (container, categoryName, items) => {
  const sectionHtml = getEquipTable(categoryName)
  const section = createElementFromHtml(sectionHtml)
  container.appendChild(section)

  const tableBody = section.querySelector('tbody')
  items.forEach((item) => addEquipmentToTable(tableBody, item))
}

const bindConversionControls = () => {
  document.getElementById('convert-button').addEventListener('click', function () {
    const currentInventoryId = state.getCurrentInventoryId()
    const input = document.getElementById('equipment-input').value
    const itemList = input.split('\n') // Split input by new lines to get individual items
    const notFoundItems = [] // To store items not found in the lists

    itemList.forEach((itemName) => {
      const cleanedItemName = itemName.trim().toLowerCase()

      const item = AllEquipment.find((i) => i.name.toLowerCase() === cleanedItemName)
      if (item) {
        state.addToInventory(currentInventoryId, { ...item, quantity: 1 }) // Assume adding one item at a time
      } else {
        notFoundItems.push(itemName)
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

  if (!state.getInventory(inventoryId)) {
    state.setInventory(inventoryId, State.getNewInventory(inventoryId, name))
    renderInventory(inventoryId, name)
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
    state.setCurrentInventoryId(inventoryId)
    markSelectedInventory(inventoryId)
  })
}

const bindDumpingControls = () => {
  const container = document.getElementById('dump-data-container--json-container')

  document.getElementById('dump-json-button').addEventListener('click', () => {
    container.textContent = state.getSerializeInventories()
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

const subscribeToEvents = () => {
  document.addEventListener('RenderInventories', () => {
    const inventoryTableContainer = document.getElementById('inventories-container')
    inventoryTableContainer.innerHTML = ''
    state.getInventories().forEach((inventory) => renderInventory(inventory.id, inventory.name))
  })
}

const main = () => {
  subscribeToEvents()

  const currentInventoryId = state.getCurrentInventoryId()
  const equipmentContainer = document.getElementById('equipment-container')

  createCategorySection(equipmentContainer, 'Armor', Armor)
  createCategorySection(equipmentContainer, 'Weapons', Weapons)
  createCategorySection(equipmentContainer, 'Equipment', Equipment)

  bindConversionControls()
  bindInventoryControls()
  dispatchEvent('RenderInventories')
  markSelectedInventory(currentInventoryId)
  bindDumpingControls()
}

document.addEventListener('DOMContentLoaded', main)
