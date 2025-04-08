// Wisdom 13+: all chars (cleric gets both)
// Charisma 13+: all chars

import { PRIME_ATTR_MIN } from '../../config/snw/CharacterClasses'
import { AttrScore, CharacterClassDef } from '../../domain/snw/CharacterClass'
import { Attributes } from '../../domain/snw/Attributes'

const BASE_BONUS_VALUE = 5

export const getExperienceBonus = (charDef: CharacterClassDef, stats: Attributes): number => {
  const primeAttributes = [AttrScore.Wisdom, AttrScore.Charisma]
  const baseBonus = primeAttributes.reduce((bonus, attr) => {
    return bonus + (stats[attr].Score >= PRIME_ATTR_MIN ? BASE_BONUS_VALUE : 0)
  }, 0)

  const hasClassBonus = charDef.PrimeAttr.every((cur) => {
    const [attrScore] = cur

    return attrScore in stats && stats[attrScore].Score >= PRIME_ATTR_MIN
  })

  return baseBonus + (hasClassBonus ? BASE_BONUS_VALUE : 0)
}
