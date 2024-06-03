import { AllEquipment, Armor, Equipment, Weapons } from '../data/equipment.js'
import { createElementFromHtml, getBaseMovementRate, getEquipNameSuffix, getSpeed } from './utils.js'

/**
 * @typedef {Object} InventoryItem
 * @property {string} name - The name of the item.
 * @property {number} weightLbs - The weight of the item in pounds.
 * @property {number} cost - The cost of the item in gold pieces.
 * @property {number} quantity - The quantity of the item in the index.
 * @property {InventoryItemFlag} flags - Binary flags
 */

/**
 * @type {Object.<string, InventoryItem>}
 */
const inventory = {
  'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weightLbs: 10 },
}

/**
 * @param {EquipItem} item
 */
const addToInventory = (item) => {
  if (!inventory[item.name]) {
    inventory[item.name] = { ...item, quantity: 0 }
  }
  inventory[item.name].quantity++
}

/**
 * Updates the HTML element with speeds for walking, running, and combat based on the base movement rate.
 * @param {number} baseMovementRate The base movement rate of a character.
 */
const updateSpeedDisplay = (baseMovementRate) => {
  const speeds = getSpeed(baseMovementRate)
  document.getElementById('speed-feet-per-turn').textContent =
    `Walking: ${speeds.walking} • Running: ${speeds.running} • Combat: ${speeds.combat}`
}

const renderInventory = () => {
  const cellClassnames = 'px-4 py-1'
  const inventoryTableBody = document.querySelector('#inventory-table-container table tbody')
  inventoryTableBody.innerHTML = ''

  let totalWeight = 0
  let totalCost = 0

  Object.values(inventory).forEach((item) => {
    const row = inventoryTableBody.insertRow()
    row.className = 'hover:bg-gray-100' // Add hover style

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
    removeButton.onclick = () => removeFromInventory(item.name)

    const actionsCell = row.insertCell(4)
    actionsCell.appendChild(removeButton)
    actionsCell.className = cellClassnames

    totalWeight += item.weightLbs * item.quantity
    totalCost += item.cost * item.quantity
  })

  // Assume a placeholder for a carry modifier, which should be part of character's stats
  const carryModifier = 0 // This value would typically come from character data
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier)

  document.getElementById('total-weight').textContent = totalWeight.toFixed(1)
  document.getElementById('total-cost').textContent = totalCost.toFixed(2)
  document.getElementById('base-movement-rate').textContent = baseMovementRate

  updateSpeedDisplay(baseMovementRate)
}

/**
 * @param {string} categoryName
 * @returns {string}
 */
const createEquipTableHtml = (categoryName) => `
        <section id="${categoryName.toLowerCase().replace(/\s/g, '-')}-section" class="mb-8">
            <h2 class="text-xl font-bold mb-2">${categoryName}</h2>
            <table class="min-w-full bg-white shadow-md rounded">
                <thead class="bg-gray-200 text-left">
                    <tr>
                        <th class="px-4 py-2">Name</th>
                        <th class="px-4 py-2">Weight</th>
                        <th class="px-4 py-2">Cost, gp</th>
                        <th class="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>`

/**
 * @param {HTMLTableSectionElement} tableBody
 * @param {EquipItem} item
 */
const addEquipmentToTable = (tableBody, item) => {
  const row = tableBody.insertRow()
  row.className = 'hover:bg-gray-100'

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
    addToInventory(item)
    renderInventory()
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
  const sectionHtml = createEquipTableHtml(categoryName)
  const section = createElementFromHtml(sectionHtml)
  container.appendChild(section)

  const tableBody = section.querySelector('tbody')
  items.forEach((item) => addEquipmentToTable(tableBody, item))
}

const renderInitialInventory = () => {
  const inventoryTableContainer = document.getElementById('inventory-table-container')
  inventoryTableContainer.appendChild(
    createElementFromHtml(`
        <table class="min-w-full bg-white shadow-md rounded">
            <thead class="bg-gray-200 text-left">
                <tr>
                    <th class="px-4 py-2">Name</th>
                    <th class="px-4 py-2">Quantity</th>
                    <th class="px-4 py-2">Total Weight</th>
                    <th class="px-4 py-2">Total Cost</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `),
  )
}

/**
 * Decreases the quantity of an item in the index or removes it entirely if quantity reaches zero.
 * @param {string} itemName The name of the item to remove.
 */
const removeFromInventory = (itemName) => {
  if (inventory[itemName]) {
    inventory[itemName].quantity -= 1
    if (inventory[itemName].quantity <= 0) {
      delete inventory[itemName] // Remove the item entirely if quantity is zero
    }
    renderInventory() // Update the UI to reflect the change
  }
}

const bindConversionControls = () => {
  document.getElementById('convert-button').addEventListener('click', function () {
    const input = document.getElementById('equipment-input').value
    const itemList = input.split('\n') // Split input by new lines to get individual items
    const notFoundItems = [] // To store items not found in the lists

    itemList.forEach((itemName) => {
      const cleanedItemName = itemName.trim().toLowerCase()

      const item = AllEquipment.find((i) => i.name.toLowerCase() === cleanedItemName)
      if (item) {
        addToInventory({ ...item, quantity: 1 }) // Assume adding one item at a time
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

    renderInventory() // Update UI to reflect changes in index
  })
}

const main = () => {
  const equipmentContainer = document.getElementById('equipment-container')

  createCategorySection(equipmentContainer, 'Armor', Armor)
  createCategorySection(equipmentContainer, 'Weapons', Weapons)
  createCategorySection(equipmentContainer, 'Equipment', Equipment)

  renderInitialInventory()
  bindConversionControls()
  renderInventory()
}

document.addEventListener('DOMContentLoaded', main)
