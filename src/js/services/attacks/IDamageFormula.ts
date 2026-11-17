// NdS±M; a plain number has no dice: multiplier 0, sides 0
export type FormulaTokens = {
  multiplier: number
  sides: number
  mod: number
}

export interface IDamageFormula {
  // "2d8+3" → { multiplier: 2, sides: 8, mod: 3 }; throws on a formula the strategies can't evaluate
  parse(formula: string): Readonly<FormulaTokens>
  // the opposite of parse; a plain number below 1 gives an empty formula
  format(tokens: FormulaTokens): string
  // "d6" + d6 = "2d6"; another die replaces the dice, keeping the modifier: "2d6+1" + d8 = "d8+1"
  addDie(formula: string, sides: number): string
  // "d6" + 1 = "d6+1", "d6+1" - 1 = "d6"
  addConstant(formula: string, delta: number): string
}
