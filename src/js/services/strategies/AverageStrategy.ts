import type { Dice } from 'ttrpg-lib-dice'

import type { ICombatStrategy } from './ICombatStrategy'

export class AverageStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    const avgPerDie = Math.ceil(dice / 2)

    return count * avgPerDie
  }

  calculateDamage(damage: string): number {
    // return Math.ceil(dice / 2)
    return 0 // FIXME
  }
}
