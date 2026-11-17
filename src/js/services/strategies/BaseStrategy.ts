type FormulaTokens = {
  multiplier: number
  sides: number
  mod: number
}

export class BaseStrategy {
  // support "d6", "2d6", "3d10+2", "4d8 - 3", etc.
  private static readonly FORMULA_RE: RegExp = /^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i

  // formulas are parsed on every attack, but there are only a few distinct ones per simulation
  private static readonly tokensCache: Map<string, Readonly<FormulaTokens>> = new Map()

  getTokens(damageFormula: string): Readonly<FormulaTokens> {
    const cached = BaseStrategy.tokensCache.get(damageFormula)
    if (cached) {
      return cached
    }

    const tokens = BaseStrategy.parseFormula(damageFormula)
    BaseStrategy.tokensCache.set(damageFormula, tokens)

    return tokens
  }

  private static parseFormula(damageFormula: string): Readonly<FormulaTokens> {
    // plain integers are used for effect durations, e.g. damage_each_round(d4,3)
    if (/^\d+$/.test(damageFormula.trim())) {
      return Object.freeze({ mod: parseInt(damageFormula, 10), multiplier: 0, sides: 0 })
    }

    const match = damageFormula.trim().match(BaseStrategy.FORMULA_RE)
    if (!match) {
      throw new Error(`Invalid damage formula: "${damageFormula}"`)
    }

    // parse number of dice (default 1 if empty)
    const multiplier = match[1] ? parseInt(match[1], 10) : 1
    // parse sides per die
    const sides = parseInt(match[2], 10)
    // parse optional modifier
    const mod = match[3] ? parseInt(match[3].replace(/\s+/g, ''), 10) : 0

    return Object.freeze({ mod, multiplier, sides })
  }
}
