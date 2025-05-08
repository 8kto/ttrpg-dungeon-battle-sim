import { Dice, roll } from 'ttrpg-lib-dice'

import type { Side } from '../types'
import type { Logger } from './Logger'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ITargetSelector } from './TargetSelector'
import type { ICharacter } from './types'

export class Participant {
  public currentHp: number
  public readonly hasAttackLimit: boolean
  private maxAttacksRemaining: number

  constructor(
    public readonly char: ICharacter,
    public readonly side: Side,
    private readonly strategy: ICombatStrategy,
    private readonly bias: number,
    private readonly maxAttacksPerChar: number,
    private readonly logger: Logger,
  ) {
    this.currentHp = strategy.calculateHp(char.hitDice)
    this.hasAttackLimit = maxAttacksPerChar > 0
    this.maxAttacksRemaining = maxAttacksPerChar
  }

  attack(enemies: Participant[], targetSelector: ITargetSelector): void {
    // skip due to bias?
    if (this.bias > 0 && roll(Dice.d100) <= this.bias) {
      this.logger.log(`🫢 ${this.char.name} skips turn`)

      return
    }

    // number of attacks = number of damage dice
    let attacksLeft = this.char.damage.length

    while (attacksLeft > 0) {
      // filter out dead and those who've exhausted their attack‐limit
      const targets = enemies.filter((e) => e.isValidTarget())
      if (targets.length === 0) {
        break
      }

      const dmgDice = this.char.damage[this.char.damage.length - attacksLeft]
      const target = targetSelector.selectTarget(targets)

      // consume one attack slot on the target
      if (target.hasAttackLimit) {
        target.maxAttacksRemaining--
      }

      if (this.getAttackRoll() >= target.char.armorClass) {
        const dmg = this.strategy.calculateDamage(dmgDice)
        target.currentHp -= dmg
        this.logger.log(`🗡️ ${this.char.name} attacks ${target.char.name}, damage: ${dmg}`)

        if (target.currentHp <= 0) {
          this.logger.log(`💀️ ${target.char.name} is dead`)
        }
      } else {
        this.logger.log(`🛡️ ${this.char.name} misses ${target.char.name}`)
      }

      attacksLeft--
    }
  }

  getAttackRoll(): number {
    return roll(Dice.d20) + this.char.toHit
  }

  isValidTarget(): boolean {
    return this.currentHp > 0 && (!this.hasAttackLimit || this.maxAttacksRemaining > 0)
  }

  resetAttackLimit(): void {
    this.maxAttacksRemaining = this.maxAttacksPerChar
  }
}
