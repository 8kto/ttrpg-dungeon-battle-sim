import { AttrScore, characterClasses, PRIME_ATTR_MIN } from '../data/classes.js?v=$VERSION$'
import {
  charismaModifiers,
  constitutionModifiers,
  dexterityModifiers,
  intelligenceModifiers,
  strengthModifiers,
} from '../data/modifiers.js?v=$VERSION$'
import { roll, rollDiceFormula, secureRandomInteger } from './dice.js?v=$VERSION$'

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
    [AttrScore.Strength]: getModifier(strengthModifiers, roll()),
    [AttrScore.Dexterity]: getModifier(dexterityModifiers, roll()),
    [AttrScore.Constitution]: getModifier(constitutionModifiers, roll()),
    [AttrScore.Intelligence]: getModifier(intelligenceModifiers, roll()),
    [AttrScore.Wisdom]: getModifier({}, roll()),
    [AttrScore.Charisma]: getModifier(charismaModifiers, roll()),
    Gold: roll() * 10,
  }
}

/**
 * @param {CharacterStats} stats
 * @param {'PrimeAttr' | 'StrictAttr'} kind
 */
export const getClassSuggestionsXXX = (stats, kind) => {
  if (kind !== 'PrimeAttr') {
    throw new Error('Not implemented')
  }

  const validAttrs = []
  const matchingClasses = []

  Object.values(AttrScore).forEach((attrName) => {
    if (stats[attrName].Score >= PRIME_ATTR_MIN) {
      validAttrs.push(attrName)
    }
  })

  Object.entries(characterClasses).forEach(([className, classDef]) => {
    const isMatching = classDef.PrimeAttr.every(([primeAttrName]) => {
      return validAttrs.includes(primeAttrName)
    })

    if (isMatching) {
      matchingClasses.push(className)
    }
  })

  return [validAttrs, matchingClasses]
}

/**
 * TODO sort attrs, choose the highest
 * TODO if all below 13, suggest a class for the highest attr
 * @param {CharacterStats} stats
 * @param {'PrimeAttr' | 'StrictAttr'} kind
 * @returns {string[]} Matching class names
 */
export const getClassSuggestions = (stats, kind) => {
  if (kind !== 'PrimeAttr') {
    throw new Error('Not implemented')
  }

  const validAttrs = getValidAttributes(stats, PRIME_ATTR_MIN)

  return getMatchingClasses(validAttrs)
}

/**
 * @param {CharacterStats} stats
 * @param {number} minScore
 * @returns {string[]} Valid attribute names
 */
const getValidAttributes = (stats, minScore) => {
  return Object.values(AttrScore).filter((attrName) => stats[attrName].Score >= minScore)
}

/**
 * @param {string[]} validAttrs
 * @returns {string[]} Matching class names
 */
const getMatchingClasses = (validAttrs) => {
  return Object.entries(characterClasses).reduce((matchingClasses, [className, classDef]) => {
    const isMatching = classDef.PrimeAttr.every(([primeAttrName]) => {
      return validAttrs.includes(primeAttrName)
    })

    if (isMatching) {
      matchingClasses.push(className)
    }

    return matchingClasses
  }, [])
}

/**
 * @param {Array<CharacterClass>} suggestedClasses
 * @returns {CharacterClass|null}
 */
export const getRandomClass = (suggestedClasses) => {
  if (!suggestedClasses.length) {
    return null
  }

  return characterClasses[suggestedClasses[secureRandomInteger(0, suggestedClasses.length - 1)]]
}

/**
 * @param {CharacterClassDef} charClass
 * @param {CharacterStats} stats
 * @returns {number}
 */
export const getCharHitPoints = (charClass, stats) => {
  if (!charClass) {
    return null
  }
  const baseHp = roll(charClass.HitDice)
  const bonusHp = stats.Constitution.HitPoints

  // Return at least 1 HP
  return Math.max(baseHp + bonusHp, 1)
}

// TODO HP + special handling for Rangers
// TODO Class (HD, available races)
// TODO Race
// TODO Spells for 1st level casters
// TODO get EXP bonuses
// TODO apply to Carry modifier to encumbrance
// TODO class Armor/Shield/Weapons
// TODO char AC
// TODO char To Hit
// TODO saving Throw / num + details
// TODO generate with strict 0e attrs
// TODO Fighter Parrying Ability
