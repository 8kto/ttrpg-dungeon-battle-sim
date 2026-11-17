import { DamageFormula } from '../attacks/DamageFormula'
import type { FormulaTokens, IDamageFormula } from '../attacks/IDamageFormula'

export class BaseStrategy {
  constructor(protected readonly damageFormula: IDamageFormula = new DamageFormula()) {}

  getTokens(damageFormula: string): Readonly<FormulaTokens> {
    return this.damageFormula.parse(damageFormula)
  }
}
