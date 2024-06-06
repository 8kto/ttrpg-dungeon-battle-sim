import { getState } from './State.js'
import { dispatchEvent, getIdFromName } from './utils.js'

/**
 * @param {string} htmlString Should enclose the layout with one element (div, span etc.)
 * @returns {ChildNode}
 */
export const createElementFromHtml = (htmlString) => {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()

  return div.firstChild
}

/**
 * @param {string} id
 * @returns {string}
 */
const getInventoryTable = (id) => {
  return `<table id="${id}-table-container" class="min-w-full bg-white shadow-md rounded">
              <thead class="bg-gray-200 text-left">
                  <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Name</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Weight</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Actions</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>`
}

/**
 * @param {string} categoryName
 * @returns {string}
 */
export const getEquipTable = (categoryName) => `
        <section id="${getIdFromName(categoryName)}-section" class="mb-8">
            <h2 class="text-2xl font-bold mb-4">${categoryName}</h2>
            <table class="min-w-full bg-white shadow-md rounded">
                <thead class="bg-gray-200 text-left">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost, gp</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>`

/**
 * @param {string} id
 * @returns {string}
 */
const getInventoryControlsSection = (id) => {
  return `<section class="mt-4">
            <div class="mb-4">
              <p>Total Weight: <span id="${id}-total-weight" class="font-semibold">0</span> pounds</p>
              <p>Total Cost: <span id="${id}-total-cost" class="font-semibold">0</span> gold pieces</p>
              <p>Base movement rate: <span id="${id}-base-movement-rate" class="font-semibold">0</span></p>
              <p>
                <span class="">Speed</span>, feet per turn: <span id="${id}-speed-feet-per-turn" class="text-red-800">...</span>
              </p>
            </div>
            <div class="flex justify-end">
              <button id="${id}-rename-inventory" class="text-xs bg-gray-100 text-white rounded-l hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Rename inventory" aria-label="Rename inventory" class="block px-2 py-1 text-gray-500">Rename</span>
              </button>
              <button id="${id}-reset-inventory" class="text-xs bg-gray-100 text-white hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Reset inventory items" aria-label="Reset inventory items" class="block px-2 py-1 text-gray-500">Reset</span>
              </button>
              <button id="${id}-remove-inventory" class="text-xs bg-gray-100 text-white rounded-r hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Remove inventory" aria-label="Remove inventory" class="block px-3 py-1.5">❌</span>
              </button>
            </div>
          </section>`
}

/**
 * @param {string} id
 */
export const bindInventoryControls = (id) => {
  document.getElementById(`${id}-header`).addEventListener('click', () => {
    getState().setCurrentInventoryId(id)
    markSelectedInventory(id)
  })

  document.getElementById(`${id}-remove-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(id)

    if (confirm(`Remove inventory for ${inventory.name}?`)) {
      const inventories = state.getInventories()

      if (inventories.length > 1) {
        state.removeInventory(id)

        const selected = state.getInventories()[0]
        state.setCurrentInventoryId(selected.id)

        dispatchEvent('RenderInventories')
        markSelectedInventory(selected.id)
      } else {
        alert('Cannot remove the only inventory')
      }
    }
  })

  document.getElementById(`${id}-reset-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(id)

    if (confirm(`Reset inventory items for ${inventory.name}?`)) {
      state.resetInventoryItems(id)
      dispatchEvent('RenderInventories')
      markSelectedInventory(state.getCurrentInventoryId())
    }
  })

  document.getElementById(`${id}-rename-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(id)
    const name = prompt(`Enter new name`, inventory.name)

    if (name) {
      inventory.name = name
      state.setInventory(id, inventory)
      dispatchEvent('RenderInventories')
      markSelectedInventory(id)
    }
  })
}

/**
 * @param {string} id
 * @param {string} name
 */
export const renderInitialInventory = (id, name) => {
  const inventoryTableContainer = document.getElementById('inventories-container')

  inventoryTableContainer.appendChild(
    createElementFromHtml(`
        <section id="${id}-container" class="inventory-container px-4 py-2 border">
          <h3
            id="${id}-header"
            class="inventory-header text-lg mb-4 hover:text-red-700 hover:cursor-pointer"
            title="Click to select"
          >${name ?? id}</h3>
          ${getInventoryTable(id)}
          ${getInventoryControlsSection(id)}
        </section>
    `),
  )

  bindInventoryControls(id)
}

/**
 * Marks the selected inventory by updating the inventory headers.
 * @param {string} inventoryId - The ID of the inventory to mark as selected.
 */
export const markSelectedInventory = (inventoryId) => {
  document.querySelectorAll('.inventory-header .selected').forEach((element) => element.remove())
  document.querySelectorAll('.inventory-container.selected').forEach((element) => element.classList.remove('selected'))

  // Get the header element of the currently selected inventory
  const headerElement = document.getElementById(`${inventoryId}-header`)
  if (headerElement) {
    headerElement.appendChild(
      createElementFromHtml(
        `<span class="selected text-sm text-gray-400 ml-2" title="Currently selected inventory">🎒</span>`,
      ),
    )
  }

  const sectionElement = document.getElementById(`${inventoryId}-container`)
  sectionElement.classList.add('selected')

  const containerTitle = document.getElementById('inventory-container-title')
  containerTitle.textContent = getState().getInventory(inventoryId).name
}
