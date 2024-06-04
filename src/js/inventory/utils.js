import { MELEE_AND_MISSILE, TWO_HANDED, VAR_HANDED } from '../data/equipment.js'

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
 * @param {number} flags
 * @returns {string}
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
 * @param {string} name
 * @returns {string}
 */
export const getIdFromName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-')
}
