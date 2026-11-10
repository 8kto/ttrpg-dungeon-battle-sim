import * as dice from 'ttrpg-lib-dice'

import { parseDamage } from '../../attacks/parseDamage'
import { RandomStrategy } from '../RandomStrategy'

describe('RandomStrategy', () => {
  const strategy = new RandomStrategy()

  beforeEach(() => {
    jest.clearAllMocks()
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
    it('delegates to rollDiceFormula with the given formula', () => {
      const formula = '2d6+3'
      const rdfSpy = jest.spyOn(dice, 'rollDiceFormula').mockReturnValue(14)

      const result = strategy.calculateDamage(formula)
      expect(result).toBe(14)
      expect(rdfSpy).toHaveBeenCalledTimes(1)
      expect(rdfSpy).toHaveBeenCalledWith(formula)
    })
  })

  it('picks options at random', () => {
    const options = parseDamage('d6,d6|d8')
    const spy = jest.spyOn(dice, 'getRandomArrayItem').mockReturnValueOnce(options[1])

    expect(strategy.pickOption(options)).toBe(options[1])
    expect(spy).toHaveBeenCalledWith(options)
    spy.mockRestore()
  })
})
