import { MELEE_AND_MISSILE, TWO_HANDED, VAR_HANDED } from '../data/equipment.js'
import { setCurrentInventoryId } from './state.js'

export const createElementFromHtml = (htmlString) => {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()

  return div.firstChild
}

/**
 * Determines the base movement rate based on the total weight carried and a carry modifier.
 * @param {number} totalWeight The total weight of equipment being carried.
 * @param {number} carryModifier The carry modifier from character's strength or other attributes.
 * @returns {number} The base movement rate.
 */
export const getBaseMovementRate = (totalWeight, carryModifier) => {
  // Adjust the total weight with the carry modifier.
  const adjustedWeight = totalWeight + carryModifier

  // Determine the base movement rate based on the adjusted weight.
  if (adjustedWeight <= 75) {
    return 12
  } else if (adjustedWeight <= 100) {
    return 9
  } else if (adjustedWeight <= 150) {
    return 6
  } else if (adjustedWeight <= 300) {
    return 3
  } else {
    // If weight exceeds the maximum limit defined, consider movement severely restricted or zero.
    return 0 // Adjust accordingly if there's a different rule for weights above 300 pounds.
  }
}

/**
 * Calculates speeds for walking, running, and combat based on the base movement rate.
 * @param {number} baseMovementRate The base movement rate of a character.
 * @returns {Object} An object containing the speeds for walking, running, and combat.
 */
export const getSpeed = (baseMovementRate) => ({
  combat: Math.floor(baseMovementRate / 3) * 10,
  running: baseMovementRate * 40,
  walking: baseMovementRate * 20,
})

/**
 * @param {number} flags
 * @returns {string|string}
 */
export const getEquipNameSuffix = (flags) => {
  let sfx = ''
  if (flags & VAR_HANDED) {
    sfx += '†'
  }
  if (flags & TWO_HANDED) {
    sfx += '*'
  }
  if (flags & MELEE_AND_MISSILE) {
    sfx += '‡'
  }

  return sfx ? `<span class="text-red-800 ml-3">${sfx}</span>` : ''
}

/**
 * @param {string} id
 * @param {string} name
 */
export const renderInitialInventory = (id, name) => {
  const inventoryTableContainer = document.getElementById('inventories-container')
  inventoryTableContainer.appendChild(
    createElementFromHtml(`
        <section id="${id}-container" class="inventory-container px-2 py-4 border">
          <h3 id="${id}-header" class="inventory-header text-lg font-semibold mb-4 hover:text-red-700 hover:cursor-pointer">${name ?? id}</h3>
          <table id="${id}-table-container" class="min-w-full bg-white shadow-md rounded">
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
          <section class="mt-4 mb-8">
            <p>Total Weight: <span id="${id}-total-weight" class="font-semibold">0</span> pounds</p>
            <p>Total Cost: <span id="${id}-total-cost" class="font-semibold">0</span> gold pieces</p>
            <p>Base movement rate: <span id="${id}-base-movement-rate" class="font-semibold">0</span></p>
            <p>
              <span class="">Speed</span>, feet per turn: <span id="${id}-speed-feet-per-turn" class="text-red-800">...</span>
            </p>
          </section>
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
 * @param {string} selectedId - The ID of the inventory to mark as selected.
 */
export const markSelectedInventory = (selectedId) => {
  // Remove any existing 'selected' markers from all inventory headers
  document.querySelectorAll('.inventory-header .selected').forEach((element) => {
    element.remove()
  })
  document.querySelectorAll('.inventory-container.selected').forEach((element) => {
    element.classList.remove('selected')
  })

  // Get the header element of the currently selected inventory
  const headerElement = document.getElementById(`${selectedId}-header`)
  if (headerElement) {
    // Create a new span element to show as 'selected'
    const selectedSpan = createElementFromHtml(`<span class="selected text-gray-400 ml-2">[selected]</span>`)

    // Append the 'selected' marker to the header
    headerElement.appendChild(selectedSpan)
  }

  const sectionElement = document.getElementById(`${selectedId}-container`)
  sectionElement.classList.add('selected')
}
