import { Dice, roll } from 'ttrpg-lib-dice'

import type { Side } from '../types'
import type { Logger } from './Logger'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ITargetSelector } from './TargetSelector'
import type { ICharacter } from './types'

export class Participant {
  public currentHp: number

  constructor(
    public readonly char: ICharacter,
    public readonly side: Side,
    strategy: ICombatStrategy,
    private readonly logger: Logger,
  ) {
    this.currentHp = strategy.calculateHp(char.hitDice)
  }

  attack(enemies: Participant[], strategy: ICombatStrategy, targetSelector: ITargetSelector): void {
    for (const dmgDice of this.char.damage) {
      const living = enemies.filter((e) => e.currentHp > 0)
      if (living.length === 0) {
        break
      }

      const target = targetSelector.selectTarget(this, living)
      const attackRoll = roll(Dice.d20) + this.char.toHit
      if (attackRoll >= target.char.armorClass) {
        const dmg = strategy.calculateDamage(dmgDice)
        target.currentHp -= dmg

        this.logger.log(`🗡️ ${this.char.name} attacks ${target.char.name}, damage: ${dmg}`)

        if (target.currentHp <= 0) {
          this.logger.log(`💀️ ${target.char.name} is dead`)
        }
      } else {
        this.logger.log(`🛡️ ${this.char.name} misses ${target.char.name}`)
      }
    }
  }
}
