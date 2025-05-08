import { Dice } from 'ttrpg-lib-dice'

import { MaxStrategy } from '../MaxStrategy'

describe('MaxStrategy', () => {
  const strategy = new MaxStrategy()

  describe('calculateHp', () => {
    it.each<[number, Dice, number]>([
      [1, Dice.d4, 4],
      [2, Dice.d6, 12],
      [3, Dice.d8, 24],
      [5, Dice.d10, 50],
    ])('with %i×d%i returns %i', (count, dice, expected) => {
      expect(strategy.calculateHp([count, dice])).toBe(expected)
    })
  })

  describe('calculateDamage (valid formulas)', () => {
    it.each<[string, number]>([
      ['d4', 4],
      ['d6', 6],
      ['d8', 8],
      ['d10', 10],
      ['2d6', 12],
      ['3d10', 30],
      ['2d6+2', 14],
      ['3d10+2', 32],
      ['4d8 -3', 29],
      ['5d4+0', 20],
      ['6d12-5', 67],
    ])('"%s" → %d', (input, expected) => {
      expect(strategy.calculateDamage(input)).toBe(expected)
    })
  })

  describe('calculateDamage (invalid formulas)', () => {
    it.each<string>(['', 'd', 'd+1', '2d', 'xd6', '2d6++2', '2d6+-1', '2d6 2', 'hello', 'd-4'])(
      'throws on "%s"',
      (input) => {
        expect(() => strategy.calculateDamage(input)).toThrowError(/Invalid damage formula/)
      },
    )
  })
})
