import type { Dice } from 'ttrpg-lib-dice'

import { BaseStrategy } from './BaseStrategy'
import type { ICombatStrategy } from './ICombatStrategy'

export class AverageStrategy extends BaseStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    const avgPerDie = Math.ceil(dice / 2)

    return count * avgPerDie
  }

  calculateDamage(damage: string): number {
    const { mod, multiplier, sides } = this.getTokens(damage)

    // Return avg damage
    return Math.ceil((multiplier * sides + mod) / 2)
  }
}
