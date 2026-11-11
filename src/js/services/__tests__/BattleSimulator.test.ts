import { Dice } from 'ttrpg-lib-dice'

import { Side } from '../../types'
import { DEFAULT_SAVES } from '../attacks/types'
import { BattleSimulator, MAX_ROUNDS } from '../BattleSimulator'
import type { ILogger } from '../logger/ILogger'
import { Participant } from '../Participant'
import { getStrategy } from '../strategies/getStrategy'
import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import type { ICharacter, IMonster, IPlayerCharacter } from '../types'
import { Rounding, Strategy } from '../types'

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
    ;(Participant as jest.Mock).mockImplementation(
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
        isValidTarget: jest.fn().mockReturnValue(true),
        logger,
        resetAttackLimit: jest.fn(),
        side,
        startTurn: jest.fn().mockReturnValue(true),
        strategy,
      }),
    )
    ;(getStrategy as jest.Mock).mockReturnValue(mockStrategy)
  })

  describe('constructor', () => {
    it('creates participants for both sides', () => {
      new BattleSimulator([mockPlayer], [mockMonster], Strategy.Average, Rounding.Down, 0, 0, 0, mockLogger)

      expect(getStrategy).toHaveBeenCalledWith(Strategy.Average, Rounding.Down)
      expect(Participant).toHaveBeenCalledWith(mockPlayer, Side.Players, mockStrategy, 0, 0, mockLogger, {})
      expect(Participant).toHaveBeenCalledWith(mockMonster, Side.Monsters, mockStrategy, 0, 0, mockLogger, {})
    })
  })

  describe('hasSurvivors', () => {
    it('returns true when side has living participants', () => {
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )

      expect(simulator.hasSurvivors(Side.Players)).toBe(true)
      expect(simulator.hasSurvivors(Side.Monsters)).toBe(true)
    })

    it('returns false when side has no living participants [A]', () => {
      const simulator = new BattleSimulator([mockPlayer], [], Strategy.Random, Rounding.Up, 0, 0, 0, mockLogger)

      expect(simulator.hasSurvivors(Side.Monsters)).toBe(false)
    })

    it('returns false when side has no living participants [B]', () => {
      mockStrategy.calculateDamage.mockReturnValue(1)
      mockStrategy.calculateHp.mockReturnValueOnce(6).mockReturnValueOnce(0)

      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )
      expect(simulator.hasSurvivors(Side.Monsters)).toBe(false)
    })
  })

  describe('simulate', () => {
    // participants as created by the mocked Participant constructor
    const created = (): Array<{ attack: jest.Mock; endRound: jest.Mock; startTurn: jest.Mock }> =>
      (Participant as jest.Mock).mock.results.map((r) => r.value)

    const simulateRounds = (simulator: BattleSimulator, rounds: number): ReturnType<BattleSimulator['simulate']> => {
      const spy = jest.spyOn(simulator, 'hasSurvivors')
      for (let i = 0; i < rounds; i++) {
        spy.mockReturnValueOnce(true).mockReturnValueOnce(true)
      }
      spy.mockReturnValue(false)

      return simulator.simulate()
    }

    it('ends every round for all participants', () => {
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )
      simulateRounds(simulator, 2)

      created().forEach((p) => expect(p.endRound).toHaveBeenCalledTimes(2))
    })

    it('skips combatants that cannot act', () => {
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )
      const [player, monster] = created()
      player.startTurn.mockReturnValue(false)
      simulateRounds(simulator, 1)

      expect(player.attack).not.toHaveBeenCalled()
      expect(monster.attack).toHaveBeenCalledTimes(1)
    })

    it('returns effect counters shared by all participants', () => {
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )
      const [[, , , , , , playerCounters], [, , , , , , monsterCounters]] = (Participant as jest.Mock).mock.calls
      const result = simulateRounds(simulator, 1)

      expect(playerCounters).toBe(monsterCounters)
      expect(result.effects).toBe(playerCounters)
    })

    it('ends when one side is defeated', () => {
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )

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
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )

      // nobody ever dies
      jest.spyOn(simulator, 'hasSurvivors').mockReturnValue(true)

      const result = simulator.simulate()
      expect(result.rounds).toBe(MAX_ROUNDS)
      expect(result.winner).toBeNull()
      expect(mockLogger.log).toHaveBeenCalledWith(`⏸️ Round limit (${MAX_ROUNDS}) reached — draw`)
    })

    it('resets attack limits each round', () => {
      mockStrategy.calculateDamage.mockReturnValue(3)
      mockStrategy.calculateHp.mockReturnValueOnce(5).mockReturnValueOnce(6)
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        3,
        mockLogger,
      )

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

  describe('renderDetails', () => {
    it('logs participant statuses', () => {
      mockStrategy.calculateHp.mockReturnValueOnce(3).mockReturnValueOnce(4)
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )

      simulator.renderDetails()
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('🥷Warrior HP: 3'))
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('🧌Goblin HP: 4'))
    })

    it('logs nothing when logger is not verbose', () => {
      ;(mockLogger.isVerbose as jest.Mock).mockReturnValueOnce(false)
      const simulator = new BattleSimulator(
        [mockPlayer],
        [mockMonster],
        Strategy.Random,
        Rounding.Up,
        0,
        0,
        0,
        mockLogger,
      )

      simulator.renderDetails()
      expect(mockLogger.log).not.toHaveBeenCalled()
    })
  })
})
