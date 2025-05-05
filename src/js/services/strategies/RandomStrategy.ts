import type { Dice } from 'ttrpg-lib-dice'
import { roll, rollDiceFormula } from 'ttrpg-lib-dice'

import type { ICombatStrategy } from './ICombatStrategy'

export class RandomStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    let sum = 0
    for (let i = 0; i < count; i++) {
      sum += roll(dice)
    }

    return sum
  }

  calculateDamage(damage: string): number {
    return rollDiceFormula(damage)
  }
}
