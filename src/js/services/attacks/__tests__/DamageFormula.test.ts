import { DamageFormula } from '../DamageFormula'

describe('DamageFormula', () => {
  const formula = new DamageFormula()

  describe('parse', () => {
    it.each([
      ['d6', { mod: 0, multiplier: 1, sides: 6 }],
      ['2d8+3', { mod: 3, multiplier: 2, sides: 8 }],
      ['4d8 - 3', { mod: -3, multiplier: 4, sides: 8 }],
      [' 2D6 + 1 ', { mod: 1, multiplier: 2, sides: 6 }],
      ['3', { mod: 3, multiplier: 0, sides: 0 }],
    ])('parses "%s"', (text, expected) => {
      expect(formula.parse(text)).toEqual(expected)
    })

    it.each(['', 'oops', 'd6+d4', 'd6x', '-1'])('rejects "%s"', (text) => {
      expect(() => formula.parse(text)).toThrowError(/Invalid damage formula/)
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
    it.each([
      [{ mod: 0, multiplier: 1, sides: 6 }, 'd6'],
      [{ mod: 3, multiplier: 2, sides: 8 }, '2d8+3'],
      [{ mod: -3, multiplier: 4, sides: 8 }, '4d8-3'],
      [{ mod: 5, multiplier: 0, sides: 0 }, '5'],
      [{ mod: 0, multiplier: 0, sides: 0 }, ''],
    ])('formats %o as "%s"', (tokens, expected) => {
      expect(formula.format(tokens)).toBe(expected)
    })
  })

  describe('addDie', () => {
    it.each([
      ['', 6, 'd6'],
      ['d6', 6, '2d6'],
      ['2d6', 6, '3d6'],
      ['2d6', 4, 'd4'],
      ['2d6+1', 8, 'd8+1'],
      ['d6-1', 6, '2d6-1'],
      ['3', 8, 'd8+3'],
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
      ['1', -1, ''],
      ['2', 1, '3'],
      ['d6', 1, 'd6+1'],
      ['d6+1', 1, 'd6+2'],
      ['d6+1', -1, 'd6'],
      ['d6', -1, 'd6-1'],
      ['2d6-1', -1, '2d6-2'],
      ['d6x', 1, '1'],
    ])('"%s" %i = "%s"', (text, delta, expected) => {
      expect(formula.addConstant(text, delta)).toBe(expected)
    })
  })
})
