import type { Modifier } from './types'
import { ModifierKind } from './types'

// A lasting effect on a participant: paralysis or damage over time
export type ActiveEffect = {
  key: string // label + modifier kind + its arguments, e.g. 'poison:damage_each_round(d4,3)'
  label: string
  kind: ModifierKind.Paralyze | ModifierKind.DamageEachRound
  damage: string | null // damage_each_round only
  remaining: number | null // own turns left; null = until the end of battle
  pending: boolean // damage over time starts in the round after the one it was applied in
}

// Identical effects (same label, modifier and arguments) don't stack; the save bonus is not part of the label
export const getEffectKey = (label: string, modifier: Modifier): string => {
  const { kind, ...args } = modifier

  return `${label}:${kind}(${Object.values(args).join(',')})`
}

export class ActiveEffects {
  private effects: ActiveEffect[] = []

  // false (and no change) when the same effect is already active
  add(effect: ActiveEffect): boolean {
    if (this.effects.some((e) => e.key === effect.key)) {
      return false
    }
    this.effects.push(effect)

    return true
  }

  get isParalyzed(): boolean {
    return this.effects.some((e) => e.kind === ModifierKind.Paralyze && !e.pending)
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
  }

  endRound(): void {
    this.effects.forEach((e) => (e.pending = false))
  }
}
