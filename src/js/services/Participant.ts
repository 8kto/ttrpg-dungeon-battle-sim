import { Dice, roll } from 'ttrpg-lib-dice'

import type { Side } from '../types'
import type { ActiveEffect } from './attacks/ActiveEffects'
import { ActiveEffects, getEffectKey } from './attacks/ActiveEffects'
import { DamageParser } from './attacks/DamageParser'
import type { IDamageParser } from './attacks/IDamageParser'
import type { Attack, AttackEffect, AttackOption, EffectCounters, Modifier } from './attacks/types'
import { ModifierKind } from './attacks/types'
import type { ILogger } from './logger/ILogger'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ITargetSelector } from './TargetSelector'
import type { ICharacter } from './types'

// modifiers that leave a lasting effect on the target
type LastingModifier = Extract<Modifier, { kind: ActiveEffect['kind'] }>

const formatDuration = (remaining: number | null): string =>
  remaining === null ? 'until the end of battle' : `for ${remaining} turns`

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
    private readonly damageParser: IDamageParser = new DamageParser(),
  ) {
    if (!Number.isInteger(maxAttacksPerTarget) || maxAttacksPerTarget < 0) {
      throw new Error(`Invalid max attacks per target: ${maxAttacksPerTarget}`)
    }

    // parsed once per participant, not on every attack
    this.options = damageParser.parseDamage(char.damage)
    this.currentHp = strategy.calculateHp(char.hitDice)
    this.hasAttackLimit = maxAttacksPerTarget > 0
    this.attacksRemaining = maxAttacksPerTarget
  }

  get isParalyzed(): boolean {
    return this.effects.isParalyzed
  }

  // Resolves lasting effects at the start of the own turn; false when the participant can't act
  startTurn(): boolean {
    for (const effect of this.effects.getDamageOverTime()) {
      const dmg = this.getEffectValue(effect.damage as string)
      this.currentHp -= dmg
      if (this.logger.isVerbose()) {
        this.logger.log(`🔥 ${this.char.name} takes ${dmg} damage (${effect.label} ${effect.kind})`)
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
      const dmg = helpless
        ? Math.max(0, this.damageParser.getMaxDamage(attack.damage))
        : this.getEffectValue(attack.damage)
      target.currentHp -= dmg

      // log messages are built only when they will be shown: this is the hottest path
      if (this.logger.isVerbose()) {
        this.logger.log(`🗡️ ${this.char.name} attacks ${target.char.name}${this.getWeaponInfo(attack)}, damage: ${dmg}`)

        if (target.currentHp <= 0) {
          this.logger.log(`💀️ ${target.char.name} is dead`)
        }
      }

      if (target.currentHp > 0 && attack.effect && attack.effect.modifiers.length > 0) {
        this.applyEffect(target, attack.effect)
      }
    } else if (this.logger.isVerbose()) {
      this.logger.log(`🛡️ ${this.char.name} misses ${target.char.name}${this.getWeaponInfo(attack)}`)
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
        case ModifierKind.SaveForHalf: {
          const dmg = this.getEffectValue(modifier.damage)
          this.dealEffectDamage(target, saved ? Math.floor(dmg / 2) : dmg, `${effect.label} ${modifier.kind}`)
          break
        }
        case ModifierKind.ExtraDamage:
          if (!saved) {
            this.dealEffectDamage(target, this.getEffectValue(modifier.damage), effect.label)
          }
          break
        case ModifierKind.SaveOrDie:
          if (!saved) {
            target.currentHp = Math.min(target.currentHp, 0)
            if (this.logger.isVerbose()) {
              this.logger.log(`💀 ${target.char.name} dies (${modifier.kind})`)
            }
          }
          break
        case ModifierKind.Paralyze:
        case ModifierKind.DamageEachRound:
          if (!saved) {
            this.addLastingEffect(target, effect.label, modifier)
          }
          break
        default:
          throw new Error(`Unknown modifier: ${JSON.stringify(modifier)}`)
      }
    }
  }

  private addLastingEffect(target: Participant, label: string, modifier: LastingModifier): void {
    const remaining = modifier.duration === null ? null : this.getEffectValue(modifier.duration)
    if (remaining !== null && remaining <= 0) {
      return
    }

    const key = getEffectKey(label, modifier)
    switch (modifier.kind) {
      case ModifierKind.Paralyze: {
        // paralysis is immediate
        const added = target.effects.add({ damage: null, key, kind: modifier.kind, label, pending: false, remaining })
        if (added && this.logger.isVerbose()) {
          this.logger.log(`🧊 ${target.char.name} paralyzed ${formatDuration(remaining)}`)
        }
        break
      }
      case ModifierKind.DamageEachRound: {
        // damage over time starts next round
        const added = target.effects.add({
          damage: modifier.damage,
          key,
          kind: modifier.kind,
          label,
          pending: true,
          remaining,
        })
        if (added && this.logger.isVerbose()) {
          this.logger.log(`🔥 ${target.char.name} affected by ${label} ${modifier.kind} ${formatDuration(remaining)}`)
        }
        break
      }
      default:
        throw new Error(`Unknown lasting modifier: ${JSON.stringify(modifier)}`)
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
  private getEffectValue(formula: string): number {
    return Math.max(0, this.strategy.calculateDamage(formula))
  }

  // " with knife (d6)" for tagged attacks, nothing for plain ones
  private getWeaponInfo({ damage, effect }: Attack): string {
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
