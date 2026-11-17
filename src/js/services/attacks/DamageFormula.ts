import type { FormulaTokens, IDamageFormula } from './IDamageFormula'

// The one place that knows the formula format the strategies support: "d6", "2d6", "3d10+2", "4d8 - 3" or "5".
// Dice of different types can't be mixed
export class DamageFormula implements IDamageFormula {
  private static readonly DICE_RE: RegExp = /^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i
  private static readonly NUMBER_RE: RegExp = /^\d+$/

  // formulas are parsed on every attack, but there are only a few distinct ones per simulation
  private static readonly cache: Map<string, Readonly<FormulaTokens>> = new Map()

  private static readonly EMPTY: Readonly<FormulaTokens> = Object.freeze({ mod: 0, multiplier: 0, sides: 0 })

  parse(formula: string): Readonly<FormulaTokens> {
    const cached = DamageFormula.cache.get(formula)
    if (cached) {
      return cached
    }

    const tokens = Object.freeze(DamageFormula.tokenize(formula))
    DamageFormula.cache.set(formula, tokens)

    return tokens
  }

  format({ mod, multiplier, sides }: FormulaTokens): string {
    if (multiplier === 0) {
      return mod > 0 ? String(mod) : ''
    }
    const dice = `${multiplier === 1 ? '' : multiplier}d${sides}`

    return mod === 0 ? dice : `${dice}${mod > 0 ? '+' : ''}${mod}`
  }

  addDie(formula: string, sides: number): string {
    const current = this.parseOrEmpty(formula)

    return this.format(
      current.multiplier > 0 && current.sides === sides
        ? { ...current, multiplier: current.multiplier + 1 }
        : { mod: current.mod, multiplier: 1, sides },
    )
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

  private static tokenize(formula: string): FormulaTokens {
    const text = formula.trim()
    // plain integers are used for effect durations, e.g. damage_each_round(d4,3)
    if (DamageFormula.NUMBER_RE.test(text)) {
      return { mod: parseInt(text, 10), multiplier: 0, sides: 0 }
    }

    const match = text.match(DamageFormula.DICE_RE)
    if (!match) {
      throw new Error(`Invalid damage formula: "${formula}"`)
    }

    return {
      mod: match[3] ? parseInt(match[3].replace(/\s+/g, ''), 10) : 0,
      multiplier: match[1] ? parseInt(match[1], 10) : 1,
      sides: parseInt(match[2], 10),
    }
  }
}
