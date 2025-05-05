import type { Dice } from 'ttrpg-lib-dice'

import type { ICombatStrategy } from './ICombatStrategy'

export class MaxStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    // maximum roll for each die is the number of faces
    return count * dice
  }

  calculateDamage(damage: string): number {
    // support "d6", "d8+1", "d10 - 2", "d6-3", etc.
    const re = /^d(\d+)\s*([+-]\s*\d+)?$/i
    const match = damage.trim().match(re)
    if (!match) {
      throw new Error(`Invalid damage formula: "${damage}"`)
    }

    const sides = parseInt(match[1], 10)
    const mod = match[2] ? parseInt(match[2].replace(/\s+/g, ''), 10) : 0

    // full value is max face value + modifier
    return sides + mod
  }
}
