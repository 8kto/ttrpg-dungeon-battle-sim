import * as dice from 'ttrpg-lib-dice'
import { Dice } from 'ttrpg-lib-dice'

import { Side } from '../../types'
import { parseAttack } from '../attacks/parseDamage'
import type { EffectCounters, Saves } from '../attacks/types'
import { DEFAULT_SAVES } from '../attacks/types'
import { BattleSimulator, MAX_ROUNDS } from '../BattleSimulator'
import { BufferLogger } from '../logger/BufferLogger'
import { NullLogger } from '../logger/NullLogger'
import { Participant } from '../Participant'
import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import { MaxStrategy } from '../strategies/MaxStrategy'
import { RandomStrategy } from '../strategies/RandomStrategy'
import type { ICharacter } from '../types'
import { Rounding, Strategy } from '../types'

// 10d10 under the Max strategy: 100 HP, enough to survive any test attack
const makeChar = (name: string, saves: Partial<Saves> = {}): ICharacter => ({
  armorClass: 10,
  damage: 'd6',
  hitDice: [10, Dice.d10],
  name,
  saves: { ...DEFAULT_SAVES, ...saves },
  toHit: 0,
})

describe('effects in battle', () => {
  let logger: BufferLogger
  let counters: EffectCounters
  let saveRoll: jest.SpyInstance

  const make = (char: ICharacter, side: Side, strategy: ICombatStrategy = new MaxStrategy()): Participant =>
    new Participant(char, side, strategy, 0, 0, logger, counters)

  const setup = (
    targetSaves: Partial<Saves> = {},
    strategy: ICombatStrategy = new MaxStrategy(),
  ): { attacker: Participant; target: Participant; hit: (attack: string) => void } => {
    const attacker = make(makeChar('Ghoul'), Side.Monsters, strategy)
    const target = make(makeChar('Fighter', targetSaves), Side.Players, strategy)
    jest.spyOn(attacker, 'rollToHit').mockReturnValue(100)

    return { attacker, hit: (attack: string): void => attacker.performOneAttack(target, parseAttack(attack)), target }
  }

  // the turn of a participant at the start of a new round
  const nextRound = (participant: Participant): boolean => {
    participant.endRound()

    return participant.startTurn()
  }

  beforeEach(() => {
    logger = new BufferLogger()
    counters = {}
    saveRoll = jest.spyOn(dice, 'roll').mockReturnValue(1) // saves fail unless a test says otherwise
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('paralyzed participant skips its turn and recovers', () => {
    const { hit, target } = setup()
    hit('d6[paralyze,paralyze(2)]')

    expect(target.startTurn()).toBe(false)
    expect(nextRound(target)).toBe(false)
    expect(nextRound(target)).toBe(true)
  })

  it('paralysis is immediate', () => {
    const { hit, target } = setup()
    hit('d6[🧊,paralyze(1)]')

    expect(target.isParalyzed).toBe(true)
    expect(target.startTurn()).toBe(false)
    expect(nextRound(target)).toBe(true)
  })

  it('paralyzed target is hit automatically for max weapon damage', () => {
    const { attacker, hit, target } = setup({}, new RandomStrategy())
    hit('0[🧊,paralyze]')
    const hp = target.currentHp
    ;(attacker.rollToHit as jest.Mock).mockReturnValue(-100) // would miss

    hit('d6+1')
    expect(hp - target.currentHp).toBe(7)
  })

  it('paralyzed target fails saves', () => {
    const { hit, target } = setup({ poison: 0 })
    hit('0[🧊,paralyze]')
    saveRoll.mockClear()

    hit('d6[poison,save_or_die]')
    expect(target.currentHp).toBeLessThanOrEqual(0)
    expect(saveRoll).not.toHaveBeenCalled()
    expect(logger.drain()).toContain('🧪 Fighter is paralyzed, fails save vs poison')
  })

  it.each<[string, number, number]>([
    // [attack, save roll, damage taken]: d6 = 6, d8 = 8 under Max; Poison 12
    ['d6[poison,d8]', 13, 6],
    ['d6[poison(-2),d8]', 13, 14],
    ['d6[poison(+2),d8]', 10, 6],
    ['d6[poison(+2),d8]', 9, 14],
  ])('save bonus changes the outcome: %s with roll %d', (attack, roll, damage) => {
    const { hit, target } = setup()
    saveRoll.mockReturnValue(roll)

    hit(attack)
    expect(100 - target.currentHp).toBe(damage)
  })

  it('logs save rolls', () => {
    const { hit } = setup()
    saveRoll.mockReturnValueOnce(17).mockReturnValueOnce(13).mockReturnValueOnce(10)

    hit('d6[poison,d4]')
    hit('d6[poison(-2),d4]')
    hit('d6[poison(+2),d4]')

    const lines = logger.drain()
    expect(lines).toContain('🧪 Fighter saves vs poison (17 ≥ 12)')
    expect(lines).toContain('🧪 Fighter fails save vs poison(-2) (13-2=11 < 12)')
    expect(lines).toContain('🧪 Fighter saves vs poison(+2) (10+2=12 ≥ 12)')
  })

  it('save_for_half halves on success, rounding down', () => {
    const { hit, target } = setup()
    saveRoll.mockReturnValue(20)

    hit('d6[breath,save_for_half(5)]')
    expect(100 - target.currentHp).toBe(6 + 2)
  })

  it('save_for_half deals full damage on failure', () => {
    const { hit, target } = setup()

    hit('d6[breath,save_for_half(5)]')
    expect(100 - target.currentHp).toBe(6 + 5)
  })

  it('save_or_die kills on failure only', () => {
    const { hit, target } = setup()
    saveRoll.mockReturnValueOnce(20).mockReturnValueOnce(1)

    hit('d6[magic,save_or_die]')
    expect(target.currentHp).toBe(94)
    hit('d6[magic,save_or_die]')
    expect(target.currentHp).toBeLessThanOrEqual(0)
    expect(logger.drain()).toContain('💀 Fighter dies (save_or_die)')
  })

  it('extra damage only on a failed save', () => {
    const { hit, target } = setup()
    saveRoll.mockReturnValueOnce(1).mockReturnValueOnce(20)

    hit('d6[magic,d8]')
    expect(100 - target.currentHp).toBe(14)
    hit('d6[magic,d8]')
    expect(100 - target.currentHp).toBe(20)
  })

  it('damage over time starts next round', () => {
    const { hit, target } = setup()
    hit('d6[fire,damage_each_round(2,3)]')
    const hp = target.currentHp

    expect(target.startTurn()).toBe(true)
    expect(target.currentHp).toBe(hp)
    nextRound(target)
    nextRound(target)
    nextRound(target)
    expect(target.currentHp).toBe(hp - 6)
    nextRound(target)
    expect(target.currentHp).toBe(hp - 6)
  })

  it('damage over time hits at turn start and does not stack', () => {
    const { hit, target } = setup()
    hit('d6[poison,damage_each_round(3)]')
    hit('d6[poison,damage_each_round(3)]')

    let hp = target.currentHp
    nextRound(target)
    expect(hp - target.currentHp).toBe(3)

    hit('d6[fire,damage_each_round(2)]')
    hp = target.currentHp
    nextRound(target)
    expect(hp - target.currentHp).toBe(5)
    expect(logger.drain()).toContain('🔥 Fighter takes 2 damage (fire damage_each_round)')
  })

  it('does not act when killed by damage over time', () => {
    const { hit, target } = setup()
    hit('d6[fire,damage_each_round(3)]')
    target.currentHp = 2

    expect(nextRound(target)).toBe(false)
    expect(target.currentHp).toBeLessThanOrEqual(0)
  })

  it('applies no effects to a target killed by the weapon', () => {
    const { hit, target } = setup({ poison: 0 })
    target.currentHp = 3
    saveRoll.mockClear()

    hit('d6[poison,save_or_die]')
    expect(saveRoll).not.toHaveBeenCalled()
    expect(counters).toEqual({})
  })

  it('duration of 0 adds no effect', () => {
    const { hit, target } = setup()
    hit('d6[🧊,paralyze(0)]')

    expect(target.isParalyzed).toBe(false)
    expect(target.startTurn()).toBe(true)
  })

  it('counts effects by label', () => {
    const { hit } = setup()
    saveRoll.mockReturnValueOnce(1).mockReturnValueOnce(1).mockReturnValueOnce(20)

    hit('d6[poison(-2),damage_each_round(1)]')
    hit('d6[poison(-2),damage_each_round(1)]')
    hit('d6[poison(-2),damage_each_round(1)]')
    hit('d6[knife]')

    expect(counters).toEqual({ poison: { applied: 2, hasSave: true, saved: 1 } })
  })

  it('ends in a draw when paralyzed targets take no damage', () => {
    jest.restoreAllMocks()
    const paralyzer: ICharacter = { ...makeChar('Statue'), armorClass: 0, damage: '0[🧊,paralyze]', toHit: 100 }
    const sim = new BattleSimulator(
      [paralyzer],
      [{ ...paralyzer, name: 'Gargoyle' }],
      Strategy.Max,
      Rounding.Up,
      0,
      0,
      0,
      new NullLogger(),
    )

    const result = sim.simulate()
    expect(result.winner).toBeNull()
    expect(result.rounds).toBe(MAX_ROUNDS)
    expect(result.effects['🧊'].applied).toBeGreaterThan(0)
  })
})
