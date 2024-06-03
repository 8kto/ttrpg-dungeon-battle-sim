import { MELEE_AND_MISSILE, TWO_HANDED, VAR_HANDED } from '../data/equipment.js'

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
        <section>
          <h3 class="text-lg font-bold mb-4">${name}</h3>
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
}
