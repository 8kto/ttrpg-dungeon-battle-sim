import type { Dice } from 'ttrpg-lib-dice'

import { BaseStrategy } from './BaseStrategy'
import type { ICombatStrategy } from './ICombatStrategy'

export class MaxStrategy extends BaseStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    return count * dice
  }

  calculateDamage(damage: string): number {
    const { mod, multiplier, sides } = this.getTokens(damage)

    // Return max damage
    return multiplier * sides + mod
  }
}
