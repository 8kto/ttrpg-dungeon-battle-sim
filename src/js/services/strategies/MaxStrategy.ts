import type { Dice } from 'ttrpg-lib-dice'

import type { AttackOption } from '../attacks/types'
import { BaseStrategy } from './BaseStrategy'
import type { ICombatStrategy } from './ICombatStrategy'

export class MaxStrategy extends BaseStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    return count * dice
  }

  calculateDamage(damage: string): number {
    return this.damageFormula.max(damage)
  }

  // the option with the highest max weapon damage (effects ignored); the leftmost one on a tie
  pickOption(options: AttackOption[]): AttackOption {
    const totals = options.map((option) =>
      option.reduce((sum, attack) => sum + this.damageFormula.max(attack.damage), 0),
    )

    return options[totals.indexOf(Math.max(...totals))]
  }
}
