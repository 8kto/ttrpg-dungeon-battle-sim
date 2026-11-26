import type { DiceGroup, FormulaTokens, IDamageFormula } from './IDamageFormula'

// The one place that knows the formula format the strategies support: dice and numbers joined by "+" and "-",
// e.g. "d6", "2d6", "3d10+2", "d6 + d10 - 1" or "5"; a die has at least one side and is rolled at least once,
// "0d6" and "d0" are not formulas
export class DamageFormula implements IDamageFormula {
  private static readonly FORMULA_RE: RegExp =
    /^(?:(?:[1-9]\d*)?d[1-9]\d*|\d+)(?:\s*[+-]\s*(?:(?:[1-9]\d*)?d[1-9]\d*|\d+))*$/i
  private static readonly TERM_RE: RegExp = /([+-]?)\s*(?:(\d*)d(\d+)|(\d+))/gi

  // formulas are parsed on every attack, but there are only a few distinct ones per simulation;
  // the limit keeps formulas typed in the UI from piling up
  private static readonly CACHE_LIMIT: number = 200
  private static readonly cache: Map<string, Readonly<FormulaTokens>> = new Map()

  private static readonly EMPTY: Readonly<FormulaTokens> = Object.freeze({ dice: [], mod: 0 })

  parse(formula: string): Readonly<FormulaTokens> {
    const cached = DamageFormula.cache.get(formula)
    if (cached) {
      return cached
    }

    const tokens = Object.freeze(DamageFormula.tokenize(formula))
    if (DamageFormula.cache.size >= DamageFormula.CACHE_LIMIT) {
      DamageFormula.cache.clear()
    }
    DamageFormula.cache.set(formula, tokens)

    return tokens
  }

  format({ dice, mod }: FormulaTokens): string {
    const terms = dice
      .filter(({ count }) => count !== 0)
      .map(({ count, sides }) => `${count < 0 ? '-' : ''}${Math.abs(count) === 1 ? '' : Math.abs(count)}d${sides}`)
    if (mod !== 0) {
      terms.push(String(mod))
    }
    // the formula can't start with "-": "-d4+3" is written "3-d4"
    const first = terms.findIndex((term) => !term.startsWith('-'))
    if (first === -1) {
      return ''
    }

    return [terms[first], ...terms.filter((_, i) => i !== first)]
      .map((term, i) => (i === 0 || term.startsWith('-') ? term : `+${term}`))
      .join('')
  }

  max(formula: string): number {
    const { dice, mod } = this.parse(formula)

    return dice.reduce((sum, { count, sides }) => sum + (count > 0 ? count * sides : count), mod)
  }

  addDie(formula: string, sides: number): string {
    const { dice, mod } = this.parseOrEmpty(formula)
    const same = dice.findIndex((group) => group.count > 0 && group.sides === sides)

    return this.format({
      dice:
        same === -1
          ? [...dice, { count: 1, sides }]
          : dice.map((group, i) => (i === same ? { ...group, count: group.count + 1 } : group)),
      mod,
    })
  }

  addConstant(formula: string, delta: number): string {
    const current = this.parseOrEmpty(formula)

    return this.format({ ...current, mod: current.mod + delta })
  }

  // a formula typed by hand may be invalid or empty, clicks then start over
  private parseOrEmpty(formula: string): Readonly<FormulaTokens> {
    try {
      return this.parse(formula)
    } catch {
      return DamageFormula.EMPTY
    }
  }

  // dice of the same type and sign are added up: "d6+d6" is "2d6"
  private static tokenize(formula: string): FormulaTokens {
    const text = formula.trim()
    if (!DamageFormula.FORMULA_RE.test(text)) {
      throw new Error(`Invalid damage formula: "${formula}"`)
    }

    const dice: DiceGroup[] = []
    let mod = 0
    for (const [, sign, count, sides, number] of text.matchAll(DamageFormula.TERM_RE)) {
      const factor = sign === '-' ? -1 : 1
      if (number) {
        mod += factor * parseInt(number, 10)
        continue
      }

      const group = { count: factor * (count ? parseInt(count, 10) : 1), sides: parseInt(sides, 10) }
      const same = dice.find((g) => g.sides === group.sides && Math.sign(g.count) === Math.sign(group.count))
      if (same) {
        same.count += group.count
      } else {
        dice.push(group)
      }
    }

    return { dice, mod }
  }
}
