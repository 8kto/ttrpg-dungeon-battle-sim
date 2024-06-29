import { CharacterClasses, PRIME_ATTR_MIN } from '../config/snw/CharacterClasses'
import {
  charismaModifiers,
  constitutionModifiers,
  dexterityModifiers,
  intelligenceModifiers,
  strengthModifiers,
} from '../config/snw/Modifiers'
import { AttrScore, CharacterClass, CharacterClassDef, PrimeAttribute } from '../domain/snw/CharacterClass'
import { CharacterStats, ScoredModifierDef } from '../domain/snw/CharacterStats'
import { getRandomArrayItem, roll, rollDiceFormula } from './dice'

export const getMatchingScore = <T>(modifiers: Record<number, T>, maxScoreValue: number): number => {
  const scores = Object.keys(modifiers).map(Number)
  let matched = scores[0]

  for (const score of scores) {
    matched = score

    if (maxScoreValue <= score) {
      break
    }
  }

  return matched
}

const getModifier = <T>(modifiers: Record<number, T>, score: number): T & ScoredModifierDef => {
  const matched = getMatchingScore(modifiers, score)

  const modifierData = modifiers[matched] || {}

  return {
    Score: score,
    ...modifierData,
  } as T & ScoredModifierDef
}

export const getRandomAttributes = (): CharacterStats => {
  const roll3d6 = rollDiceFormula.bind(null, '3d6')

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  return {
    [AttrScore.Strength]: getModifier(strengthModifiers, roll3d6()),
    [AttrScore.Dexterity]: getModifier(dexterityModifiers, roll3d6()),
    [AttrScore.Constitution]: getModifier(constitutionModifiers, roll3d6()),
    [AttrScore.Intelligence]: getModifier(intelligenceModifiers, roll3d6()),
    [AttrScore.Wisdom]: getModifier({}, roll3d6()),
    [AttrScore.Charisma]: getModifier(charismaModifiers, roll3d6()),
    Gold: roll3d6() * 10,
    HitPoints: 0,
  }
}

/**
 * TODO if all below 13, suggest a class for the highest attr
 */
export const getClassSuggestions = (stats: CharacterStats, kind: 'PrimeAttr' | 'StrictAttr'): MatchingClasses => {
  if (kind !== 'PrimeAttr') {
    throw new Error('Not implemented')
  }
  const validAttrs = getMatchedPrimaryAttributes(stats, PRIME_ATTR_MIN)
  const res = getMatchingClasses(validAttrs)

  if (!res.length) {
    // TODO pick up highest
    // const sortedAttrs = getSortedAttributes(stats)
    // console.log(sortedAttrs)
  }

  return res
}

/**
 * Return a list of attributes matching the min score value
 */
export const getMatchedPrimaryAttributes = (stats: CharacterStats, minScore: number): Array<[AttrScore, number]> => {
  return (Object.entries(stats) as [AttrScore, ScoredModifierDef][])
    .filter(([, val]) => typeof val === 'object' && !!val.Score && val.Score >= minScore)
    .sort((a, b) => b[1].Score - a[1].Score)
    .map(([name, { Score }]) => [name, Score])
}

/**
 * Get Attribute names sorted by theis scores
 */
export const getSortedAttributes = (stats: CharacterStats): AttrScore[] => {
  return (Object.entries(stats) as [AttrScore, ScoredModifierDef][])
    .filter(([key, val]) => !!val.Score && !!AttrScore[key])
    .sort((a, b) => b[1].Score - a[1].Score)
    .map((item) => item[0])
}

type MatchingClassesRecord = [CharacterClass, PrimeAttribute[], TargetAttrs]
type MatchingClasses = Array<MatchingClassesRecord>
type TargetAttrs = Record<AttrScore, number>

export const getMatchingClasses = (attrs: Array<[AttrScore, number]>): MatchingClasses => {
  const targetAttrs = Object.fromEntries(attrs) as TargetAttrs

  return Object.entries(CharacterClasses).reduce((matchingClasses, [className, classDef]) => {
    const isMatching = classDef.PrimeAttr.every((primeAttr): boolean => {
      return !!targetAttrs[primeAttr[0]]
    })

    if (isMatching) {
      matchingClasses.push([className as CharacterClass, classDef.PrimeAttr, targetAttrs])
    }

    return matchingClasses
  }, Array<MatchingClassesRecord>())
}

/**
 * @deprecated To be reworked
 */
export const getRandomClass = (): CharacterClassDef => {
  return getRandomArrayItem(Object.values(CharacterClasses))
}

/**
 * @param {CharacterClassDef} charClass
 * @param {number} bonusHp
 * @returns {number}
 */
export const getCharHitPoints = (charClass: CharacterClassDef, bonusHp: number): number => {
  const baseHp = roll(charClass.HitDice)

  // Return at least 1 HP
  return Math.max(baseHp + bonusHp, 1)
}

/**
 * @typedef {[CharacterClass, [AttrScore, number][], Record<AttrScore, number>]} SuggestedClassRecord
 * @typedef {SuggestedClassRecord[]} SuggestedClassData
 */

export const getBestClass = (matchedClasses: MatchingClasses): CharacterClassDef => {
  // Find the record(s) with the longest classPrimeAttrs
  const maxPrimeAttrLength = Math.max(...matchedClasses.map(([, classPrimeAttrs]) => classPrimeAttrs.length))
  const longestPrimeAttrs = matchedClasses.filter(
    ([, classPrimeAttrs]) => classPrimeAttrs.length === maxPrimeAttrLength,
  )

  // Find the record(s) with the highest sum of characterAttrScores
  const getPropsSum = (targetAttrs: TargetAttrs): number =>
    Object.values(targetAttrs).reduce((sum, score) => sum + score, 0)
  const maxAttrScoreSum = Math.max(...longestPrimeAttrs.map(([, , targetAttrs]) => getPropsSum(targetAttrs)))
  const bestMatches = longestPrimeAttrs.filter(([, , targetAttrs]) => getPropsSum(targetAttrs) === maxAttrScoreSum)

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
