import type { Dice } from 'ttrpg-lib-dice'

import type { ICombatStrategy } from './ICombatStrategy'

export class MaxStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    return count * dice
  }

  calculateDamage(damage: string): number {
    // support "d6", "2d6", "3d10+2", "4d8 - 3", etc.
    const re = /^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i
    const match = damage.trim().match(re)
    if (!match) {
      throw new Error(`Invalid damage formula: "${damage}"`)
    }

    // parse number of dice (default 1 if empty)
    const count = match[1] ? parseInt(match[1], 10) : 1
    // parse sides per die
    const sides = parseInt(match[2], 10)
    // parse optional modifier
    const mod = match[3] ? parseInt(match[3].replace(/\s+/g, ''), 10) : 0

    // max damage = (count × sides) + modifier
    return count * sides + mod
  }
}
