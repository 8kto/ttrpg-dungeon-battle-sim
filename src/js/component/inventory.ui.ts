import { BaseMovementRate } from '../domain/snw/Movement'
import { DEFAULT_INVENTORY_ID, getState, State } from '../state/State'
import { getEquipNameSuffix } from '../utils/equipment'
import { dispatchEvent } from '../utils/event'
import { getInventoryIdFromName } from '../utils/inventory'
import { createElementFromHtml, scrollToElement } from '../utils/layout'
import { getBaseMovementRate, getUndergroundSpeed } from '../utils/snw/movement'

const getInventoryTable = (inventoryId: string): string => {
  return `<table id="${inventoryId}-table-container" class="min-w-full bg-white shadow-md rounded my-4">
              <thead class="bg-gen-100 text-left">
                  <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/2">Name</th>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Quantity</th>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Total Weight</th>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Total Cost</th>
                      <th class="px-2 py-3 text-center text-xs font-medium uppercase w-1/6">Actions</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>`
}

const getInventoryControlsSection = (inventoryId: string): string => {
  return `<section class="inventory-controls mt-0 text-gen-800 text-sm absolute top-0 right-0">
            <div class="flex justify-end">
              <button id="${inventoryId}-rename-inventory" class="text-xs bg-white border border-r-0 text-gen-400 hover:text-white rounded-l hover:bg-gen-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Rename inventory" aria-label="Rename inventory" class="block px-2 py-1">Rename</span>
              </button>
              <button id="${inventoryId}-remove-char" class="text-xs bg-white border border-r-0 text-gen-400 hover:text-white hover:bg-gen-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Remove character" aria-label="Remove character" class="block px-2 py-1">Remove character</span>
              </button>
              <button id="${inventoryId}-reset-inventory" class="text-xs bg-white border border-r-0 text-gen-400 hover:text-white hover:bg-gen-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Reset inventory items" aria-label="Reset inventory items" class="block px-2 py-1">Reset</span>
              </button>
              <button id="${inventoryId}-remove-inventory" class="text-xs bg-white border text-gen-400 hover:text-white rounded-r hover:bg-gen-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Remove inventory" aria-label="Remove inventory" class="block px-3 py-1.5">❌</span>
              </button>
            </div>
          </section>`
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
 * Run once per inventory
 */
export const bindInventoryControls = (inventoryId: string): void => {
  document.getElementById(`${inventoryId}-header`).addEventListener('click', () => {
    dispatchEvent('SelectInventory', { id: inventoryId })
  })

  document.getElementById(`${inventoryId}-remove-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    if (confirm(`Remove inventory for ${inventory.name}?`)) {
      state.removeInventory(inventoryId)

      const selected = state.getInventories()[0]
      if (selected) {
        state.setCurrentInventoryId(selected.id)

        dispatchEvent('RenderInventories')
        dispatchEvent('SelectInventory', { id: selected.id })
      } else {
        dispatchEvent('RenderInventories')
      }
    }
  })

  document.getElementById(`${inventoryId}-reset-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    if (confirm(`Reset inventory items for ${inventory.name}?`)) {
      state.resetInventoryItems(inventoryId)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { id: inventoryId })
    }
  })

  document.getElementById(`${inventoryId}-rename-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)
    const name = prompt(`Enter new name`, inventory.name)

    if (name) {
      inventory.name = name
      state.setInventory(inventoryId, inventory)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { id: inventoryId })
    }
  })

  document.getElementById(`${inventoryId}-remove-char`).addEventListener('click', () => {
    dispatchEvent('RemoveCharacter', { inventoryId })
  })
}

const getInventoryDetails = (inventoryId: string): string => {
  const inventory = getState().getInventory(inventoryId)
  const carryModifier = inventory.character?.stats?.Strength?.Carry || 0
  const carryFragment = !carryModifier
    ? ''
    : `&nbsp;<span>(Carry modifier: ${carryModifier < 0 ? carryModifier : `+${carryModifier}`} pounds)</span>`

  return `<div class="text-sm mb-4">
            <p>Total Weight: <span id="${inventoryId}-total-weight" class="font-semibold">0</span> pounds${carryFragment}</p>
            <p>Total Cost: <span id="${inventoryId}-total-cost" class="font-semibold">0</span> gold pieces</p>
            <p>Base movement rate: <span id="${inventoryId}-base-movement-rate" class="font-semibold">0</span></p>
            <p>
              <span class="">Underground speed</span>, feet per turn: <span id="${inventoryId}-speed-feet-per-turn" class="text-gen-800">...</span>
            </p>
          </div>`
}

export const renderInitialInventory = (inventoryId: string, name?: string): void => {
  const container = document.getElementById('inventories-container')

  container.appendChild(
    createElementFromHtml(`
        <section id="${inventoryId}-container" class="inventory-container px-4 py-4 border shadow-lg">
          <header class="relative">
            ${getInventoryControlsSection(inventoryId)}
            <h3
              id="${inventoryId}-header"
              class="inventory-header text-lg text-alt mb-4 hover:text-red-700 hover:cursor-pointer"
              title="Click to select"
            >${name ?? inventoryId}</h3>
            <div class="char-stats my-2">
              <div class="char-stats--controls mb-2"></div>
              <div class="char-stats--container mb-2"></div>
            </div>
          </header>
          ${getInventoryTable(inventoryId)}
          ${getInventoryDetails(inventoryId)}
        </section>
    `),
  )

  bindInventoryControls(inventoryId)
  dispatchEvent('RenderNewCharacterControlsSection', { inventoryId })
}

export const markSelectedInventory = (inventoryId: string): void => {
  document.querySelectorAll('.inventory-header .selected').forEach((element) => element.remove())
  document.querySelectorAll('.inventory-container.selected').forEach((element) => element.classList.remove('selected'))

  // Get the header element of the currently selected inventory
  const headerElement = document.getElementById(`${inventoryId}-header`)
  if (headerElement) {
    headerElement.appendChild(
      createElementFromHtml(`<span class="text-alt selected text-sm ml-2" title="Selected character">🛡️</span>`),
    )
  }

  const sectionElement = document.getElementById(`${inventoryId}-container`)
  sectionElement.classList.add('selected')

  const containerTitle = document.getElementById('inventory-container-title')
  containerTitle.textContent = getState().getInventory(inventoryId).name
}

/**
 * Renders the specified inventory in the UI.
 */
export const renderInventory = (inventoryId: string, name?: string): void => {
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

  const charStats = inventory.character?.stats
  const carryModifier = charStats?.Strength.Carry || 0
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier)

  document.getElementById(`${inventoryId}-total-weight`).textContent = totalWeight.toFixed(1)
  document.getElementById(`${inventoryId}-total-cost`).textContent = totalCost.toFixed(2)
  document.getElementById(`${inventoryId}-base-movement-rate`).textContent = baseMovementRate.toString()

  // FIXME to char stats section
  updateSpeedDisplay(inventoryId, baseMovementRate)
}

export const updateSpeedDisplay = (inventoryId: string, baseMovementRate: BaseMovementRate): void => {
  const speeds = getUndergroundSpeed(baseMovementRate)
  document.getElementById(`${inventoryId}-speed-feet-per-turn`).innerHTML =
    `Walking: <span class="text-alt">${speeds.walking}</span>` +
    ` • Running: <span class="text-alt">${speeds.running}</span>` +
    ` • Combat: <span class="text-alt">${speeds.combat}</span>`
}

export const renderInventories = (): void => {
  const inventoryTableContainer = document.getElementById('inventories-container')
  inventoryTableContainer.innerHTML = ''
  getState()
    .getInventories()
    .forEach((inventory) => {
      renderInventory(inventory.id, inventory.name)

      if (inventory.character) {
        dispatchEvent('RenderCharacterSection', { inventoryId: inventory.id })
      } else {
        dispatchEvent('RenderNewRandomCharacter', { inventoryId: inventory.id })
      }
    })
}

/**
 * Run once
 */
const bindInventoryCommonControls = (): void => {
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

    state.serialize()
    dispatchEvent('RenderInventories')
  })

  document.getElementById('add-inventory-button').addEventListener('click', () => {
    const newNameInputElement = document.getElementById('new-inventory-name') as HTMLInputElement
    const inventoryName = newNameInputElement?.value.trim() || DEFAULT_INVENTORY_ID
    const inventoryId = addInventory(inventoryName)

    getState().setCurrentInventoryId(inventoryId)
    dispatchEvent('RenderNewRandomCharacter', { inventoryId })
    markSelectedInventory(inventoryId)
  })
}

/**
 * Run once
 */
export const initInventoryUi = (): void => {
  const currentInventoryId = getState().getCurrentInventoryId()

  dispatchEvent('RenderInventories')
  markSelectedInventory(currentInventoryId)

  bindInventoryCommonControls()
}

// TODO incl bind* to all render* funcs
// TODO ? Code conventions: all funcs within the same module should be called directly, not through the Events subscriptions
