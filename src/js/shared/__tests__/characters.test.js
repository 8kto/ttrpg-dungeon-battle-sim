import { characterClasses } from '../../data/classes'
import { strengthModifiers } from '../../data/modifiers'
import { getClassSuggestions, getMatchingScore } from '../character.js'

describe('character utils', () => {
  describe('getMatchingScore', () => {
    it.each([
      [3, 4],
      [4, 4],
      [5, 6],
      [6, 6],
      [7, 8],
      [8, 8],
      [9, 12],
      [10, 12],
      [11, 12],
      [12, 12],
      [13, 15],
      [14, 15],
      [15, 15],
      [16, 16],
      [17, 17],
      [18, 18],
    ])('should match the expected scores %d => %d', (score, expected) => {
      expect(getMatchingScore(strengthModifiers, score)).toEqual(expected)
    })
  })

  describe('getClassSuggestions', () => {
    const getStatsWithScores = (scores) => ({
      Charisma: { Score: scores.Charisma || 0 },
      Constitution: { Score: scores.Constitution || 0 },
      Dexterity: { Score: scores.Dexterity || 0 },
      Gold: 0,
      Intelligence: { Score: scores.Intelligence || 0 },
      Strength: { Score: scores.Strength || 0 },
      Wisdom: { Score: scores.Wisdom || 0 },
    })

    it('should match Assassin with Strength, Dexterity, and Intelligence 13+', () => {
      const stats = getStatsWithScores({ Dexterity: 13, Intelligence: 13, Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Assassin')
    })

    it('should match Cleric with Wisdom 13+', () => {
      const stats = getStatsWithScores({ Wisdom: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Cleric')
    })

    it('should match Druid with Wisdom and Charisma 13+', () => {
      const stats = getStatsWithScores({ Charisma: 13, Wisdom: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Druid')
    })

    it('should match Fighter with Strength 13+', () => {
      const stats = getStatsWithScores({ Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Fighter')
    })

    it('should match MagicUser with Intelligence 13+', () => {
      const stats = getStatsWithScores({ Intelligence: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('MagicUser')
    })

    it('should match Monk with Wisdom 13+', () => {
      const stats = getStatsWithScores({ Wisdom: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Monk')
    })

    it('should match Paladin with Strength 13+', () => {
      const stats = getStatsWithScores({ Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Paladin')
    })

    it('should match Ranger with Strength 13+', () => {
      const stats = getStatsWithScores({ Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Ranger')
    })

    it('should match Thief with Dexterity 13+', () => {
      const stats = getStatsWithScores({ Dexterity: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toContain('Thief')
    })

    it('should match all classes with all attributes 13+', () => {
      const stats = getStatsWithScores({
        Charisma: 13,
        Constitution: 13,
        Dexterity: 13,
        Intelligence: 13,
        Strength: 13,
        Wisdom: 13,
      })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toEqual(Object.keys(characterClasses))
    })

    // Edge case: Only one attribute meets the minimum
    it('should match only classes with Dexterity 13+', () => {
      const stats = getStatsWithScores({ Dexterity: 13 })
      const expectedClasses = ['Thief']
      expect(getClassSuggestions(stats, 'PrimeAttr')).toEqual(expect.arrayContaining(expectedClasses))
    })

    // Edge case: No attributes meet the minimum
    it('should return an empty array if no attributes meet the minimum', () => {
      const stats = getStatsWithScores({
        Charisma: 10,
        Constitution: 10,
        Dexterity: 10,
        Intelligence: 10,
        Strength: 10,
        Wisdom: 10,
      })
      expect(getClassSuggestions(stats, 'PrimeAttr')).toEqual([])
    })

    // Edge case: Mix of attributes meeting and not meeting the minimum
    it('should match appropriate classes with mixed attribute scores', () => {
      const stats = getStatsWithScores({ Strength: 13, Wisdom: 14 })
      const expectedClasses = ['Cleric', 'Paladin']
      expect(getClassSuggestions(stats, 'PrimeAttr')).toEqual(expect.arrayContaining(expectedClasses))
    })
  })
})
