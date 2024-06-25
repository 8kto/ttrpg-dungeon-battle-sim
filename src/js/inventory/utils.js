import { AllEquipment, MELEE_AND_MISSILE, TWO_HANDED, VAR_HANDED } from '../data/equipment.js?v=$VERSION$'

/**
 * Determines the base movement rate based on the total weight carried and a carry modifier.
 *
 * @param {number} totalWeight The total weight of equipment being carried.
 * @param {number} carryModifier The carry modifier from character's strength or other attributes.
 * @returns {number}
 */
export const getBaseMovementRate = (totalWeight, carryModifier) => {
  const adjustedWeight = totalWeight + carryModifier

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
    return 0
  }
}

/**
 * Calculates speeds for walking, running, and combat based on the base movement rate.
 *
 * @param {number} baseMovementRate The base movement rate of a character.
 * @returns {Object} An object containing the speeds for walking, running, and combat.
 */
export const getSpeed = (baseMovementRate) => ({
  combat: Math.floor(baseMovementRate / 3) * 10,
  running: baseMovementRate * 40,
  walking: baseMovementRate * 20,
})

/**
 * @param {EquipItem} item
 * @returns {string}
 */
export const getEquipNameSuffix = (item) => {
  let sfx = ''

  if (item.armorClass) {
    sfx += `AC ${item.armorClass}`
  }

  if (item.damage) {
    sfx += `${item.damage} `
  }

  if (item.flags & VAR_HANDED) {
    sfx += '†'
  }
  if (item.flags & TWO_HANDED) {
    sfx += '*'
  }
  if (item.flags & MELEE_AND_MISSILE) {
    sfx += '‡'
  }

  // Line breaks not allowed
  sfx = sfx.replaceAll(' ', '&nbsp;')

  return sfx ? `<span class="text-alt ml-3 text-xs">${sfx}</span>` : ''
}

/**
 * @param {string} name
 * @returns {string}
 */
export const getIdFromName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-') + new Date().getTime()
}

/**
 * @param {string} name
 * @param {Object} [payload] - Optional payload to include with the event
 */
export const dispatchEvent = (name, payload = {}) => {
  document.dispatchEvent(new CustomEvent(name, { detail: payload }))
}

/**
 * @param {Inventory} inventory
 * @param {EquipSet} equipSet
 */
export const importEquipSet = (inventory, equipSet) => {
  equipSet.items.forEach((item) => {
    const originalItem = AllEquipment.find((i) => i.name === item.name)
    if (!originalItem) {
      throw new Error(`Original equip item not found for ${item.name}`)
    }

    inventory.items[item.name] = {
      ...originalItem,
      quantity: item.quantity + (inventory.items[item.name]?.quantity || 0),
    }
  })
}

/**
 * @param {string} errorMessage
 */
export const renderErrorMessage = (errorMessage) => {
  const pageContentElement = document.querySelector('.page-content')
  const errorMsgElement = document.createElement('div')

  errorMsgElement.className = 'border rounded px-4 py-2 border-red-400 bg-red-100 m-auto my-10'
  errorMsgElement.textContent = errorMessage
  pageContentElement.classList.add('text-center')
  pageContentElement.innerHTML = ''
  pageContentElement.appendChild(errorMsgElement)
}
