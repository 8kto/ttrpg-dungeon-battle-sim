import * as diceUtils from 'ttrpg-lib-dice'
import { Dice } from 'ttrpg-lib-dice'

import { MagicUserSpells } from '../../../config/snw/Magic'
import type { Attributes } from '../../../domain/snw/Attributes'
import { getMagicUserSpellsList } from '../magic'

describe('magic utils', () => {
  // @ts-ignore
  const rollSpy: jest.SpyInstance = jest.spyOn(diceUtils, 'roll')
  // @ts-ignore
  const getRandomArrayItemsSpy: jest.SpyInstance = jest.spyOn(diceUtils, 'getRandomArrayItems')

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getMagicUserSpellsList', () => {
    const allSpells = Object.values(MagicUserSpells)

    it('compiles random spells list, misses some', () => {
      const mockedMaxSpells = [
        { level: 1, name: 'Hold Portal' },
        { level: 1, name: 'Light' },
        { level: 1, name: 'Read Languages' },
        { level: 1, name: 'Read Magic' },
        { level: 1, name: 'Shield' },
        { level: 1, name: 'Sleep' },
      ]

      // This will be rolled for the Sleep spell and skip it
      rollSpy.mockReturnValue(56)
      // Will return first 5 spells of 6
      getRandomArrayItemsSpy.mockReturnValueOnce(mockedMaxSpells)
      getRandomArrayItemsSpy.mockReturnValueOnce(mockedMaxSpells.slice(0, 5))

      const res = getMagicUserSpellsList({
        Intelligence: {
          MaxAdditionalLanguages: 3,
          MaxSpellLevel: 6,
          NewSpellUnderstandingChance: 55,
          SpellsPerLevel: '4/6',
        },
      } as Attributes)

      // Spies were engaged
      expect(rollSpy).toHaveBeenCalledTimes(1)
      expect(rollSpy).toHaveBeenCalledWith(Dice.d100)
      expect(getRandomArrayItemsSpy).toHaveBeenCalledTimes(2)
      expect(getRandomArrayItemsSpy).toHaveBeenCalledWith(allSpells, 6)
      expect(getRandomArrayItemsSpy).toHaveBeenCalledWith(mockedMaxSpells, 4)

      // Matches min/max spells condition (4/6)
      expect(Object.values(res).length).toBeGreaterThanOrEqual(4)
      expect(Object.values(res).length).toBeLessThanOrEqual(6)

      // Result contains 5 spells: 4 min + 1 returned by random arr
      expect(res).toEqual({
        'Hold Portal': { level: 1, name: 'Hold Portal' },
        Light: { level: 1, name: 'Light' },
        'Read Languages': { level: 1, name: 'Read Languages' },
        'Read Magic': { level: 1, name: 'Read Magic' },
        Shield: { level: 1, name: 'Shield' },
      })
    })

    it('compiles random spells list, adds some', () => {
      // Chances are always 100%
      rollSpy.mockReturnValue(85)

      // Max is "All" i.e. all MU spells
      const mockedMaxSpells = Object.values(MagicUserSpells)
      getRandomArrayItemsSpy.mockReturnValueOnce(mockedMaxSpells)
      getRandomArrayItemsSpy.mockReturnValueOnce(mockedMaxSpells.slice(0, 8))

      const res = getMagicUserSpellsList({
        Intelligence: {
          MaxAdditionalLanguages: 5,
          MaxSpellLevel: 9,
          NewSpellUnderstandingChance: 85,
          SpellsPerLevel: '7/All',
        },
      } as Attributes)

      // Spies were engaged
      expect(rollSpy).toHaveBeenCalledTimes(2)
      expect(rollSpy).toHaveBeenCalledWith(Dice.d100)
      expect(getRandomArrayItemsSpy).toHaveBeenCalledTimes(2)
      expect(getRandomArrayItemsSpy).toHaveBeenCalledWith(allSpells, 10)
      expect(getRandomArrayItemsSpy).toHaveBeenCalledWith(mockedMaxSpells, 7)

      // Matches min/max spells condition (7/10)
      expect(Object.values(res).length).toBeGreaterThanOrEqual(7)
      expect(Object.values(res).length).toBeLessThanOrEqual(10)

      // Result contains 5 spells: 7 min + 1 returned by random arr + 2 random roll
      expect(res).toEqual(MagicUserSpells)
    })
  })
})
