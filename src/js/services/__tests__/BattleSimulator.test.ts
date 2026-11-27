import { Dice } from 'ttrpg-lib-dice'

import { Side } from '../../types'
import { AttackOptionsCache } from '../attacks/AttackOptionsCache'
import { DamageFormula } from '../attacks/DamageFormula'
import { DamageSerializer } from '../attacks/DamageSerializer'
import { DEFAULT_SAVES } from '../attacks/types'
import { BattleSimulator, MAX_ROUNDS } from '../BattleSimulator'
import type { ILogger } from '../logger/ILogger'
import { Participant } from '../Participant'
import { getStrategy } from '../strategies/getStrategy'
import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import type { ICharacter, IMonster, IPlayerCharacter } from '../types'
import { Initiative, Rounding, Strategy, Targeting } from '../types'

jest.mock('../Participant')
jest.mock('../strategies/getStrategy')
jest.mock('../TargetSelector')

const mockLogger = {
  error: jest.fn(),
  isVerbose: jest.fn().mockReturnValue(true),
  log: jest.fn(),
} as object as ILogger

const mockStrategy = {
  calculateDamage: jest.fn().mockReturnValue(5),
  calculateHp: jest.fn().mockReturnValue(6),
}

const mockPlayer: IPlayerCharacter = {
  armorClass: 16,
  damage: '1d8',
  hitDice: [1, Dice.d10],
  name: 'Warrior',
  saves: DEFAULT_SAVES,
  toHit: 4,
}

const mockMonster: IMonster = {
  armorClass: 13,
  damage: '1d4',
  hitDice: [1, Dice.d6],
  name: 'Goblin',
  saves: DEFAULT_SAVES,
  toHit: 2,
}

