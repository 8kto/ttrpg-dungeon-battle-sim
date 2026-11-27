import type { Dice } from 'ttrpg-lib-dice'
import { getRandomArrayItem, roll, secureRandomInteger } from 'ttrpg-lib-dice'

import type { AttackOption } from '../attacks/types'
import { BaseStrategy } from './BaseStrategy'
import type { ICombatStrategy } from './ICombatStrategy'

export class RandomStrategy extends BaseStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    let sum = 0
    for (let i = 0; i < count; i++) {
      sum += roll(dice)
    }

    return sum
  }

  // every die is rolled apart, subtracted dice too: "d8-d4" is 0 when d8 rolls 1 and d4 rolls 4
  calculateDamage(damage: string): number {
    const { dice, mod } = this.getTokens(damage)
    let sum = mod
    for (const { count, sides } of dice) {
      const sign = Math.sign(count)
      for (let i = 0; i < Math.abs(count); i++) {
        sum += sign * secureRandomInteger(1, sides)
      }
    }

    return sum
  }

  pickOption(options: AttackOption[]): AttackOption {
    return getRandomArrayItem(options)
  }
}
