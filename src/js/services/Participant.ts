import { Dice, roll } from 'ttrpg-lib-dice'

import type { Side } from '../types'
import { ActiveEffects, effectKey } from './attacks/ActiveEffects'
import { maxDamage } from './attacks/maxDamage'
import { parseDamage } from './attacks/parseDamage'
import type { Attack, AttackEffect, AttackOption, EffectCounters } from './attacks/types'
import type { ILogger } from './ILogger'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ITargetSelector } from './TargetSelector'
import type { ICharacter } from './types'

export class Participant {
  public currentHp: number
  public readonly hasAttackLimit: boolean
  // how many more times this participant can be attacked in the current round
  private attacksRemaining: number
  private readonly options: AttackOption[]
  private readonly effects: ActiveEffects = new ActiveEffects()

  constructor(
    public readonly char: ICharacter,
    public readonly side: Side,
    private readonly strategy: ICombatStrategy,
    private readonly bias: number,
    private readonly maxAttacksPerTarget: number, // 0 = unlimited
    private readonly logger: ILogger,
    private readonly effectCounters: EffectCounters = {},
  ) {
    if (!Number.isInteger(maxAttacksPerTarget) || maxAttacksPerTarget < 0) {
      throw new Error(`Invalid max attacks per target: ${maxAttacksPerTarget}`)
    }

    // parsed once per participant, not on every attack
    this.options = parseDamage(char.damage)
    this.currentHp = strategy.calculateHp(char.hitDice)
    this.hasAttackLimit = maxAttacksPerTarget > 0
    this.attacksRemaining = maxAttacksPerTarget
  }

  get isParalyzed(): boolean {
    return this.effects.isParalyzed
  }

  // Resolves lasting effects at the start of the own turn; false when the participant can't act
  startTurn(): boolean {
    for (const effect of this.effects.damageOverTime) {
      const dmg = this.effectValue(effect.damage as string)
      this.currentHp -= dmg
      if (this.logger.isVerbose()) {
        this.logger.log(`🔥 ${this.char.name} takes ${dmg} damage (${effect.label} damage_each_round)`) // FIXME hardcoded mod name
      }
    }
    if (this.currentHp <= 0) {
      if (this.logger.isVerbose()) {
        this.logger.log(`💀️ ${this.char.name} is dead`)
      }

      return false
    }

    const paralyzed = this.effects.isParalyzed
    if (paralyzed && this.logger.isVerbose()) {
      this.logger.log(`😵‍ ${this.char.name} is paralyzed, skips turn`)
    }
    this.effects.tick()

    return !paralyzed
  }

  // damage over time applied in this round starts working in the next one
  endRound(): void {
    this.effects.endRound()
  }

  shouldSkip(): boolean {
    // skip due to bias?
    return this.bias > 0 && roll(Dice.d100) <= this.bias
  }

  attack(enemies: Participant[], targetSelector: ITargetSelector): void {
    if (this.shouldSkip()) {
      if (this.logger.isVerbose()) {
        this.logger.log(`🫢 ${this.char.name} skips turn`)
      }

      return
    }

    const option = this.options.length > 1 ? this.strategy.pickOption(this.options) : this.options[0]
    if (this.options.length > 1 && this.logger.isVerbose()) {
      this.logger.log(`🎲 ${this.char.name} uses: ${option.map((a) => a.source).join(', ')}`)
    }

    for (const attack of option) {
      // filter out dead and those who've exhausted their attack‐limit
      const targets = enemies.filter((e) => e.isValidTarget())
      if (targets.length === 0) {
        break
      }

      this.performOneAttack(targetSelector.selectTarget(targets), attack)
    }
  }

  performOneAttack(target: Participant, attack: Attack): void {
    // consume one attack slot on the target
    if (target.hasAttackLimit) {
      target.attacksRemaining--
    }

    // a paralyzed target is hit automatically and takes max weapon damage
    const helpless = target.isParalyzed
    if (helpless || this.rollToHit() >= target.char.armorClass) {
      // negative modifiers must not heal the target
      const dmg = helpless ? Math.max(0, maxDamage(attack.damage)) : this.effectValue(attack.damage)
      target.currentHp -= dmg

      // log messages are built only when they will be shown: this is the hottest path
      if (this.logger.isVerbose()) {
        this.logger.log(`🗡️ ${this.char.name} attacks ${target.char.name}${this.weaponInfo(attack)}, damage: ${dmg}`)

        if (target.currentHp <= 0) {
          this.logger.log(`💀️ ${target.char.name} is dead`)
        }
      }

      if (target.currentHp > 0 && attack.effect && attack.effect.modifiers.length > 0) {
        this.applyEffect(target, attack.effect)
      }
    } else if (this.logger.isVerbose()) {
      this.logger.log(`🛡️ ${this.char.name} misses ${target.char.name}${this.weaponInfo(attack)}`)
    }
  }

