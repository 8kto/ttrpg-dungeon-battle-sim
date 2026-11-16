import type { ICombatStrategy } from '../../strategies/ICombatStrategy'
import { MaxStrategy } from '../../strategies/MaxStrategy'
import { DamageValidator } from '../DamageValidator'

describe('DamageValidator', () => {
  const validator = new DamageValidator(new MaxStrategy())

  it.each(['d6', 'd6, 2d4+1', 'd6 | d10[poison(-2),save_or_die]'])('accepts "%s"', (damage) => {
    expect(validator.validate(damage)).toEqual([])
  })

  it.each<[string, string]>([
    ['', 'no damage formula'],
    ['  ', 'no damage formula'],
    ['d6, abc', 'invalid damage formula "abc"'],
    ['d6||d8', 'empty option in "d6||d8"'],
  ])('reports "%s"', (damage, error) => {
    expect(validator.validate(damage)).toEqual([error])
  })

  it('reports formulas the strategy cannot evaluate', () => {
    const strategy = {
      calculateDamage: jest.fn((formula: string) => {
        if (formula === 'd4') {
          throw new Error('unsupported')
        }

        return 1
      }),
    } as object as ICombatStrategy

    expect(new DamageValidator(strategy).validate('d6, d4')).toEqual(['invalid damage formula "d4"'])
  })
})
