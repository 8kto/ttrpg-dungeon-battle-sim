import {
  constitutionModifiers,
  dexterityModifiers,
  intelligenceModifiers,
  strengthModifiers,
} from '../data/modifiers.js?v=$VERSION$'
import { rollDiceFormula } from './dice.js?v=$VERSION$'

/**
 * @param {Record<number, unknown>} keyedStorage
 * @param {number} num
 * @returns {number}
 */
export const getMatchingScore = (keyedStorage, num) => {
  const scores = Object.keys(keyedStorage).map(Number)
  let searchScore = scores[0]

  for (const s of scores) {
    searchScore = s

    if (num <= s) {
      break
    }
  }

  return searchScore
}

/**
 * @param {Record<number, unknown>} modifiers
 * @param {number} score
 * @returns {Object}
 */
const getModifier = (modifiers, score) => {
  const matched = getMatchingScore(modifiers, score)

  if (!matched) {
    throw new Error('Score is out of range')
  }

  const modifierData = modifiers[matched]

  return {
    Score: score,
    ...modifierData,
  }
}

export const getNewCharacterModifiers = () => {
  const roll = rollDiceFormula.bind(null, '3d6')

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  return {
    Strength: getModifier(strengthModifiers, roll()),
    Dexterity: getModifier(dexterityModifiers, roll()),
    Constitution: getModifier(constitutionModifiers, roll()),
    Intelligence: getModifier(intelligenceModifiers, roll()),
  }
}
