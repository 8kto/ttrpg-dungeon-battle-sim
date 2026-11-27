import { Dice, roll, shuffleArray } from 'ttrpg-lib-dice'

import type { Side } from '../types'
import { signed } from '../utils/number'
import type { ActiveEffect } from './attacks/ActiveEffects'
import { ActiveEffects } from './attacks/ActiveEffects'
import { DamageParser } from './attacks/DamageParser'
import { DamageSerializer } from './attacks/DamageSerializer'
import type { IDamageParser } from './attacks/IDamageParser'
import type { IDamageSerializer } from './attacks/IDamageSerializer'
import type { Attack, AttackEffect, AttackOption, EffectCounters, Modifier } from './attacks/types'
import { ModifierKind } from './attacks/types'
import type { ITargetSelector } from './ITargetSelector'
import type { ILogger } from './logger/ILogger'
import { messages } from './messages/MessageService'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ICharacter } from './types'

// modifiers that leave a lasting effect on the target
type LastingModifier = Extract<Modifier, { kind: ActiveEffect['kind'] }>

export class Participant {
  // log messages of lasting effects that act at once, damage over time has its own
  private static readonly APPLIED_MESSAGES: Readonly<
    Record<
      ModifierKind.Paralyzed | ModifierKind.Petrified,
      'battle.effects.paralyzedApplied' | 'battle.effects.petrifiedApplied'
    >
  > = {
    [ModifierKind.Paralyzed]: 'battle.effects.paralyzedApplied',
    [ModifierKind.Petrified]: 'battle.effects.petrifiedApplied',
  }

  // the order the modifiers of a hit apply in, lower first, whatever the order they are written in: petrification goes
  // last, as a statue takes no more damage or effects
  private static readonly APPLY_ORDER: Readonly<Record<ModifierKind, number>> = {
    [ModifierKind.Paralyzed]: 0,
    [ModifierKind.SaveOrDie]: 0,
    [ModifierKind.SaveForHalf]: 0,
    [ModifierKind.ExtraDamage]: 0,
    [ModifierKind.DamageEachRound]: 0,
    [ModifierKind.Targets]: 0,
    [ModifierKind.Petrified]: 1,
  }

  public currentHp: number
  public readonly hasAttackLimit: boolean
  // how many more times this participant can be attacked in the current round
  private attacksRemaining: number
  private readonly options: AttackOption[]
  private readonly effects: ActiveEffects = new ActiveEffects()
  // the modifiers of the effects this participant applied, in APPLY_ORDER: sorted once per effect, not on every hit
  private readonly orderedModifiers: WeakMap<AttackEffect, Modifier[]> = new WeakMap()

  constructor(
    public readonly char: ICharacter,
    public readonly side: Side,
    private readonly strategy: ICombatStrategy,
    private readonly bias: number,
    private readonly maxAttacksPerTarget: number, // 0 = unlimited
    private readonly logger: ILogger,
    private readonly effectCounters: EffectCounters = {},
    private readonly damageParser: IDamageParser = new DamageParser(),
    private readonly damageSerializer: IDamageSerializer = new DamageSerializer(),
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

  get isPetrified(): boolean {
    return this.effects.isPetrified
  }

  // takes part in the battle: alive and not petrified
  get isActive(): boolean {
    return this.currentHp > 0 && !this.effects.isPetrified
  }

  private static formatDuration(remaining: number | null): string {
    return remaining === null
      ? messages.t('battle.effects.untilEnd')
      : messages.t('battle.effects.forTurns', { turns: remaining })
  }

  // "Poison damage_each_round", or the modifier alone for an unnamed effect without a save
  private static formatSource(label: string | null, kind: ModifierKind): string {
    return label === null ? kind : `${label} ${kind}`
  }

  // the effect in the log: its label, or how it is written when it has none
  private static effectName({ id, label }: AttackEffect): string {
    return label ?? id
  }

  // the modifiers sorted by APPLY_ORDER; the sort is stable, modifiers of the same order keep the written one
  private static inApplyOrder(modifiers: Modifier[]): Modifier[] {
    return [...modifiers].sort((a, b) => Participant.APPLY_ORDER[a.kind] - Participant.APPLY_ORDER[b.kind])
  }

  // Resolves lasting effects at the start of the own turn; false when the participant can't act
  startTurn(): boolean {
    // a statue takes no damage over time and does nothing until the petrification ends; the other effects wait
    if (this.effects.isPetrified) {
      if (this.logger.isVerbose()) {
        this.logger.log(messages.t('battle.effects.petrified', { name: this.char.name }))
      }
      this.effects.tickPetrification()
      if (!this.effects.isPetrified && this.logger.isVerbose()) {
        this.logger.log(messages.t('battle.effects.petrifiedEnded', { name: this.char.name }))
      }

      return false
    }

    for (const effect of this.effects.getDamageOverTime()) {
      const dmg = this.getEffectValue(effect.damage as string)
      this.currentHp -= dmg
      if (this.logger.isVerbose()) {
        this.logger.log(
          messages.t('battle.effects.damage', {
            dmg,
            name: this.char.name,
            source: Participant.formatSource(effect.label, effect.kind),
          }),
        )
      }
    }
    if (this.currentHp <= 0) {
      if (this.logger.isVerbose()) {
        this.logger.log(messages.t('battle.death', { name: this.char.name }))
      }

      return false
    }

    const paralyzed = this.effects.isParalyzed
    if (paralyzed && this.logger.isVerbose()) {
      this.logger.log(messages.t('battle.effects.paralyzed', { name: this.char.name }))
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
        this.logger.log(messages.t('battle.action.skip', { name: this.char.name }))
      }

      return
    }

    const option = this.options.length > 1 ? this.strategy.pickOption(this.options) : this.options[0]
    if (this.options.length > 1 && this.logger.isVerbose()) {
      this.logger.log(
        messages.t('battle.action.uses', {
          name: this.char.name,
          sources: option
            .map((a) =>
              a.name === null ? a.source : messages.t('battle.action.namedSource', { damage: a.damage, name: a.name }),
            )
            .join(', '),
        }),
      )
    }

    for (const attack of option) {
      // filter out dead and those who've exhausted their attack‐limit
      const targets = enemies.filter((e) => e.isValidTarget())
      if (targets.length === 0) {
        break
      }

      const target = targetSelector.selectTarget(this, targets)
      if (attack.effect === null || attack.effect.areaTargets === null) {
        this.performOneAttack(target, attack)
      } else {
        this.performAreaAttack(target, targets, attack)
      }
    }
  }

