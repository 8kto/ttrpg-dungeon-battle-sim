import { strengthModifiers } from '../data/modifiers.js?v=$VERSION$'
import { rollDiceFormula } from './dice.js?v=$VERSION$'

export const getStrengthModifier = () => {
  const score = rollDiceFormula('3d6')

  const modifiers = strengthModifiers.find((modifier) => score >= modifier.min && score <= modifier.max)

  if (!modifiers) {
    throw new Error('Score is out of range')
  }
  delete modifiers.max
  delete modifiers.min

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
