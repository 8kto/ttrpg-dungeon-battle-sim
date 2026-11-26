import type { ICombatStrategy } from '../../strategies/ICombatStrategy'
import { MaxStrategy } from '../../strategies/MaxStrategy'
import { RandomStrategy } from '../../strategies/RandomStrategy'
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

  // the Random strategy rolls "0d6" as one die and "d0" as NaN
  it.each(['0d6', 'd0'])('reports "%s" for any strategy', (formula) => {
    expect(new DamageValidator(new RandomStrategy()).validate(`d6, ${formula}`)).toEqual([
      `invalid damage formula "${formula}"`,
    ])
  })

  describe('check', () => {
    it('returns the parsed damage of a valid field', () => {
      const { errors, options } = validator.check('d6, d4 | d8')

      expect(errors).toEqual([])
      expect(options.map((attacks) => attacks.map((a) => a.damage))).toEqual([['d6', 'd4'], ['d8']])
    })

    it('returns no options when the damage does not parse', () => {
      expect(validator.check('d6||d8')).toEqual({ errors: ['empty option in "d6||d8"'], options: [] })
    })

    it('returns the options along with formula errors', () => {
      const { errors, options } = validator.check('d6, abc')

      expect(errors).toEqual(['invalid damage formula "abc"'])
      expect(options).toHaveLength(1)
    })
  })
})
