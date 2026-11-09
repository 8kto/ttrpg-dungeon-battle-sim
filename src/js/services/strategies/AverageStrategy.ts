import type { Dice } from 'ttrpg-lib-dice'

import { Rounding } from '../types'
import { BaseStrategy } from './BaseStrategy'
import type { ICombatStrategy } from './ICombatStrategy'

// Average of NdS is N * (S + 1) / 2; fractions are rounded according to the Rounding setting
export class AverageStrategy extends BaseStrategy implements ICombatStrategy {
  constructor(private readonly rounding: Rounding = Rounding.Up) {
    super()
  }

  calculateHp([count, dice]: [number, Dice]): number {
    return this.round((count * (dice + 1)) / 2)
  }

  calculateDamage(damage: string): number {
    const { mod, multiplier, sides } = this.getTokens(damage)

    return this.round((multiplier * (sides + 1)) / 2 + mod)
  }

  private round(value: number): number {
    return this.rounding === Rounding.Up ? Math.ceil(value) : Math.floor(value)
  }
}
