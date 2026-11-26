import type { Attack, AttackOption } from './types'

export interface IDamageParser {
  // The whole damage field: options separated by "|", attacks of an option separated by ","
  parseDamage(input: string): AttackOption[]
  // One attack: a damage formula with an optional name and effect, e.g. "d6<Bite>[Poison(-2),save_or_die]"
  parseAttack(source: string): Attack
  // The weapon formula and every formula used by modifiers, for validation
  getFormulasOf(attack: Attack): string[]
  // True when the text is a formula in the format of DamageFormula, e.g. "2d6+1"
  isFormula(text: string): boolean
  // Maximum value of a formula, e.g. "2d6+1" → 13
  getMaxDamage(formula: string): number
  // The error of an attack name (the text inside "<>"), null when it's valid
  checkName(name: string): string | null
}
