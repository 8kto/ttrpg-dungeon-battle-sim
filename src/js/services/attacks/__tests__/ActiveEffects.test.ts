import type { ActiveEffect } from '../ActiveEffects'
import { ActiveEffects } from '../ActiveEffects'
import { ModifierKind } from '../types'

const dot = (label: string, damage: string, remaining: number | null, pending: boolean = false): ActiveEffect => ({
  damage,
  key: ActiveEffects.getKey(label, {
    damage,
    duration: remaining === null ? null : String(remaining),
    kind: ModifierKind.DamageEachRound,
  }),
  kind: ModifierKind.DamageEachRound,
  label,
  pending,
  remaining,
})

const paralysis = (remaining: number | null): ActiveEffect => ({
  damage: null,
  key: ActiveEffects.getKey('paralyze', {
    duration: remaining === null ? null : String(remaining),
    kind: ModifierKind.Paralyzed,
  }),
  kind: ModifierKind.Paralyzed,
  label: 'paralyze',
  pending: false,
  remaining,
})

const petrification = (remaining: number | null): ActiveEffect => ({
  damage: null,
  key: ActiveEffects.getKey('Gaze', {
    duration: remaining === null ? null : String(remaining),
    kind: ModifierKind.Petrified,
  }),
  kind: ModifierKind.Petrified,
  label: 'Gaze',
  pending: false,
  remaining,
})

describe('ActiveEffects', () => {
  describe('getKey', () => {
    it('is the same for the same label and modifier', () => {
      // poison and poison(-2) both have the label "poison"
      expect(ActiveEffects.getKey('poison', { damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound })).toBe(
        ActiveEffects.getKey('poison', { damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }),
      )
    })

    it('differs by label, damage or duration', () => {
      const key = ActiveEffects.getKey('poison', { damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound })

      expect(
        ActiveEffects.getKey('fire', { damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }),
      ).not.toBe(key)
      expect(
        ActiveEffects.getKey('poison', { damage: 'd6', duration: null, kind: ModifierKind.DamageEachRound }),
      ).not.toBe(key)
      expect(
        ActiveEffects.getKey('poison', { damage: 'd4', duration: '3', kind: ModifierKind.DamageEachRound }),
      ).not.toBe(key)
    })

    it('takes an effect without a label', () => {
      expect(ActiveEffects.getKey(null, { duration: '2', kind: ModifierKind.Paralyzed })).toBe(':paralyzed(2)')
    })
  })

  it('does not stack identical effects', () => {
    const effects = new ActiveEffects()
    const first = dot('poison', 'd4', 3)

    expect(effects.add(first)).toBe(true)
    effects.tick()
    expect(effects.add(dot('poison', 'd4', 3))).toBe(false)
    expect(effects.getDamageOverTime()).toHaveLength(1)
    expect(effects.getDamageOverTime()[0].remaining).toBe(2)
  })

  it('stacks different effects', () => {
    const effects = new ActiveEffects()
    effects.add(dot('poison', 'd4', null))
    effects.add(dot('fire', 'd4', null))

    expect(effects.getDamageOverTime().map((e) => e.label)).toEqual(['poison', 'fire'])
  })

  it('ticks finite effects and drops finished ones', () => {
    const effects = new ActiveEffects()
    effects.add(paralysis(2))

    effects.tick()
    expect(effects.isParalyzed).toBe(true)
    effects.tick()
    expect(effects.isParalyzed).toBe(false)
  })

  it('counts down only the petrification of a statue', () => {
    const effects = new ActiveEffects()
    effects.add(paralysis(1))
    effects.add(petrification(2))

    effects.tickPetrification()
    expect(effects.isPetrified).toBe(true)
    effects.tickPetrification()
    expect(effects.isPetrified).toBe(false)
    expect(effects.isParalyzed).toBe(true)
    effects.tick()
    expect(effects.isParalyzed).toBe(false)
  })

  it('keeps permanent effects', () => {
    const effects = new ActiveEffects()
    effects.add(paralysis(null))

    for (let i = 0; i < 10; i++) {
      effects.tick()
    }
    expect(effects.isParalyzed).toBe(true)
  })

  it('damage over time starts next round', () => {
    const effects = new ActiveEffects()
    effects.add(dot('fire', 'd4', 3, true))

    expect(effects.getDamageOverTime()).toEqual([])
    effects.tick()

    effects.endRound()
    expect(effects.getDamageOverTime()).toHaveLength(1)
    expect(effects.getDamageOverTime()[0].remaining).toBe(3)
    effects.tick()
    effects.tick()
    effects.tick()
    expect(effects.getDamageOverTime()).toEqual([])
  })
})
