import * as dice from 'ttrpg-lib-dice'

import { DamageParser } from '../../attacks/DamageParser'
import { RandomStrategy } from '../RandomStrategy'

describe('RandomStrategy', () => {
  const strategy = new RandomStrategy()

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('calculateHp', () => {
    it('returns 0 when count is 0', () => {
      const rollSpy = jest.spyOn(dice, 'roll')
      expect(strategy.calculateHp([0, dice.Dice.d8])).toBe(0)
      expect(rollSpy).not.toHaveBeenCalled()
    })

    it('sums individual rolls for each die', () => {
      const rollSpy = jest
        .spyOn(dice, 'roll')
        .mockImplementationOnce(() => 3)
        .mockImplementationOnce(() => 5)
        .mockImplementationOnce(() => 1)

      const result = strategy.calculateHp([3, dice.Dice.d6])
      expect(result).toBe(9) // 3 + 5 + 1
      expect(rollSpy).toHaveBeenCalledTimes(3)
      expect(rollSpy).toHaveBeenNthCalledWith(1, dice.Dice.d6)
      expect(rollSpy).toHaveBeenNthCalledWith(2, dice.Dice.d6)
      expect(rollSpy).toHaveBeenNthCalledWith(3, dice.Dice.d6)
    })
  })

  describe('calculateDamage', () => {
    it('rolls every die apart and adds the modifier', () => {
      const rollSpy = jest.spyOn(dice, 'secureRandomInteger').mockReturnValueOnce(2).mockReturnValueOnce(5)

      expect(strategy.calculateDamage('2d6+3')).toBe(10)
      expect(rollSpy.mock.calls).toEqual([
        [1, 6],
        [1, 6],
      ])
    })

    it('subtracts the rolls of subtracted dice', () => {
      jest.spyOn(dice, 'secureRandomInteger').mockReturnValueOnce(7).mockReturnValueOnce(3).mockReturnValueOnce(1)

      expect(strategy.calculateDamage('d8-2d4+1')).toBe(7 - 3 - 1 + 1)
    })

    it('returns a plain number as it is', () => {
      const rollSpy = jest.spyOn(dice, 'secureRandomInteger')

      expect(strategy.calculateDamage('5')).toBe(5)
      expect(rollSpy).not.toHaveBeenCalled()
    })

    it('stays within the range of the formula', () => {
      for (let i = 0; i < 100; i++) {
        const value = strategy.calculateDamage('d20+d4-2')
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(22)
      }
    })

    // the format is the one of DamageFormula, the dice library's own grammar is wider
    it.each(['0d6', 'd0', 'oops'])('throws on "%s"', (formula) => {
      expect(() => strategy.calculateDamage(formula)).toThrowError(/Invalid damage formula/)
    })
  })

  it('picks options at random', () => {
    const options = new DamageParser().parseDamage('d6,d6|d8')
    const spy = jest.spyOn(dice, 'getRandomArrayItem').mockReturnValueOnce(options[1])

    expect(strategy.pickOption(options)).toBe(options[1])
    expect(spy).toHaveBeenCalledWith(options)
    spy.mockRestore()
  })
})
