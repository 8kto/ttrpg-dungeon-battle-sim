import type { Attack, AttackOption } from './types'

export interface IDamageParser {
  // The whole damage field: options separated by "|", attacks of an option separated by ","
  parseDamage(input: string): AttackOption[]
  // One attack: a damage formula with an optional effect in brackets, e.g. "d6[poison(-2),save_or_die]"
  parseAttack(source: string): Attack
  // The weapon formula and every formula used by modifiers, for validation
  getFormulasOf(attack: Attack): string[]
  // Maximum value of a formula, e.g. "d6+d4" → 10
  getMaxDamage(formula: string): number
}
