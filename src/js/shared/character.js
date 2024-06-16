import {
  charismaModifiers,
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
  let matched = scores[0]

  for (const score of scores) {
    matched = score

    if (num <= score) {
      break
    }
  }

  return matched
}

/**
 * @param {Record<number, unknown>} modifiers
 * @param {number} score
 * @returns {Object}
 */
const getModifier = (modifiers, score) => {
  const matched = getMatchingScore(modifiers, score)

  const modifierData = modifiers[matched] || {}

  return {
    Score: score,
    ...modifierData,
  }
}

/**
 * @returns {CharacterStats}
 */
export const getNewCharacterModifiers = () => {
  const roll = rollDiceFormula.bind(null, '3d6')

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  return {
    Strength: getModifier(strengthModifiers, roll()),
    Dexterity: getModifier(dexterityModifiers, roll()),
    Constitution: getModifier(constitutionModifiers, roll()),
    Intelligence: getModifier(intelligenceModifiers, roll()),
    Wisdom: getModifier({}, roll()),
    Charisma: getModifier(charismaModifiers, roll()),
    Gold: roll() * 10,
  }
}
