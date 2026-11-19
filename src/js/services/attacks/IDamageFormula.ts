// dice of one type; a negative count subtracts them: "d8-d4" has { count: -1, sides: 4 }
export type DiceGroup = {
  count: number
  sides: number
}

// "2d6+d4+1" → dice [2d6, d4] and mod 1; a plain number has no dice
export type FormulaTokens = {
  dice: DiceGroup[]
  mod: number
}

export interface IDamageFormula {
  // "2d8+d4-3" → { dice: [{ count: 2, sides: 8 }, { count: 1, sides: 4 }], mod: -3 };
  // throws on a formula the strategies can't evaluate
  parse(formula: string): Readonly<FormulaTokens>
  // the opposite of parse; a plain number below 1 gives an empty formula
  format(tokens: FormulaTokens): string
  // the highest value: subtracted dice roll 1, e.g. "2d6-d4+1" → 12
  max(formula: string): number
  // "d6" + d6 = "2d6", "2d6+1" + d8 = "2d6+d8+1"
  addDie(formula: string, sides: number): string
  // "d6" + 1 = "d6+1", "d6+1" - 1 = "d6"
  addConstant(formula: string, delta: number): string
}
