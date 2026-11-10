import { getMaxDamage } from '../getMaxDamage'

describe('getMaxDamage', () => {
  it.each<[string, number]>([
    ['d6', 6],
    ['d6+1', 7],
    ['d6+d4', 10],
    ['2d6-1', 11],
    ['5', 5],
    ['2d4 + 1', 9],
  ])('"%s" → %d', (formula, expected) => {
    expect(getMaxDamage(formula)).toBe(expected)
  })

  it.each(['', 'd', 'hello', 'd6+'])('throws on "%s"', (formula) => {
    expect(() => getMaxDamage(formula)).toThrow(`Invalid damage formula: "${formula}"`)
  })
})
