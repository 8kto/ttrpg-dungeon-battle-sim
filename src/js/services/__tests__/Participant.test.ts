import { Dice, roll } from 'ttrpg-lib-dice'

import { Side } from '../../types'
import type { Logger } from '../Logger'
import { Participant } from '../Participant'
import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import type { ICharacter } from '../types'

jest.mock('ttrpg-lib-dice', () => ({
  Dice: {
    d20: 'd20',
    d100: 'd100',
  },
  roll: jest.fn(),
}))

describe('Participant', () => {
  const mockChar: ICharacter = {
    armorClass: 15,
    damage: ['1d6'],
    hitDice: [1, Dice.d10],
    name: Side.Players,
    toHit: 3,
  }

  const mockEnemyChar: ICharacter = {
    armorClass: 13,
    damage: ['1d4'],
    hitDice: [1, Dice.d8],
    name: Side.Monsters,
    toHit: 1,
  }

  const mockStrategy: ICombatStrategy = {
    calculateDamage: jest.fn().mockReturnValue(5),
    calculateHp: jest.fn().mockReturnValue(10),
  }

  const mockLogger: Logger = {
    log: jest.fn(),
  } as object as Logger

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('initializes currentHp using strategy.calculateHp', () => {
      const participant = new Participant(mockChar, Side.Players, mockStrategy, 0, 0, mockLogger)
      expect(mockStrategy.calculateHp).toHaveBeenCalledWith(mockChar.hitDice)
      expect(participant.currentHp).toBe(10)
    })

    it('sets hasAttackLimit correctly based on maxAttacksPerChar', () => {
      const withLimit = new Participant(mockChar, Side.Players, mockStrategy, 0, 2, mockLogger)
      expect(withLimit.hasAttackLimit).toBe(true)

      const withoutLimit = new Participant(mockChar, Side.Players, mockStrategy, 0, 0, mockLogger)
      expect(withoutLimit.hasAttackLimit).toBe(false)
    })
  })

  describe('shouldSkip', () => {
    it('skips when d100 roll <= bias', () => {
      ;(roll as jest.Mock).mockReturnValue(30)
      const participant = new Participant(mockChar, Side.Players, mockStrategy, 30, 0, mockLogger)
      expect(participant.shouldSkip()).toBe(true)
    })

    it('does not skip when d100 roll > bias', () => {
      ;(roll as jest.Mock).mockReturnValue(31)
      const participant = new Participant(mockChar, Side.Players, mockStrategy, 30, 0, mockLogger)
      expect(participant.shouldSkip()).toBe(false)
    })
  })

  describe('attack', () => {
    it('skips turn when shouldSkip is true', () => {
      ;(roll as jest.Mock).mockReturnValue(10) // <= 10 bias
      const participant = new Participant(mockChar, Side.Players, mockStrategy, 10, 0, mockLogger)
      participant.attack([], { selectTarget: jest.fn() })
      expect(mockLogger.log).toHaveBeenCalledWith('🫢 Players skips turn')
    })

    it('attacks once per damage entry against valid targets', () => {
      const mockStrategyLocal: ICombatStrategy = {
        calculateDamage: jest.fn().mockReturnValueOnce(5).mockReturnValueOnce(10),
        calculateHp: jest.fn().mockReturnValue(10),
      }

      const participant = new Participant(
        { ...mockChar, damage: ['1d6', '1d8'] },
        Side.Players,
        mockStrategyLocal,
        0,
        0,
        mockLogger,
      )

      const enemyA = new Participant(mockEnemyChar, Side.Monsters, mockStrategy, 0, 0, mockLogger)
      const enemyB = new Participant(
        { ...mockEnemyChar, name: 'Enemy B' },
        Side.Monsters,
        mockStrategy,
        0,
        0,
        mockLogger,
      )

      const mockTargetSelector = { selectTarget: jest.fn().mockReturnValueOnce(enemyA).mockReturnValueOnce(enemyB) }
      jest.spyOn(participant, 'rollToHit').mockReturnValue(20) // Hit

      participant.attack([enemyA, enemyB], mockTargetSelector)

      expect(mockTargetSelector.selectTarget).toHaveBeenCalledTimes(2)
      expect(mockLogger.log).toHaveBeenCalledTimes(3) // damage, damage, death
      expect(enemyA.currentHp).toBe(5) // 10 - (5 * 2)
      expect(enemyB.currentHp).toBe(0) // 10 - (5 * 2)
    })
  })

  describe('performOneAttack', () => {
    it('deals damage and logs hit on successful attack', () => {
      const attacker = new Participant(mockChar, Side.Players, mockStrategy, 0, 0, mockLogger)
      const target = new Participant(mockEnemyChar, Side.Monsters, mockStrategy, 0, 0, mockLogger)
      jest.spyOn(attacker, 'rollToHit').mockReturnValue(20) // Hit

      attacker.performOneAttack(target, '1d6')
      expect(target.currentHp).toBe(5)
      expect(mockLogger.log).toHaveBeenCalledWith('🗡️ Players attacks Monsters, damage: 5')
    })

    it('logs miss and no damage on unsuccessful attack', () => {
      const attacker = new Participant(mockChar, Side.Players, mockStrategy, 0, 0, mockLogger)
      const target = new Participant(mockEnemyChar, Side.Monsters, mockStrategy, 0, 0, mockLogger)
      jest.spyOn(attacker, 'rollToHit').mockReturnValue(10) // Miss

      attacker.performOneAttack(target, '1d6')
      expect(target.currentHp).toBe(10)
      expect(mockLogger.log).toHaveBeenCalledWith('🛡️ Players misses Monsters')
    })
  })

  describe('isValidTarget', () => {
    it('returns false when dead or attack limit exhausted', () => {
      const dead = new Participant(mockChar, Side.Players, mockStrategy, 0, 0, mockLogger)
      dead.currentHp = 0
      expect(dead.isValidTarget()).toBe(false)

      const exhausted = new Participant(mockChar, Side.Players, mockStrategy, 0, 1, mockLogger)
      const attacker = new Participant(mockEnemyChar, Side.Monsters, mockStrategy, 0, 0, mockLogger)
      expect(exhausted.isValidTarget()).toBe(true)
      attacker.performOneAttack(exhausted, '1d4')
      expect(exhausted.isValidTarget()).toBe(false)
    })
  })

  describe('resetAttackLimit', () => {
    it('resets maxAttacksRemaining to initial value', () => {
      const participant = new Participant(mockChar, Side.Players, mockStrategy, 0, 3, mockLogger)
      const attacker = new Participant(mockEnemyChar, Side.Monsters, mockStrategy, 0, 0, mockLogger)

      // Exhaust attacks
      Array(3)
        .fill(null)
        .forEach(() => attacker.performOneAttack(participant, '1d4'))

      expect(participant.isValidTarget()).toBe(false)
      participant.resetAttackLimit()
      expect(participant.isValidTarget()).toBe(true)
    })
  })
})
