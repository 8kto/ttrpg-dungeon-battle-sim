import { DamageFormula } from '../../attacks/DamageFormula'
import { BaseStrategy } from '../BaseStrategy'

describe('BaseStrategy', () => {
  it('parses formulas with DamageFormula', () => {
    expect(new BaseStrategy().getTokens('2d8+3')).toEqual({ mod: 3, multiplier: 2, sides: 8 })
  })

  it('uses the injected formula parser', () => {
    const damageFormula = new DamageFormula()
    const parse = jest.spyOn(damageFormula, 'parse')
    new BaseStrategy(damageFormula).getTokens('d6')

    expect(parse).toHaveBeenCalledWith('d6')
  })

  it('throws on invalid formulas', () => {
    expect(() => new BaseStrategy().getTokens('oops')).toThrowError(/Invalid damage formula/)
  })
})
