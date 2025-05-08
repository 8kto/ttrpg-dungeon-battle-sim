export class BaseStrategy {
  // support "d6", "2d6", "3d10+2", "4d8 - 3", etc.
  private static readonly FORMULA_RE: RegExp = /^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i

  getTokens(damageFormula: string): {
    multiplier: number
    sides: number
    mod: number
  } {
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

    return {
      mod: mod ?? 0,
      multiplier,
      sides,
    }
  }
}
