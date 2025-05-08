import { Dice } from 'ttrpg-lib-dice'

import { Side } from '../../types'
import { BattleSimulator } from '../BattleSimulator'
import type { Logger } from '../Logger'
import { Participant } from '../Participant'
import { getStrategy } from '../strategies/getStrategy'
import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import type { ICharacter, IMonster, IPlayerCharacter } from '../types'
import { Strategy } from '../types'

jest.mock('../Participant')
jest.mock('../strategies/getStrategy')
jest.mock('../TargetSelector')

const mockLogger = {
  error: jest.fn(),
  log: jest.fn(),
} as object as Logger

const mockStrategy = {
  calculateDamage: jest.fn().mockReturnValue(5),
  calculateHp: jest.fn().mockReturnValue(6),
}

const mockPlayer: IPlayerCharacter = {
  armorClass: 16,
  damage: ['1d8'],
  hitDice: [1, Dice.d10],
  name: 'Warrior',
  toHit: 4,
}

const mockMonster: IMonster = {
  armorClass: 13,
  damage: ['1d4'],
  hitDice: [1, Dice.d6],
  name: 'Goblin',
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
        maxAttacksPerChar: number,
        logger: Logger,
      ) => ({
        attack: jest.fn(),
        char,
        currentHp: strategy.calculateHp(char.hitDice),
        hasAttackLimit: maxAttacksPerChar > 0,
        isValidTarget: jest.fn().mockReturnValue(true),
        logger,
        maxAttacksRemaining: maxAttacksPerChar,
        resetAttackLimit: jest.fn(),
        side,
        strategy,
      }),
    )
    ;(getStrategy as jest.Mock).mockReturnValue(mockStrategy)
  })

  describe('constructor', () => {
    it('creates participants for both sides', () => {
      new BattleSimulator([mockPlayer], [mockMonster], Strategy.Random, 0, 0, 0, mockLogger)

      expect(Participant).toHaveBeenCalledWith(mockPlayer, Side.Players, mockStrategy, 0, 0, mockLogger)
      expect(Participant).toHaveBeenCalledWith(mockMonster, Side.Monsters, mockStrategy, 0, 0, mockLogger)
    })
  })

  describe('hasSurvivors', () => {
    it('returns true when side has living participants', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], Strategy.Random, 0, 0, 0, mockLogger)

      expect(simulator.hasSurvivors(Side.Players)).toBe(true)
      expect(simulator.hasSurvivors(Side.Monsters)).toBe(true)
    })

    it('returns false when side has no living participants [A]', () => {
      const simulator = new BattleSimulator([mockPlayer], [], Strategy.Random, 0, 0, 0, mockLogger)

      expect(simulator.hasSurvivors(Side.Monsters)).toBe(false)
    })

    it('returns false when side has no living participants [B]', () => {
      mockStrategy.calculateDamage.mockReturnValue(1)
      mockStrategy.calculateHp.mockReturnValueOnce(6).mockReturnValueOnce(0)

      const simulator = new BattleSimulator([mockPlayer], [mockMonster], Strategy.Random, 0, 0, 0, mockLogger)
      expect(simulator.hasSurvivors(Side.Monsters)).toBe(false)
    })
  })

  describe('simulate', () => {
    it('ends when one side is defeated', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], Strategy.Random, 0, 0, 0, mockLogger)

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

    it('ends early when no valid attacks possible', () => {
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], Strategy.Random, 0, 0, 0, mockLogger)

      simulator// @ts-ignore private
      .participants
        .forEach((p) => {
          ;(p.isValidTarget as jest.Mock).mockReturnValue(false)
        })

      jest
        .spyOn(simulator, 'hasSurvivors')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockImplementation((side) => side !== Side.Monsters)

      const result = simulator.simulate()
      expect(mockLogger.log).toHaveBeenCalledWith('>>> round 1')
      expect(mockLogger.log).toHaveBeenCalledWith('⏸️ No more valid attacks — ending simulation')
      expect(result.rounds).toBe(1)
    })

    it('resets attack limits each round', () => {
      mockStrategy.calculateDamage.mockReturnValue(3)
      mockStrategy.calculateHp.mockReturnValueOnce(5).mockReturnValueOnce(6)
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], Strategy.Random, 0, 0, 3, mockLogger)

      jest
        .spyOn(simulator, 'hasSurvivors')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockImplementation((side) => side === Side.Players)

      const result = simulator.simulate()
      expect(result.rounds).toBe(2)

      simulator// @ts-ignore private
      .participants
        .every((p) => {
          expect(p.resetAttackLimit).toHaveBeenCalled()
        })
    })
  })

  describe('renderDetails', () => {
    it('logs participant statuses', () => {
      mockStrategy.calculateHp.mockReturnValueOnce(3).mockReturnValueOnce(4)
      const simulator = new BattleSimulator([mockPlayer], [mockMonster], Strategy.Random, 0, 0, 0, mockLogger)

      simulator.renderDetails()
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('🥷Warrior HP: 3'))
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('🧌Goblin HP: 4'))
    })
  })
})