describe('BattleSimulator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Participant as unknown as jest.Mock).mockImplementation(
      (
        char: ICharacter,
        side: Side,
        strategy: ICombatStrategy,
        bias: number,
        maxAttacksPerTarget: number,
        logger: ILogger,
      ) => ({
        attack: jest.fn(),
        attacksRemaining: maxAttacksPerTarget,
        char,
        currentHp: strategy.calculateHp(char.hitDice),
        endRound: jest.fn(),
        hasAttackLimit: maxAttacksPerTarget > 0,
        get isActive(): boolean {
          return this.currentHp > 0 && !this.isPetrified
        },
        isPetrified: false,
        isValidTarget: jest.fn().mockReturnValue(true),
        logger,
        resetAttackLimit: jest.fn(),
        side,
        startTurn: jest.fn().mockReturnValue(true),
        strategy,
        willRevive: false,
      }),
    )
    ;(getStrategy as jest.Mock).mockReturnValue(mockStrategy)
  })

  describe('constructor', () => {
    it('creates participants for both sides', () => {
      new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Down,
        strategy: Strategy.Average,
        targeting: Targeting.Random,
      })

      expect(getStrategy).toHaveBeenCalledWith(Strategy.Average, Rounding.Down)
      const services = [expect.any(AttackOptionsCache), expect.any(DamageFormula), expect.any(DamageSerializer)]
      expect(Participant).toHaveBeenCalledWith(
        mockPlayer,
        Side.Players,
        mockStrategy,
        0,
        0,
        mockLogger,
        {},
        ...services,
      )
      expect(Participant).toHaveBeenCalledWith(
        mockMonster,
        Side.Monsters,
        mockStrategy,
        0,
        0,
        mockLogger,
        {},
        ...services,
      )
      // both sides share the parsed damage and the services
      const [player, monster] = (Participant as jest.MockedClass<typeof Participant>).mock.calls
      expect(player.slice(7)).toHaveLength(3)
      player.slice(7).forEach((service, i) => expect(service).toBe(monster[7 + i]))
    })
  })

  describe('hasSurvivors', () => {
    it('returns true when side has living participants', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })

      expect(simulator.hasSurvivors(Side.Players)).toBe(true)
      expect(simulator.hasSurvivors(Side.Monsters)).toBe(true)
    })

    it('returns false when side has no living participants [A]', () => {
      const simulator = new BattleSimulator([mockPlayer], [], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })

      expect(simulator.hasSurvivors(Side.Monsters)).toBe(false)
    })

    it('returns false when side has no living participants [B]', () => {
      mockStrategy.calculateDamage.mockReturnValue(1)
      mockStrategy.calculateHp.mockReturnValueOnce(6).mockReturnValueOnce(0)

      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })
      expect(simulator.hasSurvivors(Side.Monsters)).toBe(false)
    })
  })

  describe('simulate', () => {
    // participants as created by the mocked Participant constructor
    const created = (): Array<{ attack: jest.Mock; endRound: jest.Mock; startTurn: jest.Mock }> =>
      (Participant as unknown as jest.Mock).mock.results.map((r) => r.value)

    const simulateRounds = (simulator: BattleSimulator, rounds: number): ReturnType<BattleSimulator['simulate']> => {
      const spy = jest.spyOn(simulator, 'hasSurvivors')
      for (let i = 0; i < rounds; i++) {
        spy.mockReturnValueOnce(true).mockReturnValueOnce(true)
      }
      // then the players win
      spy.mockImplementation((side) => side === Side.Players)

      return simulator.simulate()
    }

    it('ends every round for all participants', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })
      simulateRounds(simulator, 2)

      created().forEach((p) => expect(p.endRound).toHaveBeenCalledTimes(2))
    })

    it('skips combatants that cannot act', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })
      const [player, monster] = created()
      player.startTurn.mockReturnValue(false)
      simulateRounds(simulator, 1)

      expect(player.attack).not.toHaveBeenCalled()
      expect(monster.attack).toHaveBeenCalledTimes(1)
    })

    it('returns effect counters shared by all participants', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })
      const [[, , , , , , playerCounters], [, , , , , , monsterCounters]] = (Participant as unknown as jest.Mock).mock
        .calls
      const result = simulateRounds(simulator, 1)

      expect(playerCounters).toBe(monsterCounters)
      expect(result.effects).toBe(playerCounters)
    })

    it('ends when one side is defeated', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })

      // Force end condition
      jest
        .spyOn(simulator, 'hasSurvivors')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)

      const result = simulator.simulate()

      expect(result).toEqual(
        expect.objectContaining({
          rounds: 1,
          survivors: expect.arrayContaining([
            expect.objectContaining({
              currentHp: expect.any(Number),
              side: Side.Players,
            }),
          ]),
          winner: Side.Players,
        }),
      )
    })

    it('ends in a draw when the round limit is reached', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })

      // nobody ever dies
      jest.spyOn(simulator, 'hasSurvivors').mockReturnValue(true)

      const result = simulator.simulate()
      expect(result.rounds).toBe(MAX_ROUNDS)
      expect(result.winner).toBeNull()
      expect(mockLogger.log).toHaveBeenCalledWith(`⏸️ Round limit (${MAX_ROUNDS}) reached — draw`)
    })

    it('goes on while nobody can fight, until a statue comes back to life', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })
      const [, monster] = created() as unknown as Array<{ willRevive: boolean }>
      monster.willRevive = true
      jest
        .spyOn(simulator, 'hasSurvivors')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockImplementation((side) => side === Side.Monsters)

      const result = simulator.simulate()
      expect(result.rounds).toBe(2)
      expect(result.winner).toBe(Side.Monsters)
    })

    it('ends in a draw when nobody can fight anymore', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })
      jest.spyOn(simulator, 'hasSurvivors').mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValue(false)

      const result = simulator.simulate()
      expect(result.rounds).toBe(1)
      expect(result.winner).toBeNull()
      expect(mockLogger.log).toHaveBeenCalledWith('⏸️ No one is left to fight — draw')
    })

    it('resets attack limits each round', () => {
      mockStrategy.calculateDamage.mockReturnValue(3)
      mockStrategy.calculateHp.mockReturnValueOnce(5).mockReturnValueOnce(6)
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 3,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })

      jest
        .spyOn(simulator, 'hasSurvivors')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockImplementation((side) => side === Side.Players)

      const result = simulator.simulate()
      expect(result.rounds).toBe(2)

      // @ts-ignore private
      simulator.participants.forEach((p) => {
        expect(p.resetAttackLimit).toHaveBeenCalled()
      })
    })
  })

  describe('getSortedByInitiative', () => {
    const settings = {
      biasMonsters: 0,
      biasPlayers: 0,
      maxAttacksPerTarget: 0,
      rounding: Rounding.Up,
      strategy: Strategy.Random,
      targeting: Targeting.Random,
    }
    // which side acts first in each of the rounds
    const firstSides = (simulator: BattleSimulator, rounds: number): Side[] =>
      Array.from({ length: rounds }, () => simulator.getSortedByInitiative()[0][0].side)

    it('rolls initiative every round when Random', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        ...settings,
        initiative: Initiative.Random,
      })

      expect(new Set(firstSides(simulator, 100))).toEqual(new Set([Side.Players, Side.Monsters]))
    })

    it('keeps the order of the first round when Fixed', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        ...settings,
        initiative: Initiative.Fixed,
      })

      expect(new Set(firstSides(simulator, 100)).size).toBe(1)
    })
  })

  describe('initiative log', () => {
    const settings = {
      biasMonsters: 0,
      biasPlayers: 0,
      maxAttacksPerTarget: 0,
      rounding: Rounding.Up,
      strategy: Strategy.Random,
      targeting: Targeting.Random,
    }
    const logged = (): string[] => (mockLogger.log as jest.Mock).mock.calls.map(([msg]) => msg)
    const runRounds = (simulator: BattleSimulator, rounds: number): void => {
      const spy = jest.spyOn(simulator, 'hasSurvivors')
      for (let i = 0; i < rounds; i++) {
        spy.mockReturnValueOnce(true).mockReturnValueOnce(true)
      }
      // then the players win
      spy.mockImplementation((side) => side === Side.Players)
      simulator.simulate()
    }

    it('logs the initiative winner every round when Random', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        ...settings,
        initiative: Initiative.Random,
      })
      runRounds(simulator, 2)

      expect(logged()).toEqual([
        expect.stringMatching(/^>>> round 1, (players|monsters) won initiative$/),
        expect.stringMatching(/^>>> round 2, (players|monsters) won initiative$/),
      ])
    })

    it('logs the initiative winner once before the battle when Fixed', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        ...settings,
        initiative: Initiative.Fixed,
      })
      runRounds(simulator, 2)

      expect(logged()).toEqual([
        expect.stringMatching(/^>>> (players|monsters) won initiative for the battle$/),
        '>>> round 1',
        '>>> round 2',
      ])
    })
  })

  describe('renderDetails', () => {
    it('logs participant statuses', () => {
      mockStrategy.calculateHp.mockReturnValueOnce(3).mockReturnValueOnce(4)
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })

      simulator.renderDetails()
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('🥷Warrior HP: 3'))
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('🧌Goblin HP: 4'))
    })

    it('logs nothing when logger is not verbose', () => {
      ;(mockLogger.isVerbose as jest.Mock).mockReturnValueOnce(false)
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], mockLogger, {
        biasMonsters: 0,
        biasPlayers: 0,
        initiative: Initiative.Random,
        maxAttacksPerTarget: 0,
        rounding: Rounding.Up,
        strategy: Strategy.Random,
        targeting: Targeting.Random,
      })

      simulator.renderDetails()
      expect(mockLogger.log).not.toHaveBeenCalled()
    })
  })
})
