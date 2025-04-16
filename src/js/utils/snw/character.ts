import { CharacterClasses, PRIME_ATTR_MIN } from '../../config/snw/CharacterClasses'
import {
  CharismaModifiers,
  ConstitutionModifiers,
  DexterityModifiers,
  IntelligenceModifiers,
  StrengthModifiers,
} from '../../config/snw/Modifiers'
import type { Attributes, ScoredModifierDef } from '../../domain/snw/Attributes'
import type { Character } from '../../domain/snw/Character'
import type { CharacterClassDef, PrimeAttribute } from '../../domain/snw/CharacterClass'
import { Alignment, AttrScore, CharacterClass, CharacterRace } from '../../domain/snw/CharacterClass'
import { DEFAULT_INVENTORY_ITEMS } from '../../state/State'
import { getRandomArrayItem, roll, rollDiceFormula } from '../dice'
import { getCharArmorClass } from './armorClass'
import { getDamageModifier, getToHitMelee, getToHitMissiles } from './combat'
import { getExperienceBonus } from './experience'
import { getMagicUserSpellsList } from './magic'
import { getBaseMovementRate } from './movement'

type TargetAttrs = Record<AttrScore, number>
type MatchingClassesRecord = [CharacterClass, PrimeAttribute[], TargetAttrs]
export type MatchingClasses = Array<MatchingClassesRecord>

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

export const getRandomAttributes = (): Attributes => {
  const roll3d6 = rollDiceFormula.bind(null, '3d6')

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  return {
    [AttrScore.Strength]: getModifier(StrengthModifiers, roll3d6()),
    [AttrScore.Dexterity]: getModifier(DexterityModifiers, roll3d6()),
    [AttrScore.Constitution]: getModifier(ConstitutionModifiers, roll3d6()),
    [AttrScore.Intelligence]: getModifier(IntelligenceModifiers, roll3d6()),
    [AttrScore.Wisdom]: getModifier({}, roll3d6()),
    [AttrScore.Charisma]: getModifier(CharismaModifiers, roll3d6()),
  }
}

/**
 * TODO if all below 13, suggest a class for the highest attr
 */
export const getClassSuggestions = (stats: Attributes, kind: 'PrimeAttr' | 'StrictAttr'): MatchingClasses => {
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
export const getMatchedPrimaryAttributes = (stats: Attributes, minScore: number): Array<[AttrScore, number]> => {
  return (Object.entries(stats) as [AttrScore, ScoredModifierDef][])
    .filter(([, val]) => typeof val === 'object' && !!val.Score && val.Score >= minScore)
    .sort((a, b) => b[1].Score - a[1].Score)
    .map(([name, { Score }]) => [name, Score])
}

/**
 * Get Attribute names sorted by theis scores
 */
export const getSortedAttributes = (stats: Attributes): AttrScore[] => {
  return (Object.entries(stats) as [AttrScore, ScoredModifierDef][])
    .filter(([key, val]) => !!val.Score && !!AttrScore[key])
    .sort((a, b) => b[1].Score - a[1].Score)
    .map((item) => item[0])
}

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
export const getCharacterHitPoints = (charClass: CharacterClassDef, bonusHp: number): number => {
  const baseHp = roll(charClass.HitDice)

  // Return at least 1 HP
  return Math.max(baseHp + bonusHp, 1)
}

export const getBestClass = (matchedClasses: MatchingClasses): CharacterClass => {
  // Find the record(s) with the longest classPrimeAttrs
  const maxPrimeAttrLength = Math.max(...matchedClasses.map(([, classPrimeAttrs, _]) => classPrimeAttrs.length))
  const longestPrimeAttrs = matchedClasses.filter(
    ([, classPrimeAttrs, _]) => classPrimeAttrs.length === maxPrimeAttrLength,
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
      bestMatches.map(([name, _, __]) => name),
    )

    return getRandomArrayItem(bestMatches)[0]
  }

  const res = bestMatches?.[0]?.[0]
  if (!res) {
    throw new Error('No matching classes')
  }

  return res
}

// TODO make UI renderers consume these inlined props
export const getNewCharacter = (classDef: CharacterClassDef, attrs: Attributes): Character => {
  const carryModifier = attrs?.Strength.Carry || 0

  // new inventory gets DEFAULT_INVENTORY_ITEMS by default (@see State.ts)
  const totalWeight = Object.values(DEFAULT_INVENTORY_ITEMS).reduce((acc, item) => {
    return acc + item.weight * item.quantity
  }, 0)

  const char: Character = {
    gold: rollDiceFormula('3d6') * 10,
    hitPoints: getCharacterHitPoints(classDef, attrs.Constitution.HitPoints), // TODO keep rolled values + use level
    stats: attrs,
    level: 1,
    classDef,
    ancestry: CharacterRace.Human,
    toHit: {
      melee: getToHitMelee(classDef, attrs),
      missiles: getToHitMissiles(classDef, attrs),
    },
    alignment: Alignment.Neutral,
    armorClass: getCharArmorClass(attrs, {}),
    damageMod: getDamageModifier(classDef, attrs),
    experiencePoints: 0,
    experiencePointsBonus: getExperienceBonus(classDef, attrs),
    movementRate: getBaseMovementRate(totalWeight, carryModifier), // FIXME update on item add
  }

  if (classDef.$isCaster) {
    if (classDef.name === CharacterClass.Druid || classDef.name === CharacterClass.Cleric) {
      char.spells = 'All'
    } else if (classDef.name === CharacterClass.MagicUser) {
      char.spells = getMagicUserSpellsList(attrs)
    } else {
      throw new Error('Unknown type of caster')
    }
  }

  return char
}
