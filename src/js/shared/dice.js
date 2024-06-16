/**
 * @typedef {'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'} DiceKind
 * @typedef {4 | 6 | 8 | 10 | 12 | 20 | 100} DiceSides
 */

/**
 * @type {Record<DiceKind, DiceSides>}
 */
export const Dice = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
}

/**
 * Generates a cryptographically secure random integer between min (inclusive) and max (inclusive)
 * @param {number} min - The minimum integer value
 * @param {number} max - The maximum integer value
 * @returns {number} - A random integer between min and max
 */
const secureRandomInteger = (min, max) => {
  const range = max - min + 1
  const maxUint32 = 0xffffffff
  const limit = maxUint32 - (maxUint32 % range)
  let randomValue

  do {
    randomValue = crypto.getRandomValues(new window.Uint32Array(1))[0]
  } while (randomValue >= limit)

  return min + (randomValue % range)
}

/**
 * Rolls a die of the specified type
 * @param {number} dice - The type of dice to roll (default is d100)
 * @returns {number} - The result of the dice roll
 */
export const roll = (dice = Dice.d100) => secureRandomInteger(1, dice)

/**
 * @param {string} formula e.g. 3d6, 2d10, etc.
 * @returns {number}
 */
export const rollDiceFormula = (formula) => {
  const [numDice, numSides] = formula.split('d').map(Number)

  if (isNaN(numDice) || isNaN(numSides)) {
    throw new Error('Invalid dice formula')
  }

  let total = 0

  for (let i = 0; i < numDice; i++) {
    total += roll(numSides)
  }

  return total
}
