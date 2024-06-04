import { setCurrentInventoryId } from './state.js'

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
                      <th class="px-4 py-2">Name</th>
                      <th class="px-4 py-2">Quantity</th>
                      <th class="px-4 py-2">Total Weight</th>
                      <th class="px-4 py-2">Total Cost</th>
                      <th class="px-4 py-2">Actions</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>`
}

/**
 * @param {string} id
 * @returns {string}
 */
const getInventoryControlsSection = (id) => {
  return `<section class="mt-4">
            <p>Total Weight: <span id="${id}-total-weight" class="font-semibold">0</span> pounds</p>
            <p>Total Cost: <span id="${id}-total-cost" class="font-semibold">0</span> gold pieces</p>
            <p>Base movement rate: <span id="${id}-base-movement-rate" class="font-semibold">0</span></p>
            <p>
              <span class="">Speed</span>, feet per turn: <span id="${id}-speed-feet-per-turn" class="text-red-800">...</span>
            </p>
          </section>`
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
          <h3 id="${id}-header" class="inventory-header text-lg mb-4 hover:text-red-700 hover:cursor-pointer">${name ?? id}</h3>
          ${getInventoryTable(id)}
          ${getInventoryControlsSection(id)}
        </section>
    `),
  )

  document.getElementById(`${id}-header`).addEventListener('click', () => {
    setCurrentInventoryId(id)
    markSelectedInventory(id)
  })
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
}