  private applyEffect(target: Participant, effect: AttackEffect): void {
    const saved = this.rollSave(target, effect)
    const counters = (this.effectCounters[effect.label] ??= { applied: 0, hasSave: effect.save !== null, saved: 0 })
    if (saved) {
      counters.saved++
    } else {
      counters.applied++
    }

    for (const modifier of effect.modifiers) {
      if (target.currentHp <= 0) {
        break
      }

      switch (modifier.kind) {
        case 'save_for_half': {
          const dmg = this.effectValue(modifier.damage)
          this.dealEffectDamage(target, saved ? Math.floor(dmg / 2) : dmg, `${effect.label} save_for_half`)
          break
        }
        case 'extra_damage':
          if (!saved) {
            this.dealEffectDamage(target, this.effectValue(modifier.damage), effect.label)
          }
          break
        case 'save_or_die':
          if (!saved) {
            target.currentHp = Math.min(target.currentHp, 0)
            if (this.logger.isVerbose()) {
              this.logger.log(`💀 ${target.char.name} dies (save_or_die)`)
            }
          }
          break
        case 'paralyze':
        case 'damage_each_round': {
          if (saved) {
            break
          }
          const remaining = modifier.duration === null ? null : this.effectValue(modifier.duration)
          if (remaining !== null && remaining <= 0) {
            break
          }
          const added = target.effects.add({
            damage: modifier.kind === 'damage_each_round' ? modifier.damage : null,
            key: effectKey(effect.label, modifier),
            kind: modifier.kind,
            label: effect.label,
            // paralysis is immediate, damage over time starts next round
            pending: modifier.kind === 'damage_each_round',
            remaining,
          })
          if (added && this.logger.isVerbose()) {
            const duration = remaining === null ? 'until the end of battle' : `for ${remaining} turns`
            this.logger.log(
              modifier.kind === 'paralyze'
                ? `🧊 ${target.char.name} paralyzed ${duration}`
                : `🔥 ${target.char.name} affected by ${effect.label} damage_each_round ${duration}`,
            )
          }
          break
        }
      }
    }
  }

  // true when the target saves; no save tag means the effect always applies, paralyzed targets always fail
  private rollSave(target: Participant, { save, saveMod }: AttackEffect): boolean {
    if (save === null) {
      return false
    }

    const saveText = saveMod === 0 ? save : `${save}(${saveMod > 0 ? '+' : ''}${saveMod})`
    if (target.isParalyzed) {
      if (this.logger.isVerbose()) {
        this.logger.log(`🧪 ${target.char.name} is paralyzed, fails save vs ${saveText}`)
      }

      return false
    }

    const rolled = roll(Dice.d20)
    const total = rolled + saveMod
    const value = target.char.saves[save]
    const saved = total >= value
    if (this.logger.isVerbose()) {
      const calc = saveMod === 0 ? String(rolled) : `${rolled}${saveMod > 0 ? '+' : ''}${saveMod}=${total}`
      const outcome = saved ? 'saves vs' : 'fails save vs'
      this.logger.log(`🧪 ${target.char.name} ${outcome} ${saveText} (${calc} ${saved ? '≥' : '<'} ${value})`)
    }

    return saved
  }

  private dealEffectDamage(target: Participant, dmg: number, source: string): void {
    target.currentHp -= dmg
    if (this.logger.isVerbose()) {
      this.logger.log(`🔥 ${target.char.name} takes ${dmg} damage (${source})`)
      if (target.currentHp <= 0) {
        this.logger.log(`💀️ ${target.char.name} is dead`)
      }
    }
  }

  // damage, durations and other effect values are computed by the strategy; negative values count as 0
  private effectValue(formula: string): number {
    return Math.max(0, this.strategy.calculateDamage(formula))
  }

  // " with knife (d6)" for tagged attacks, nothing for plain ones
  private weaponInfo({ damage, effect }: Attack): string {
    return effect ? ` with ${effect.label} (${damage})` : ''
  }

  rollToHit(): number {
    return roll(Dice.d20) + this.char.toHit
  }

  isValidTarget(): boolean {
    return this.currentHp > 0 && (!this.hasAttackLimit || this.attacksRemaining > 0)
  }

  resetAttackLimit(): void {
    this.attacksRemaining = this.maxAttacksPerTarget
  }
}
