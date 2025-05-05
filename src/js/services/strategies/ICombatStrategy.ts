import type { Dice } from 'ttrpg-lib-dice'

export interface ICombatStrategy {
  calculateHp(hitDice: [number, Dice]): number
  calculateDamage(damage: string): number
}
