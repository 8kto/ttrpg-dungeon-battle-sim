import { CharacterClasses, PRIME_ATTR_MIN } from '../../../config/snw/CharacterClasses'
import { StrengthModifiers } from '../../../config/snw/Modifiers'
import { AttrScore } from '../../../domain/snw/CharacterClass'
import { CharacterStats } from '../../../domain/snw/CharacterStats'
import {
  getBestClass,
  getClassSuggestions,
  getMatchedPrimaryAttributes,
  getMatchingScore,
  MatchingClasses,
} from '../character'

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
      expect(getMatchingScore(StrengthModifiers, score)).toEqual(expected)
    })
  })

  describe('getClassSuggestions', () => {
    const getStatsWithScores = (scores: Partial<Record<AttrScore, number>>): CharacterStats => ({
      Charisma: { MaxNumberOfSpecialHirelings: 1, Score: scores.Charisma || 0 },
      Constitution: { HitPoints: 0, RaiseDeadSurvivalChance: '0%', Score: scores.Constitution || 0 },
      Dexterity: { ArmorClass: 0, MissilesToHit: 0, Score: scores.Dexterity || 0 },
      Gold: 0,
      HitPoints: 1,
      Intelligence: {
        MaxAdditionalLanguages: 0,
        MaxSpellLevel: 1,
        NewSpellUnderstandingChance: 0,
        Score: scores.Intelligence || 0,
        SpellsPerLevel: 'x/y',
      },
      Strength: { Carry: 0, Damage: 0, Doors: 'x', Score: scores.Strength || 0, ToHit: 0 },
      Wisdom: { Score: scores.Wisdom || 0 },
    })

    it('should match Assassin with Strength, Dexterity, and Intelligence 13+', () => {
      const stats = getStatsWithScores({ Dexterity: 13, Intelligence: 13, Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Assassin')
    })

    it('should match Cleric with Wisdom 13+', () => {
      const stats = getStatsWithScores({ Wisdom: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Cleric')
    })

    it('should match Druid with Wisdom and Charisma 13+', () => {
      const stats = getStatsWithScores({ Charisma: 13, Wisdom: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Druid')
    })

    it('should match Fighter with Strength 13+', () => {
      const stats = getStatsWithScores({ Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Fighter')
    })

    it('should match MagicUser with Intelligence 13+', () => {
      const stats = getStatsWithScores({ Intelligence: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('MagicUser')
    })

    it('should match Monk with Wisdom 13+', () => {
      const stats = getStatsWithScores({ Wisdom: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Monk')
    })

    it('should match Paladin with Strength 13+', () => {
      const stats = getStatsWithScores({ Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Paladin')
    })

    it('should match Ranger with Strength 13+', () => {
      const stats = getStatsWithScores({ Strength: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Ranger')
    })

    it('should match Thief with Dexterity 13+', () => {
      const stats = getStatsWithScores({ Dexterity: 13 })
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toContain('Thief')
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
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toEqual(Object.keys(CharacterClasses))
    })

    // Edge case: Only one attribute meets the minimum
    it('should match only classes with Dexterity 13+', () => {
      const stats = getStatsWithScores({ Dexterity: 13 })
      const expectedClasses = ['Thief']
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toEqual(expect.arrayContaining(expectedClasses))
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
      expect(getClassSuggestions(stats, 'PrimeAttr').map((c) => c[0])).toEqual(expect.arrayContaining(expectedClasses))
    })
  })

  describe('getMatchedPrimaryAttributes', () => {
    it('should return only valid attrs', () => {
      expect(
        getMatchedPrimaryAttributes(
          {
            Charisma: { Score: 5 },
            Constitution: { Score: 13 },
            Dexterity: { Score: 4 },
            Intelligence: { Score: 13 },
            Strength: { Score: 8 },
            Wisdom: { Score: 13 },
          } as unknown as CharacterStats,
          PRIME_ATTR_MIN,
        ),
      ).toEqual([
        ['Constitution', 13],
        ['Intelligence', 13],
        ['Wisdom', 13],
      ])
    })

    it('should return sorted valid attrs', () => {
      expect(
        getMatchedPrimaryAttributes(
          {
            Charisma: { Score: 5 },
            Constitution: { Score: 15 },
            Dexterity: { Score: 4 },
            Intelligence: { Score: 13 },
            Strength: { Score: 8 },
            Wisdom: { Score: 18 },
          } as unknown as CharacterStats,
          PRIME_ATTR_MIN,
        ),
      ).toEqual([
        ['Wisdom', 18],
        ['Constitution', 15],
        ['Intelligence', 13],
      ])
    })

    it('should return an empty array if no attributes meet the minimum score', () => {
      expect(
        getMatchedPrimaryAttributes(
          {
            Charisma: { Score: 5 },
            Constitution: { Score: 12 },
            Dexterity: { Score: 4 },
            Intelligence: { Score: 10 },
            Strength: { Score: 8 },
            Wisdom: { Score: 11 },
          } as unknown as CharacterStats,
          PRIME_ATTR_MIN,
        ),
      ).toEqual([])
    })

    it('should handle empty stats object', () => {
      expect(getMatchedPrimaryAttributes({} as unknown as CharacterStats, PRIME_ATTR_MIN)).toEqual([])
    })

    it('should handle missing scores in stats', () => {
      expect(
        getMatchedPrimaryAttributes(
          {
            Charisma: {},
            Constitution: { Score: 15 },
            Dexterity: { Score: null },
            Intelligence: { Score: 13 },
            // eslint-disable-next-line no-undefined
            Strength: { Score: undefined },
            Wisdom: { Score: 18 },
          } as unknown as CharacterStats,
          PRIME_ATTR_MIN,
        ),
      ).toEqual([
        ['Wisdom', 18],
        ['Constitution', 15],
        ['Intelligence', 13],
      ])
    })

    it('should return correct attributes when all scores are equal and above min score', () => {
      expect(
        getMatchedPrimaryAttributes(
          {
            Charisma: { Score: 14 },
            Constitution: { Score: 14 },
            Dexterity: { Score: 14 },
            Intelligence: { Score: 14 },
            Strength: { Score: 14 },
            Wisdom: { Score: 14 },
          } as unknown as CharacterStats,
          PRIME_ATTR_MIN,
        ),
      ).toEqual([
        ['Charisma', 14],
        ['Constitution', 14],
        ['Dexterity', 14],
        ['Intelligence', 14],
        ['Strength', 14],
        ['Wisdom', 14],
      ])
    })
  })

  describe('getBestClass', () => {
    const data: MatchingClasses = [
      [
        'Fighter',
        [['Strength', 13]],
        {
          Intelligence: 14,
          Strength: 13,
        },
      ],
      [
        'MagicUser',
        [['Intelligence', 13]],
        {
          Intelligence: 14,
          Strength: 13,
        },
      ],
      [
        'Paladin',
        [['Strength', 13]],
        {
          Intelligence: 14,
          Strength: 13,
        },
      ],
      [
        'Ranger',
        [['Strength', 13]],
        {
          Intelligence: 14,
          Strength: 13,
        },
      ],
      [
        'Assassin',
        [
          ['Strength', 13],
          ['Dexterity', 13],
          ['Intelligence', 13],
        ],
        {
          Dexterity: 15,
          Intelligence: 14,
          Strength: 13,
        },
      ],
    ] as MatchingClasses

    it('should return the best matching class based on the longest classPrimeAttrs and highest characterAttrScores', () => {
      const result = getBestClass(data)
      expect(result).toBe('Assassin')
    })

    // FIXME mock random util
    xit('should handle data with multiple records with same max length and score, returning a random one', () => {
      const similarData = [
        [
          'Warrior',
          [
            ['Strength', 13],
            ['Dexterity', 13],
          ],
          {
            Dexterity: 15,
            Intelligence: 14,
            Strength: 13,
          },
        ],
        [
          'Ranger',
          [
            ['Strength', 13],
            ['Dexterity', 13],
          ],
          {
            Dexterity: 15,
            Intelligence: 14,
            Strength: 13,
          },
        ],
      ] as MatchingClasses

      const result = getBestClass(similarData)
      expect(result).toBe('Warrior')
    })

    it('should return null for an empty data array', () => {
      expect(() => getBestClass([])).toThrowError('No matching classes')
    })

    it('should prioritize longer classPrimeAttrs even if scores are higher in shorter one', () => {
      const mixedData = [
        [
          'MagicUser',
          [['Intelligence', 13]],
          {
            Intelligence: 18,
            Strength: 10,
          },
        ],
        [
          'Druid',
          [
            ['Intelligence', 13],
            ['Wisdom', 13],
          ],
          {
            Intelligence: 16,
            Wisdom: 14,
          },
        ],
      ] as MatchingClasses

      const result = getBestClass(mixedData)
      expect(result).toBe('Druid')
    })

    it('should handle single entry data array', () => {
      const singleData = [
        [
          'Fighter',
          [
            ['Strength', 13],
            ['Constitution', 13],
          ],
          {
            Constitution: 14,
            Strength: 15,
          },
        ],
      ] as MatchingClasses

      const result = getBestClass(singleData)
      expect(result).toBe('Fighter')
    })
  })
})
