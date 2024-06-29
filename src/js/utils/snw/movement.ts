import { BaseMovementRate, UndergroundMovement } from '../domain/snw/Movement'

/**
 * Determines the base movement rate based on the total weight carried and a carry modifier.
 *
 * @param {number} totalWeight The total weight of equipment being carried.
 * @param {number} carryModifier The carry modifier from character's strength or other attributes.
 * @returns {number}
 */
export const getBaseMovementRate = (totalWeight: number, carryModifier: number): BaseMovementRate => {
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
    return 0
  }
}

export const getUndergroundSpeed = (baseMovementRate: BaseMovementRate): UndergroundMovement => ({
  combat: Math.floor(baseMovementRate / 3) * 10,
  running: baseMovementRate * 40,
  walking: baseMovementRate * 20,
})
