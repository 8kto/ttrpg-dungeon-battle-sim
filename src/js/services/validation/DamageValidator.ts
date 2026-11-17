import { DamageParser } from '../attacks/DamageParser'
import type { IDamageParser } from '../attacks/IDamageParser'
import { messages } from '../messages/MessageService'
import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import type { IDamageValidator } from './IDamageValidator'

// Checks the syntax of the damage field and that the strategy can evaluate every formula in it
export class DamageValidator implements IDamageValidator {
  constructor(
    private readonly strategy: ICombatStrategy,
    private readonly damageParser: IDamageParser = new DamageParser(),
  ) {}

  validate(damage: string): string[] {
    if (damage.trim() === '') {
      return [messages.t('damage.errors.noFormula')]
    }

    try {
      return this.damageParser
        .parseDamage(damage)
        .flat()
        .flatMap((attack) => this.damageParser.getFormulasOf(attack))
        .filter((formula) => !this.isValidFormula(formula))
        .map((formula) => messages.t('damage.errors.invalidFormula', { formula }))
    } catch (err) {
      return [(err as Error).message]
    }
  }

  private isValidFormula(formula: string): boolean {
    try {
      this.strategy.calculateDamage(formula)

      return true
    } catch {
      return false
    }
  }
}
