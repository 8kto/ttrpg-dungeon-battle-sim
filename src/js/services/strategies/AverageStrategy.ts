import type { Dice } from 'ttrpg-lib-dice'
import { getRandomArrayItem } from 'ttrpg-lib-dice'

import { DamageFormula } from '../attacks/DamageFormula'
import type { IDamageFormula } from '../attacks/IDamageFormula'
import type { AttackOption } from '../attacks/types'
import { Rounding } from '../types'
import { BaseStrategy } from './BaseStrategy'
import type { ICombatStrategy } from './ICombatStrategy'

// Average of NdS is N * (S + 1) / 2, subtracted dice count negative; fractions are rounded according to the Rounding setting
export class AverageStrategy extends BaseStrategy implements ICombatStrategy {
  constructor(
    private readonly rounding: Rounding = Rounding.Up,
    damageFormula: IDamageFormula = new DamageFormula(),
  ) {
    super(damageFormula)
  }

  calculateHp([count, dice]: [number, Dice]): number {
    return this.round((count * (dice + 1)) / 2)
  }

  calculateDamage(damage: string): number {
    const { dice, mod } = this.getTokens(damage)

    return this.round(dice.reduce((sum, { count, sides }) => sum + (count * (sides + 1)) / 2, mod))
  }

  pickOption(options: AttackOption[]): AttackOption {
    return getRandomArrayItem(options)
  }

  private round(value: number): number {
    return this.rounding === Rounding.Up ? Math.ceil(value) : Math.floor(value)
  }
}
