import { AttrScore, characterClasses, PRIME_ATTR_MIN } from '../data/classes.js?v=$VERSION$'
import {
  charismaModifiers,
  constitutionModifiers,
  dexterityModifiers,
  intelligenceModifiers,
  strengthModifiers,
} from '../data/modifiers.js?v=$VERSION$'
import { getRandomArrayItem, roll, rollDiceFormula } from './dice.js?v=$VERSION$'

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
export const getRandomAttributes = () => {
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
  const res = getMatchingClasses(validAttrs)

  if (!res.length) {
    const sortedAttrs = getSortedAttributes(stats)
    console.log(sortedAttrs)
  }

  return res
}

/**
 * @param {CharacterStats} stats
 * @param {number} minScore
 * @returns {Array<[AttrScore, number]>} Valid attribute names
 */
export const getValidAttributes = (stats, minScore) => {
  return Object.entries(stats)
    .filter(([key, val]) => !!val.Score && !!AttrScore[key] && val.Score >= minScore)
    .sort((a, b) => b[1].Score - a[1].Score)
    .map(([name, { Score }]) => [name, Score])
}

/**
 * @param {CharacterStats} stats
 * @returns {Array<AttrScore>} Attribute names sorted by theis scores
 */
export const getSortedAttributes = (stats) => {
  return Object.entries(stats)
    .filter(([key, val]) => !!val.Score && !!AttrScore[key])
    .sort((a, b) => b[1].Score - a[1].Score)
    .map(([key]) => key)
}

/**
 * @param {Array<[AttrScore, number]>} validAttrs
 * @returns {Array<[CharacterClass, number]>} Matching class names
 */
export const getMatchingClasses = (validAttrs) => {
  const targetAttrs = Object.fromEntries(validAttrs)

  return Object.entries(characterClasses).reduce((matchingClasses, [className, classDef]) => {
    const isMatching = classDef.PrimeAttr.every(([primeAttrName]) => {
      return !!targetAttrs[primeAttrName]
    })

    if (isMatching) {
      matchingClasses.push([className, classDef.PrimeAttr, targetAttrs])
    }

    return matchingClasses
  }, [])
}

/**
 * @deprecated To be reworked
 * @returns {CharacterClass}
 */
export const getRandomClass = () => {
  return getRandomArrayItem(Object.values(characterClasses))
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

/**
 * @typedef {[CharacterClass, [AttrScore, number][], Record<AttrScore, number>]} SuggestedClassRecord
 * @typedef {SuggestedClassRecord[]} SuggestedClassData
 */

/**
 * @param {SuggestedClassData} data
 * @returns {CharacterClass}
 */
export const getBestClass = (data) => {
  if (data.length === 0) {
    return null
  }

  // Find the record(s) with the longest classPrimeAttrs
  const maxPrimeAttrLength = Math.max(...data.map(([, classPrimeAttrs]) => classPrimeAttrs.length))
  const longestPrimeAttrs = data.filter(([, classPrimeAttrs]) => classPrimeAttrs.length === maxPrimeAttrLength)

  // Find the record(s) with the highest sum of characterAttrScores
  const getPropsSum = (scores) => Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxAttrScoreSum = Math.max(...longestPrimeAttrs.map(([, , charAttrScores]) => getPropsSum(charAttrScores)))
  const bestMatches = longestPrimeAttrs.filter(
    ([, , charAttrScores]) => getPropsSum(charAttrScores) === maxAttrScoreSum,
  )

  // If there are multiple best matches, choose one randomly
  if (bestMatches.length > 1) {
    console.info(
      'Choosing random from best matches',
      bestMatches.map(([name]) => name),
    )

    return getRandomArrayItem(bestMatches)[0]
  }

  return bestMatches[0][0]
}

//
// // Example usage with the provided data structure
// const data = [
//   [
//     'Fighter',
//     [['Strength', 13]],
//     {
//       Intelligence: 14,
//       Strength: 13,
//     },
//   ],
//   [
//     'MagicUser',
//     [['Intelligence', 13]],
//     {
//       Intelligence: 14,
//       Strength: 13,
//     },
//   ],
//   [
//     'Paladin',
//     [['Strength', 13]],
//     {
//       Intelligence: 14,
//       Strength: 13,
//     },
//   ],
//   [
//     'Ranger',
//     [['Strength', 13]],
//     {
//       Intelligence: 14,
//       Strength: 13,
//     },
//   ],
// ]
//
// console.log(getBestClass(data))