  // An area attack hits the selected target and random other ones, without a roll to hit: every target rolls the
  // save on its own; a failed save takes the damage and the modifiers, a successful one only half of save_for_half
  performAreaAttack(primary: Participant, targets: Participant[], attack: Attack): void {
    const effect = attack.effect as AttackEffect
    const total = Math.max(1, this.getEffectValue(effect.areaTargets as string))
    const hit = [primary, ...shuffleArray(targets.filter((t) => t !== primary))].slice(0, total)
    if (this.logger.isVerbose()) {
      this.logger.log(
        messages.t('battle.action.area', {
          name: this.char.name,
          targets: hit.map((t) => t.char.name).join(', '),
          weapon: this.getWeaponInfo(attack),
        }),
      )
    }

    hit.forEach((target) => {
      if (target.hasAttackLimit) {
        target.attacksRemaining--
      }

      // a paralyzed target fails the save
      const saved = this.rollEffectSave(target, effect)
      if (!saved) {
        const dmg = this.rollAttackDamage(target, attack.damage)
        if (dmg > 0) {
          this.dealEffectDamage(target, dmg, Participant.effectName(effect))
        }
      }
      if (target.currentHp > 0) {
        this.applyModifiers(target, effect, saved)
      }
    })
  }

  performOneAttack(target: Participant, attack: Attack): void {
    // consume one attack slot on the target
    if (target.hasAttackLimit) {
      target.attacksRemaining--
    }

    // a paralyzed target is hit automatically and takes max weapon damage
    const helpless = target.isParalyzed
    if (helpless || this.rollToHit() >= target.char.armorClass) {
      const dmg = this.rollAttackDamage(target, attack.damage)
      target.currentHp -= dmg

      // log messages are built only when they will be shown: this is the hottest path
      if (this.logger.isVerbose()) {
        this.logger.log(
          messages.t('battle.action.hit', {
            dmg,
            name: this.char.name,
            target: target.char.name,
            weapon: this.getWeaponInfo(attack),
          }),
        )

        if (target.currentHp <= 0) {
          this.logger.log(messages.t('battle.death', { name: target.char.name }))
        }
      }

      if (target.currentHp > 0 && attack.effect && attack.effect.modifiers.length > 0) {
        this.applyEffect(target, attack.effect)
      }
    } else if (this.logger.isVerbose()) {
      this.logger.log(
        messages.t('battle.action.miss', {
          name: this.char.name,
          target: target.char.name,
          weapon: this.getWeaponInfo(attack),
        }),
      )
    }
  }

  private applyEffect(target: Participant, effect: AttackEffect): void {
    this.applyModifiers(target, effect, this.rollEffectSave(target, effect))
  }

  // rolls the save of the effect and counts the outcome for the summary
  private rollEffectSave(target: Participant, effect: AttackEffect): boolean {
    const saved = this.rollSave(target, effect)
    const counters = (this.effectCounters[effect.id] ??= { applied: 0, hasSave: effect.save !== null, saved: 0 })
    if (saved) {
      counters.saved++
    } else {
      counters.applied++
    }

    return saved
  }

