import type { Dice } from 'ttrpg-lib-dice'

import type { AttackOption } from '../attacks/types'

export interface ICombatStrategy {
  calculateHp(hitDice: [number, Dice]): number
  calculateDamage(damage: string): number
  // which attack option to use this turn
  pickOption(options: AttackOption[]): AttackOption
}
