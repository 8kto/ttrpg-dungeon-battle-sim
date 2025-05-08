import { Dice } from 'ttrpg-lib-dice'

import { AverageStrategy } from '../AverageStrategy'

describe('AverageStrategy', () => {
  const strategy = new AverageStrategy()

  describe('calculateHp', () => {
    it.each<[number, Dice, number]>([
      [1, Dice.d4, 2],
      [2, Dice.d6, 6],
      [3, Dice.d8, 12],
      [5, Dice.d10, 25],
    ])('with %i×d%i returns %i', (count, dice, expected) => {
      expect(strategy.calculateHp([count, dice])).toBe(expected)
    })
  })

  describe('calculateDamage (valid formulas)', () => {
    it.each<[string, number]>([
      ['d4', 2], // (4)/2=2
      ['d6', 3], // (6)/2=3
      ['d8', 4], // (8)/2=4
      ['d10', 5], // (10)/2=5
      ['2d6', 6], // (12)/2=6
      ['3d10', 15], // (30)/2=15
      ['2d6+2', 7], // (12+2)/2=7
      ['3d10+2', 16], // (30+2)/2=16
      ['4d8-3', 15], // (32-3)/2=14.5->15
      ['5d4+0', 10], // (20)/2=10
      ['6d12-5', 34], // (72-5)/2=33.5->34
    ])('"%s" → %d', (input, expected) => {
      expect(strategy.calculateDamage(input)).toBe(expected)
    })
  })

  describe('calculateDamage (invalid formulas)', () => {
    it.each<string>(['', 'd', '2d', 'xd6', '2d6++2', '2d6+-1', '2d6 2', 'hello', 'd-4'])('throws on "%s"', (input) => {
      expect(() => strategy.calculateDamage(input)).toThrowError(/Invalid damage formula/)
    })
  })
})
