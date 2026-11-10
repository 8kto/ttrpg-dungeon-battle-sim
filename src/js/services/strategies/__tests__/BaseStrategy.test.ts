import { BaseStrategy } from '../BaseStrategy'

describe('BaseStrategy', () => {
  const strategy = new BaseStrategy()

  it.each<[string, { mod: number; multiplier: number; sides: number }]>([
    ['d6', { mod: 0, multiplier: 1, sides: 6 }],
    ['2d8+3', { mod: 3, multiplier: 2, sides: 8 }],
    ['4d8 - 3', { mod: -3, multiplier: 4, sides: 8 }],
  ])('parses "%s"', (formula, expected) => {
    expect(strategy.getTokens(formula)).toEqual(expected)
  })

  it('returns cached tokens for the same formula', () => {
    expect(strategy.getTokens('3d4+1')).toBe(new BaseStrategy().getTokens('3d4+1'))
  })

  it('does not cache invalid formulas', () => {
    expect(() => strategy.getTokens('oops')).toThrowError(/Invalid damage formula/)
    expect(() => strategy.getTokens('oops')).toThrowError(/Invalid damage formula/)
  })

  it('parses a plain integer', () => {
    expect(strategy.getTokens('3')).toEqual({ mod: 3, multiplier: 0, sides: 0 })
  })
})
