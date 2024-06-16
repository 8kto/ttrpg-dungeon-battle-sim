import { strengthModifiers } from '../data/modifiers.js?v=$VERSION$'
import { rollDiceFormula } from './dice.js?v=$VERSION$'

/**
 * @param {number} num
 * @returns {number}
 */
export const getMatchingScore = (num) => {
  const scores = Object.keys(strengthModifiers).map(Number)
  let searchScore = scores[0]

  for (const s of scores) {
    searchScore = s

    if (num <= s) {
      break
    }
  }

  return searchScore
}

export const getStrengthModifier = () => {
  const score = rollDiceFormula('3d6')
  const matched = getMatchingScore(score)
  const modifiers = strengthModifiers[matched]

  if (!matched) {
    throw new Error('Score is out of range')
  }

  return {
    Score: score,
    ...modifiers,
  }
}

export const getNewCharacterModifiers = () => {
  return {
    Strength: getStrengthModifier(),
  }
}
