import { DamageParser } from '../attacks/DamageParser'
import type { IDamageParser } from '../attacks/IDamageParser'
import type { AttackOption } from '../attacks/types'
import { messages } from '../messages/MessageService'
import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import type { DamageCheck, IDamageValidator } from './IDamageValidator'

// Checks the syntax of the damage field and that the strategy can evaluate every formula in it
export class DamageValidator implements IDamageValidator {
  constructor(
    private readonly strategy: ICombatStrategy,
    private readonly damageParser: IDamageParser = new DamageParser(),
  ) {}

  validate(damage: string): string[] {
    return this.check(damage).errors
  }

  check(damage: string): DamageCheck {
    if (damage.trim() === '') {
      return { errors: [messages.t('damage.errors.noFormula')], options: [] }
    }

    let options: AttackOption[]
    try {
      options = this.damageParser.parseDamage(damage)
    } catch (err) {
      return { errors: [(err as Error).message], options: [] }
    }

    const errors = options
      .flat()
      .flatMap((attack) => this.damageParser.getFormulasOf(attack))
      .filter((formula) => !this.isValidFormula(formula))
      .map((formula) => messages.t('damage.errors.invalidFormula', { formula }))

    return { errors, options }
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