  private applyModifiers(target: Participant, effect: AttackEffect, saved: boolean): void {
    for (const modifier of this.getOrderedModifiers(effect)) {
      if (target.currentHp <= 0) {
        return
      }

      switch (modifier.kind) {
        case ModifierKind.SaveForHalf: {
          const dmg = this.getEffectValue(modifier.damage)
          const source = Participant.formatSource(effect.label, modifier.kind)
          this.dealEffectDamage(target, saved ? Math.floor(dmg / 2) : dmg, source)
          break
        }
        case ModifierKind.ExtraDamage:
          if (!saved) {
            this.dealEffectDamage(target, this.getEffectValue(modifier.damage), Participant.effectName(effect))
          }
          break
        case ModifierKind.SaveOrDie:
          if (!saved) {
            target.currentHp = Math.min(target.currentHp, 0)
            if (this.logger.isVerbose()) {
              this.logger.log(messages.t('battle.deathByEffect', { kind: modifier.kind, name: target.char.name }))
            }
          }
          break
        case ModifierKind.Paralyzed:
        case ModifierKind.Petrified:
        case ModifierKind.DamageEachRound:
          if (!saved) {
            this.addLastingEffect(target, effect.label, modifier)
          }
          break
        case ModifierKind.Targets:
          // picks the targets, see performAreaAttack
          break
        default:
          throw new Error(`Unknown modifier: ${JSON.stringify(modifier)}`)
      }
    }
  }

  private getOrderedModifiers(effect: AttackEffect): Modifier[] {
    const cached = this.orderedModifiers.get(effect)
    if (cached) {
      return cached
    }

    const modifiers = Participant.inApplyOrder(effect.modifiers)
    this.orderedModifiers.set(effect, modifiers)

    return modifiers
  }

  private addLastingEffect(target: Participant, label: string | null, modifier: LastingModifier): void {
    const remaining = modifier.duration === null ? null : this.getEffectValue(modifier.duration)
    if (remaining !== null && remaining <= 0) {
      return
    }

    const key = ActiveEffects.getKey(label, modifier)
    switch (modifier.kind) {
      case ModifierKind.Paralyzed:
      case ModifierKind.Petrified: {
        // paralysis and petrification are immediate
        const added = target.effects.add({ damage: null, key, kind: modifier.kind, label, pending: false, remaining })
        if (added && this.logger.isVerbose()) {
          this.logger.log(
            messages.t(Participant.APPLIED_MESSAGES[modifier.kind], {
              duration: Participant.formatDuration(remaining),
              name: target.char.name,
            }),
          )
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
          this.logger.log(
            messages.t('battle.effects.applied', {
              duration: Participant.formatDuration(remaining),
              name: target.char.name,
              source: Participant.formatSource(label, modifier.kind),
            }),
          )
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

    const saveText = this.damageSerializer.serializeSave(save, saveMod)
    if (target.isParalyzed) {
      if (this.logger.isVerbose()) {
        this.logger.log(messages.t('battle.saves.autoFail', { name: target.char.name, save: saveText }))
      }

      return false
    }

    const rolled = roll(Dice.d20)
    const total = rolled + saveMod
    const value = target.char.saves[save]
    const saved = total >= value
    if (this.logger.isVerbose()) {
      const calc = saveMod === 0 ? String(rolled) : `${rolled}${signed(saveMod)}=${total}`
      const params = { name: target.char.name, roll: calc, save: saveText, value }
      this.logger.log(messages.t(saved ? 'battle.saves.success' : 'battle.saves.failure', params))
    }

    return saved
  }

  private dealEffectDamage(target: Participant, dmg: number, source: string): void {
    target.currentHp -= dmg
    if (this.logger.isVerbose()) {
      this.logger.log(messages.t('battle.effects.damage', { dmg, name: target.char.name, source }))
      if (target.currentHp <= 0) {
        this.logger.log(messages.t('battle.death', { name: target.char.name }))
      }
    }
  }

  // the damage of an attack that hits: a paralyzed target takes the max; negative modifiers must not heal the target
  private rollAttackDamage(target: Participant, damage: string): number {
    return target.isParalyzed ? Math.max(0, this.damageParser.getMaxDamage(damage)) : this.getEffectValue(damage)
  }

  // damage, durations and other effect values are computed by the strategy; negative values count as 0
  private getEffectValue(formula: string): number {
    return Math.max(0, this.strategy.calculateDamage(formula))
  }

  // " with Sword (d6)" for named attacks and attacks with effects, nothing for plain ones
  private getWeaponInfo({ damage, effect, name }: Attack): string {
    const label = name ?? (effect === null ? null : Participant.effectName(effect))

    return label === null ? '' : messages.t('battle.action.weapon', { damage, label })
  }

  rollToHit(): number {
    return roll(Dice.d20) + this.char.toHit
  }

  isValidTarget(): boolean {
    return this.isActive && (!this.hasAttackLimit || this.attacksRemaining > 0)
  }

  resetAttackLimit(): void {
    this.attacksRemaining = this.maxAttacksPerTarget
  }
}
