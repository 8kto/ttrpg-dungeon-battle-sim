import * as dice from 'ttrpg-lib-dice'
import { Dice } from 'ttrpg-lib-dice'

import { parseDamage } from '../../attacks/parseDamage'
import { Rounding } from '../../types'
import { AverageStrategy } from '../AverageStrategy'

describe('AverageStrategy', () => {
  const strategyUp = new AverageStrategy(Rounding.Up)
  const strategyDown = new AverageStrategy(Rounding.Down)

  it('rounds up by default', () => {
    expect(new AverageStrategy().calculateDamage('d8')).toBe(5)
  })

  describe('calculateHp', () => {
    // [count, dice, rounded up, rounded down]
    it.each<[number, Dice, number, number]>([
      [1, Dice.d4, 3, 2], // 2.5
      [2, Dice.d6, 7, 7], // 7
      [3, Dice.d8, 14, 13], // 13.5
      [5, Dice.d10, 28, 27], // 27.5
    ])('with %i×d%i returns %i (up) / %i (down)', (count, dice, up, down) => {
      expect(strategyUp.calculateHp([count, dice])).toBe(up)
      expect(strategyDown.calculateHp([count, dice])).toBe(down)
    })
  })

  describe('calculateDamage (valid formulas)', () => {
    // [formula, rounded up, rounded down]
    it.each<[string, number, number]>([
      ['d4', 3, 2], // 2.5
      ['d6', 4, 3], // 3.5
      ['d8', 5, 4], // 4.5
      ['d10', 6, 5], // 5.5
      ['2d6', 7, 7], // 7
      ['3d10', 17, 16], // 16.5
      ['2d6+2', 9, 9], // 7+2
      ['3d10+2', 19, 18], // 16.5+2
      ['4d8-3', 15, 15], // 18-3
      ['5d4+0', 13, 12], // 12.5
      ['6d12-5', 34, 34], // 39-5
      ['d4-5', -2, -3], // 2.5-5, clamped to 0 by Participant
    ])('"%s" → %d (up) / %d (down)', (input, up, down) => {
      expect(strategyUp.calculateDamage(input)).toBe(up)
      expect(strategyDown.calculateDamage(input)).toBe(down)
    })
  })

  describe('calculateDamage (invalid formulas)', () => {
    it.each<string>(['', 'd', '2d', 'xd6', '2d6++2', '2d6+-1', '2d6 2', 'hello', 'd-4'])('throws on "%s"', (input) => {
      expect(() => strategyUp.calculateDamage(input)).toThrowError(/Invalid damage formula/)
    })
  })

  it.each([Rounding.Up, Rounding.Down])('calculates a plain integer with rounding %s', (rounding) => {
    expect(new AverageStrategy(rounding).calculateDamage('3')).toBe(3)
  })

  it('picks options at random', () => {
    const options = parseDamage('d6,d6|d8')
    const spy = jest.spyOn(dice, 'getRandomArrayItem').mockReturnValueOnce(options[1])

    expect(strategyUp.pickOption(options)).toBe(options[1])
    expect(spy).toHaveBeenCalledWith(options)
    spy.mockRestore()
  })
})
