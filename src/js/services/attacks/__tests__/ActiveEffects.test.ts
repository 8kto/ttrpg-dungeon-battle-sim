import type { ActiveEffect } from '../ActiveEffects'
import { ActiveEffects, effectKey } from '../ActiveEffects'

const dot = (label: string, damage: string, remaining: number | null, pending: boolean = false): ActiveEffect => ({
  damage,
  key: effectKey(label, { damage, duration: remaining === null ? null : String(remaining), kind: 'damage_each_round' }),
  kind: 'damage_each_round',
  label,
  pending,
  remaining,
})

const paralysis = (remaining: number | null): ActiveEffect => ({
  damage: null,
  key: effectKey('paralyze', { duration: remaining === null ? null : String(remaining), kind: 'paralyze' }),
  kind: 'paralyze',
  label: 'paralyze',
  pending: false,
  remaining,
})

describe('ActiveEffects', () => {
  describe('effectKey', () => {
    it('is the same for the same label and modifier', () => {
      // poison and poison(-2) both have the label "poison"
      expect(effectKey('poison', { damage: 'd4', duration: null, kind: 'damage_each_round' })).toBe(
        effectKey('poison', { damage: 'd4', duration: null, kind: 'damage_each_round' }),
      )
    })

    it('differs by label, damage or duration', () => {
      const key = effectKey('poison', { damage: 'd4', duration: null, kind: 'damage_each_round' })

      expect(effectKey('fire', { damage: 'd4', duration: null, kind: 'damage_each_round' })).not.toBe(key)
      expect(effectKey('poison', { damage: 'd6', duration: null, kind: 'damage_each_round' })).not.toBe(key)
      expect(effectKey('poison', { damage: 'd4', duration: '3', kind: 'damage_each_round' })).not.toBe(key)
    })
  })

  it('does not stack identical effects', () => {
    const effects = new ActiveEffects()
    const first = dot('poison', 'd4', 3)

    expect(effects.add(first)).toBe(true)
    effects.tick()
    expect(effects.add(dot('poison', 'd4', 3))).toBe(false)
    expect(effects.damageOverTime).toHaveLength(1)
    expect(effects.damageOverTime[0].remaining).toBe(2)
  })

  it('stacks different effects', () => {
    const effects = new ActiveEffects()
    effects.add(dot('poison', 'd4', null))
    effects.add(dot('fire', 'd4', null))

    expect(effects.damageOverTime.map((e) => e.label)).toEqual(['poison', 'fire'])
  })

  it('ticks finite effects and drops finished ones', () => {
    const effects = new ActiveEffects()
    effects.add(paralysis(2))

    effects.tick()
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

    expect(effects.damageOverTime).toEqual([])
    effects.tick()

    effects.endRound()
    expect(effects.damageOverTime).toHaveLength(1)
    expect(effects.damageOverTime[0].remaining).toBe(3)
    effects.tick()
    effects.tick()
    effects.tick()
    expect(effects.damageOverTime).toEqual([])
  })
})
