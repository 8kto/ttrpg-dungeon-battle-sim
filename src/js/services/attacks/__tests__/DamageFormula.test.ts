import { DamageFormula } from '../DamageFormula'
import type { FormulaTokens } from '../IDamageFormula'

describe('DamageFormula', () => {
  const formula = new DamageFormula()

  describe('parse', () => {
    it.each([
      ['d6', { dice: [{ count: 1, sides: 6 }], mod: 0 }],
      ['2d8+3', { dice: [{ count: 2, sides: 8 }], mod: 3 }],
      ['4d8 - 3', { dice: [{ count: 4, sides: 8 }], mod: -3 }],
      [' 2D6 + 1 ', { dice: [{ count: 2, sides: 6 }], mod: 1 }],
      ['3', { dice: [], mod: 3 }],
      [
        'd6+d10',
        {
          dice: [
            { count: 1, sides: 6 },
            { count: 1, sides: 10 },
          ],
          mod: 0,
        },
      ],
      [
        '2d6 + d4 - 1',
        {
          dice: [
            { count: 2, sides: 6 },
            { count: 1, sides: 4 },
          ],
          mod: -1,
        },
      ],
      [
        'd8-d4',
        {
          dice: [
            { count: 1, sides: 8 },
            { count: -1, sides: 4 },
          ],
          mod: 0,
        },
      ],
      ['d6+1+d6+2', { dice: [{ count: 2, sides: 6 }], mod: 3 }],
      ['2+d4', { dice: [{ count: 1, sides: 4 }], mod: 2 }],
    ])('parses "%s"', (text, expected) => {
      expect(formula.parse(text)).toEqual(expected)
    })

    it.each(['', 'oops', 'd6x', '-1', '-d4', 'd6+', 'd6++d4', 'd6 d4', 'd6*2', '0d6', '00d6', 'd0', '2d0', 'd6+0d4'])(
      'rejects "%s"',
      (text) => {
        expect(() => formula.parse(text)).toThrowError(/Invalid damage formula/)
      },
    )

    it.each(['0', '10d10', 'd100', 'd6+0'])('accepts "%s"', (text) => {
      expect(() => formula.parse(text)).not.toThrow()
    })

    it('returns cached tokens for the same formula', () => {
      expect(formula.parse('3d4+1')).toBe(new DamageFormula().parse('3d4+1'))
    })

    it('starts the cache over when it is full', () => {
      const first = formula.parse('7d4+1')
      for (let mod = 1; mod <= 200; mod++) {
        formula.parse(`d6+${mod}`)
      }

      expect(formula.parse('7d4+1')).not.toBe(first)
      expect(formula.parse('7d4+1')).toEqual(first)
    })

    it('does not cache invalid formulas', () => {
      expect(() => formula.parse('oops')).toThrowError(/Invalid damage formula/)
      expect(() => formula.parse('oops')).toThrowError(/Invalid damage formula/)
    })
  })

  describe('format', () => {
    it.each<[FormulaTokens, string]>([
      [{ dice: [{ count: 1, sides: 6 }], mod: 0 }, 'd6'],
      [{ dice: [{ count: 2, sides: 8 }], mod: 3 }, '2d8+3'],
      [{ dice: [{ count: 4, sides: 8 }], mod: -3 }, '4d8-3'],
      [{ dice: [], mod: 5 }, '5'],
      [{ dice: [], mod: 0 }, '0'],
      [{ dice: [], mod: -2 }, ''],
      [
        {
          dice: [
            { count: 1, sides: 6 },
            { count: 2, sides: 10 },
          ],
          mod: 1,
        },
        'd6+2d10+1',
      ],
      [
        {
          dice: [
            { count: 1, sides: 8 },
            { count: -1, sides: 4 },
          ],
          mod: 0,
        },
        'd8-d4',
      ],
      [{ dice: [{ count: -1, sides: 4 }], mod: 3 }, '3-d4'],
      [{ dice: [{ count: 0, sides: 4 }], mod: 0 }, '0'],
    ])('formats %o as "%s"', (tokens, expected) => {
      expect(formula.format(tokens)).toBe(expected)
    })

    it.each(['d6', '2d8+3', 'd6+d10-1', 'd8-2d4+1'])('formats parsed "%s" back', (text) => {
      expect(formula.format(formula.parse(text))).toBe(text)
    })
  })

  describe('max', () => {
    it.each<[string, number]>([
      ['d6', 6],
      ['2d6+1', 13],
      ['d6+d10', 16],
      ['2d6-d4+1', 12],
      ['d4-5', -1],
      ['3', 3],
    ])('"%s" → %i', (text, expected) => {
      expect(formula.max(text)).toBe(expected)
    })
  })

  describe('addDie', () => {
    it.each([
      ['', 6, 'd6'],
      ['d6', 6, '2d6'],
      ['2d6', 6, '3d6'],
      ['2d6', 4, '2d6+d4'],
      ['2d6+1', 8, '2d6+d8+1'],
      ['d6+d8', 8, 'd6+2d8'],
      ['d8-d4', 4, 'd8-d4+d4'],
      ['d6-1', 6, '2d6-1'],
      ['3', 8, 'd8+3'],
      ['0', 6, 'd6'],
      [' 2D6 + 1 ', 6, '3d6+1'],
      ['d6x', 8, 'd8'],
    ])('"%s" + d%i = "%s"', (text, sides, expected) => {
      expect(formula.addDie(text, sides)).toBe(expected)
    })
  })

  describe('addConstant', () => {
    it.each([
      ['', 1, '1'],
      ['', -1, ''],
      ['1', -1, '0'],
      ['0', -1, ''],
      ['2', 1, '3'],
      ['d6', 1, 'd6+1'],
      ['d6+1', 1, 'd6+2'],
      ['d6+1', -1, 'd6'],
      ['d6', -1, 'd6-1'],
      ['2d6-1', -1, '2d6-2'],
      ['d6+d4', 1, 'd6+d4+1'],
      ['d6x', 1, '1'],
    ])('"%s" %i = "%s"', (text, delta, expected) => {
      expect(formula.addConstant(text, delta)).toBe(expected)
    })
  })
})
