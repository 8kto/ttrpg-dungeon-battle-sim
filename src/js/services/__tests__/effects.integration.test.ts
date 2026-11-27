import * as dice from 'ttrpg-lib-dice'
import { Dice } from 'ttrpg-lib-dice'

import { Side } from '../../types'
import { DamageParser } from '../attacks/DamageParser'
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
import { Initiative, Rounding, Strategy, Targeting } from '../types'

const damageParser = new DamageParser()

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

    return {
      attacker,
      hit: (attack: string): void => attacker.performOneAttack(target, damageParser.parseAttack(attack)),
      target,
    }
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
    hit('d6[paralyze,paralyzed(2)]')

    expect(target.startTurn()).toBe(false)
    expect(nextRound(target)).toBe(false)
    expect(nextRound(target)).toBe(true)
  })

  it('paralysis is immediate', () => {
    const { hit, target } = setup()
    hit('d6<🧊>[paralyzed(1)]')

    expect(target.isParalyzed).toBe(true)
    expect(target.startTurn()).toBe(false)
    expect(nextRound(target)).toBe(true)
  })

  it('paralyzed target is hit automatically for max weapon damage', () => {
    const { attacker, hit, target } = setup({}, new RandomStrategy())
    hit('0<🧊>[paralyzed]')
    const hp = target.currentHp
    ;(attacker.rollToHit as jest.Mock).mockReturnValue(-100) // would miss

    hit('d6+1')
    expect(hp - target.currentHp).toBe(7)
  })

  it('paralyzed target fails saves', () => {
    const { hit, target } = setup({ poison: 0 })
    hit('0<🧊>[paralyzed]')
    saveRoll.mockClear()

    hit('d6[poison,save_or_die]')
    expect(target.currentHp).toBeLessThanOrEqual(0)
    expect(saveRoll).not.toHaveBeenCalled()
    expect(logger.drain()).toContain('🧪 Fighter is paralyzed, fails save vs Poison')
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
    expect(lines).toContain('🧪 Fighter saves vs Poison (17 ≥ 12)')
    expect(lines).toContain('🧪 Fighter fails save vs Poison(-2) (13-2=11 < 12)')
    expect(lines).toContain('🧪 Fighter saves vs Poison(+2) (10+2=12 ≥ 12)')
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
    hit('d6<fire>[damage_each_round(2,3)]')
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

    hit('d6<fire>[damage_each_round(2)]')
    hp = target.currentHp
    nextRound(target)
    expect(hp - target.currentHp).toBe(5)
    expect(logger.drain()).toContain('🔥 Fighter takes 2 damage (fire damage_each_round)')
  })

  // an unnamed effect without a save is named by its modifier, whatever spacing it is written with
  it('names an unnamed effect without a save by its modifier and does not stack it', () => {
    const { hit, target } = setup()
    hit('d10[damage_each_round(d4, 3)]')
    hit('d6[damage_each_round( d4 ,3 )]')
    const hp = target.currentHp

    nextRound(target)
    expect(hp - target.currentHp).toBe(4)
    const lines = logger.drain()
    expect(lines).toContain('🗡️ Ghoul attacks Fighter with damage_each_round(d4, 3) (d10), damage: 10')
    expect(lines).toContain('🔥 Fighter affected by damage_each_round for 3 turns')
    expect(lines).toContain('🔥 Fighter takes 4 damage (damage_each_round)')
  })

  it('does not act when killed by damage over time', () => {
    const { hit, target } = setup()
    hit('d6<fire>[damage_each_round(3)]')
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
    hit('d6<🧊>[paralyzed(0)]')

    expect(target.isParalyzed).toBe(false)
    expect(target.startTurn()).toBe(true)
  })

  it('counts every effect apart', () => {
    const { hit } = setup()
    saveRoll.mockReturnValueOnce(1).mockReturnValueOnce(1).mockReturnValueOnce(20)

    hit('d6[poison(-2),damage_each_round(1)]')
    hit('d4[Poison(-2), damage_each_round(1)]')
    hit('d6[poison(-2),damage_each_round(1)]')
    hit('d6<knife>')

    expect(counters).toEqual({ 'Poison(-2), damage_each_round(1)': { applied: 2, hasSave: true, saved: 1 } })
  })

  // the effects of attacks with the same name are counted apart, each with its own save
  it('counts effects by attack name and effect', () => {
    const { hit } = setup()
    saveRoll.mockReturnValueOnce(1)

    hit('d6<Bite>[poison,damage_each_round(1)]')
    hit('d6<Bite>[damage_each_round(2)]')
    hit('d6[damage_each_round(1, 2)]')

    expect(counters).toEqual({
      'Bite (Poison, damage_each_round(1))': { applied: 1, hasSave: true, saved: 0 },
      'Bite (damage_each_round(2))': { applied: 1, hasSave: false, saved: 0 },
      'damage_each_round(1, 2)': { applied: 1, hasSave: false, saved: 0 },
    })
  })

  describe('petrification', () => {
    it('takes the target out of the battle on a failed save', () => {
      const { hit, target } = setup()
      saveRoll.mockReturnValueOnce(20).mockReturnValueOnce(1)

      hit('d4<Gaze>[paralyze, petrified]')
      expect(target.isPetrified).toBe(false)
      hit('d4<Gaze>[paralyze, petrified]')
      expect(target.isPetrified).toBe(true)
      expect(target.isActive).toBe(false)
      expect(target.isValidTarget()).toBe(false)
      expect(target.currentHp).toBeGreaterThan(0)
      expect(logger.drain()).toContain('🗿 Fighter turned to stone until the end of battle')
    })

    it('comes back to life only after a petrification for a while', () => {
      const { hit, target } = setup()
      expect(target.willRevive).toBe(false)

      hit('d4[petrified(2)]')
      expect(target.willRevive).toBe(true)

      const statue = setup()
      statue.hit('d4[petrified]')
      expect(statue.target.willRevive).toBe(false)

      target.currentHp = 0
      expect(target.willRevive).toBe(false)
    })

    it('applies without a save', () => {
      const { hit, target } = setup()
      saveRoll.mockClear()

      hit('d4[petrified]')
      expect(target.isPetrified).toBe(true)
      expect(saveRoll).not.toHaveBeenCalled()
    })

    it('lasts the given number of own turns, without damage over time', () => {
      const { hit, target } = setup()
      hit('d4<fire>[damage_each_round(5)]')
      hit('d4<Gaze>[petrified(2)]')
      const hp = target.currentHp

      expect(nextRound(target)).toBe(false)
      expect(nextRound(target)).toBe(false)
      expect(target.isPetrified).toBe(false)
      expect(target.currentHp).toBe(hp)
      expect(logger.drain()).toContain('🗿 Fighter is no longer petrified')
      expect(nextRound(target)).toBe(true)
      expect(target.currentHp).toBe(hp - 5)
    })

    // the order of the modifiers doesn't matter: a failed save never takes less damage than a successful one
    it.each(['d4[Paralyze, petrified(2), save_for_half(10)]', 'd4[Paralyze, save_for_half(10), petrified(2)]'])(
      'applies the other modifiers of "%s" before the petrification',
      (attack) => {
        const { hit, target } = setup()
        const hp = target.currentHp

        hit(attack)
        expect(target.isPetrified).toBe(true)
        expect(hp - target.currentHp).toBe(4 + 10)

        saveRoll.mockReturnValue(20)
        const saved = setup()
        const savedHp = saved.target.currentHp
        saved.hit(attack)
        expect(saved.target.isPetrified).toBe(false)
        expect(savedHp - saved.target.currentHp).toBe(4 + 5)
      },
    )

    it('does not petrify a target killed by the other modifiers', () => {
      const { hit, target } = setup()

      hit('d4[Paralyze, petrified, save_or_die]')
      expect(target.currentHp).toBeLessThanOrEqual(0)
      expect(target.isPetrified).toBe(false)
    })

    it('keeps the other effects of a statue waiting until the petrification ends', () => {
      const { hit, target } = setup()
      hit('d4<fire>[damage_each_round(3, 1)]')
      hit('d4[paralyzed(1)]')
      hit('d4<Gaze>[petrified(2)]')
      const hp = target.currentHp

      expect(nextRound(target)).toBe(false)
      expect(nextRound(target)).toBe(false)
      expect(target.currentHp).toBe(hp)
      // the damage over time and the paralysis get their turn after the petrification
      expect(nextRound(target)).toBe(false)
      expect(target.currentHp).toBe(hp - 3)
      expect(nextRound(target)).toBe(true)
      expect(target.currentHp).toBe(hp - 3)
    })

    const makeSim = (players: ICharacter[], monsters: ICharacter[]): BattleSimulator =>
      new BattleSimulator(players, monsters, logger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Fixed,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Max,
        targeting: Targeting.Random,
      })

    // puts an effect on a participant of the battle before it starts
    const afflict = (sim: BattleSimulator, name: string, attack: string): void => {
      const target = sim.participants.find((p) => p.char.name === name) as Participant
      const caster = make(makeChar('Witch'), Side.Monsters)
      jest.spyOn(caster, 'rollToHit').mockReturnValue(100)
      caster.performOneAttack(target, damageParser.parseAttack(attack))
      target.endRound()
    }

    // the last fighters of both sides die from damage over time in the first round
    const doomed = (players: string[], monsters: string[]): BattleSimulator => {
      const sim = makeSim(
        players.map((n) => makeChar(n)),
        monsters.map((n) => makeChar(n)),
      )
      afflict(sim, players[0], '0<fire>[damage_each_round(200)]')
      afflict(sim, monsters[0], '0<fire>[damage_each_round(200)]')

      return sim
    }

    it('goes on while nobody can fight, until a statue comes back to life and wins', () => {
      const sim = doomed(['Fighter'], ['Ogre', 'Gorgon'])
      afflict(sim, 'Gorgon', '0[petrified(2)]')

      const result = sim.simulate()
      expect(result.winner).toBe(Side.Monsters)
      expect(result.rounds).toBe(2)
      expect(result.survivors.map((p) => p.char.name)).toEqual(['Gorgon'])
    })

    it('gives the win to the side whose statue comes back to life first', () => {
      const sim = doomed(['Fighter', 'Knight'], ['Ogre', 'Gorgon'])
      afflict(sim, 'Knight', '0[petrified(2)]')
      afflict(sim, 'Gorgon', '0[petrified(3)]')

      const result = sim.simulate()
      expect(result.winner).toBe(Side.Players)
      expect(result.rounds).toBe(2)
      expect(result.survivors.map((p) => p.char.name)).toEqual(['Knight'])
    })

    it('goes on with the battle when both sides come back to life in the same round', () => {
      const sim = doomed(['Fighter', 'Knight'], ['Ogre', 'Gorgon'])
      afflict(sim, 'Knight', '0[petrified(2)]')
      afflict(sim, 'Gorgon', '0[petrified(2)]')

      const result = sim.simulate()
      expect(result.rounds).toBeGreaterThan(2)
      expect(result.survivors).toHaveLength(result.winner === null ? 2 : 1)
    })

    it('ends in a draw when nobody can fight and no statue will come back to life', () => {
      const sim = doomed(['Fighter'], ['Ogre', 'Gorgon'])
      afflict(sim, 'Gorgon', '0[petrified]')

      const result = sim.simulate()
      expect(result.winner).toBeNull()
      expect(result.rounds).toBe(1)
      expect(result.survivors).toEqual([])
      expect(logger.drain()).toContain('⏸️ No one is left to fight — draw')
    })

    it('loses the battle for a side of statues, even petrified for a while', () => {
      jest.restoreAllMocks()
      const gorgon: ICharacter = { ...makeChar('Gorgon'), damage: '0<Gaze>[petrified(1000)]', toHit: 100 }
      const sim = makeSim([makeChar('Fighter')], [gorgon])
      jest.spyOn(sim, 'getSortedByInitiative').mockImplementation(function (this: BattleSimulator) {
        const players = this.participants.filter((p) => p.side === Side.Players)
        const monsters = this.participants.filter((p) => p.side === Side.Monsters)

        return [monsters, players]
      })

      const result = sim.simulate()
      expect(result.winner).toBe(Side.Monsters)
      expect(result.rounds).toBe(1)
      expect(result.survivors.map((p) => p.char.name)).toEqual(['Gorgon'])
    })
  })

  describe('area attacks', () => {
    // the strategy is the attacker's, the targets have 100 HP
    const setupArea = (
      count: number,
      strategy: ICombatStrategy = new MaxStrategy(),
    ): { attacker: Participant; targets: Participant[]; attack: (damage: string) => void } => {
      const attacker = make(makeChar('Dragon'), Side.Monsters, strategy)
      const targets = Array.from({ length: count }, (_, i) => make(makeChar(`Fighter ${i + 1}`), Side.Players))
      const rollToHit = jest.spyOn(attacker, 'rollToHit')

      return {
        attack: (damage: string): void => {
          const attack = damageParser.parseAttack(damage)
          attacker.performAreaAttack(targets[0], targets, attack)
          expect(rollToHit).not.toHaveBeenCalled()
        },
        attacker,
        targets,
      }
    }

    it('hits up to 3 targets by default, without a roll to hit', () => {
      const { attacker, targets } = setupArea(5)
      const rollToHit = jest.spyOn(attacker, 'rollToHit')
      const selector = { selectTarget: (_: Participant, enemies: Participant[]): Participant => enemies[0] }

      attacker.performAreaAttack(targets[0], targets, damageParser.parseAttack('d6[breath, targets]'))
      expect(rollToHit).not.toHaveBeenCalled()
      expect(targets.filter((t) => t.currentHp < 100)).toHaveLength(3)
      expect(targets[0].currentHp).toBe(94)

      targets.forEach((t) => (t.currentHp = 100))
      const dragon = make({ ...makeChar('Dragon'), damage: 'd6[breath, targets]' }, Side.Monsters)
      dragon.attack(targets, selector)
      expect(targets.filter((t) => t.currentHp < 100)).toHaveLength(3)
    })

    it('hits the count of targets given, at most all of them', () => {
      const { attacker, targets } = setupArea(5)
      const selector = { selectTarget: (_: Participant, enemies: Participant[]): Participant => enemies[0] }
      const make4 = make({ ...makeChar('Bomber'), damage: 'd6[breath, targets(4)]' }, Side.Monsters)

      make4.attack(targets, selector)
      expect(targets.filter((t) => t.currentHp < 100)).toHaveLength(4)

      attacker.performAreaAttack(targets[0], targets.slice(0, 2), damageParser.parseAttack('d6[breath, targets]'))
      expect(targets[0].currentHp).toBe(88)
      expect(targets[1].currentHp).toBeLessThan(100)
    })

    it('rolls a save for every target: a failure takes it all, a success avoids the damage', () => {
      const { attack, targets } = setupArea(3)
      saveRoll.mockReturnValueOnce(1).mockReturnValueOnce(20).mockReturnValueOnce(1)

      attack('d6<Breath>[breath, d8, targets]')
      expect(targets.map((t) => 100 - t.currentHp).sort()).toEqual([0, 14, 14])
      expect(counters).toEqual({ 'Breath (Breath, d8, targets)': { applied: 2, hasSave: true, saved: 1 } })
    })

    it('halves save_for_half on a successful save, without the damage of the attack', () => {
      const { attack, targets } = setupArea(2)
      saveRoll.mockReturnValueOnce(20).mockReturnValueOnce(1)

      attack('d6<Breath>[breath, save_for_half(2d6), targets]')
      expect(targets.map((t) => 100 - t.currentHp).sort((a, b) => a - b)).toEqual([6, 18])
    })

    it('throws a bomb: no damage but from the effect', () => {
      const { attack, targets } = setupArea(4)
      saveRoll.mockReturnValueOnce(20).mockReturnValueOnce(1).mockReturnValueOnce(20).mockReturnValueOnce(1)

      attack('0<Bomb>[Paralyze, save_for_half(d4), targets(4)]')
      expect(targets.map((t) => 100 - t.currentHp).sort((a, b) => a - b)).toEqual([2, 2, 4, 4])
    })

    it('rolls the damage for every target apart', () => {
      const strategy = new RandomStrategy()
      const calculate = jest.spyOn(strategy, 'calculateDamage')
      const { attack } = setupArea(3, strategy)

      attack('d6[breath, targets]')
      expect(calculate.mock.calls.filter(([formula]) => formula === 'd6')).toHaveLength(3)
    })

    it('a paralyzed target fails the save and takes max damage', () => {
      const strategy = new RandomStrategy()
      const { attack, targets } = setupArea(1, strategy)
      const paralyzer = make(makeChar('Ghoul'), Side.Monsters)
      jest.spyOn(paralyzer, 'rollToHit').mockReturnValue(100)
      paralyzer.performOneAttack(targets[0], damageParser.parseAttack('0[paralyzed]'))
      saveRoll.mockClear()

      attack('d6+1[breath, targets]')
      expect(100 - targets[0].currentHp).toBe(7)
      expect(saveRoll).not.toHaveBeenCalled()
    })

    it('uses an attack slot of every target', () => {
      const attacker = make({ ...makeChar('Dragon'), damage: 'd6[breath, targets]' }, Side.Monsters)
      const targets = [1, 2, 3].map(
        (i) => new Participant(makeChar(`F${i}`), Side.Players, new MaxStrategy(), 0, 1, logger, counters),
      )
      const selector = { selectTarget: (_: Participant, enemies: Participant[]): Participant => enemies[0] }

      attacker.attack(targets, selector)
      expect(targets.every((t) => !t.isValidTarget())).toBe(true)
    })

    it('logs the targets of the attack', () => {
      const { attack } = setupArea(2)

      attack('d6<Breath>[breath, targets]')
      expect(logger.drain()[0]).toMatch(/^💥 Dragon attacks Fighter 1, Fighter 2 with Breath \(d6\)$/)
    })
  })

  it('ends in a draw when paralyzed targets take no damage', () => {
    jest.restoreAllMocks()
    const paralyzer: ICharacter = { ...makeChar('Statue'), armorClass: 0, damage: '0<🧊>[paralyzed]', toHit: 100 }
    const sim = new BattleSimulator([paralyzer], [{ ...paralyzer, name: 'Gargoyle' }], new NullLogger(), {
      biasMonsters: 0,
      biasPlayers: 0,
      initiative: Initiative.Random,
      maxAttacksPerTarget: 0,
      rounding: Rounding.Up,
      strategy: Strategy.Max,
      targeting: Targeting.Random,
    })

    const result = sim.simulate()
    expect(result.winner).toBeNull()
    expect(result.rounds).toBe(MAX_ROUNDS)
    expect(result.effects['🧊 (paralyzed)'].applied).toBeGreaterThan(0)
  })
})
