import type { Modifier } from './types'
import { ModifierKind } from './types'

// A lasting effect on a participant: paralysis, petrification or damage over time
export type ActiveEffect = {
  key: string // label + modifier kind + its arguments, e.g. 'Poison:damage_each_round(d4,3)'
  label: string
  kind: ModifierKind.Paralyzed | ModifierKind.Petrified | ModifierKind.DamageEachRound
  damage: string | null // damage_each_round only
  remaining: number | null // own turns left; null = until the end of battle
  pending: boolean // damage over time starts in the round after the one it was applied in
}

export class ActiveEffects {
  private effects: ActiveEffect[] = []
  // checked on every attack and target choice, so kept up to date instead of searched for
  private paralyzed: boolean = false
  private petrified: boolean = false

  // Identical effects (same label, modifier and arguments) don't stack; the save bonus is not part of the label
  static getKey(label: string, modifier: Modifier): string {
    const { kind, ...args } = modifier

    return `${label}:${kind}(${Object.values(args).join(',')})`
  }

  // false (and no change) when the same effect is already active
  add(effect: ActiveEffect): boolean {
    if (this.effects.some((e) => e.key === effect.key)) {
      return false
    }
    this.effects.push(effect)
    this.refresh()

    return true
  }

  get isParalyzed(): boolean {
    return this.paralyzed
  }

  get isPetrified(): boolean {
    return this.petrified
  }

  getDamageOverTime(): ActiveEffect[] {
    return this.effects.filter((e) => e.kind === ModifierKind.DamageEachRound && !e.pending)
  }

  // one own turn has passed: count down finite effects and drop finished ones
  tick(): void {
    this.effects.forEach((e) => {
      if (!e.pending && e.remaining !== null) {
        e.remaining--
      }
    })
    this.effects = this.effects.filter((e) => e.remaining === null || e.remaining > 0)
    this.refresh()
  }

  endRound(): void {
    this.effects.forEach((e) => (e.pending = false))
    this.refresh()
  }

  private refresh(): void {
    this.paralyzed = this.effects.some((e) => e.kind === ModifierKind.Paralyzed && !e.pending)
    this.petrified = this.effects.some((e) => e.kind === ModifierKind.Petrified && !e.pending)
  }
}
