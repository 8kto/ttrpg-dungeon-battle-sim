import type { BattleResult } from '../../services/BattleSimulator'
import type { Participant } from '../../services/Participant'
import { Side } from '../../types'
import type { BattleStats, SummaryContext } from '../stats'
import { addBattleResult, createStats, formatSummary } from '../stats'

const survivor = (side: Side): Participant => ({ side }) as Participant

describe('stats', () => {
  describe('addBattleResult', () => {
    it('accumulates wins, draws, rounds and surviving players', () => {
      const stats = createStats()
      const results: BattleResult[] = [
        { rounds: 3, survivors: [survivor(Side.Players), survivor(Side.Players)], winner: Side.Players },
        { rounds: 5, survivors: [survivor(Side.Monsters)], winner: Side.Monsters },
        { rounds: 1000, survivors: [survivor(Side.Players), survivor(Side.Monsters)], winner: null },
      ]
      results.forEach((r) => addBattleResult(stats, r))

      expect(stats).toEqual({
        completed: 3,
        draws: 1,
        roundsTotal: 1008,
        survivingPlayers: 2,
        winsMonsters: 1,
        winsPlayers: 1,
      })
    })
  })

  describe('formatSummary', () => {
    const context: SummaryContext = { elapsedMs: 1234, playersCount: 4, runs: 10, strategyLabel: 'Random' }

    it('reports no completed battles', () => {
      expect(formatSummary(createStats(), context)).toEqual(['No battles completed'])
    })

    it('computes percentages over completed battles', () => {
      const stats: BattleStats = {
        completed: 4,
        draws: 1,
        roundsTotal: 10,
        survivingPlayers: 6,
        winsMonsters: 1,
        winsPlayers: 2,
      }

      expect(formatSummary(stats, context)).toEqual([
        'Players win: 50.0%, Monsters win: 25.0%',
        '>> Draws (round limit reached): 25.0%',
        '>> Avg Players survivors: 75.0%',
        '>> Strategy Random, 4 of 10 battles',
        '>> Avg Rounds: 2.5',
        '>> Execution time: 1.2 s',
      ])
    })

    it('omits draws and survivors when there are none', () => {
      const stats: BattleStats = { ...createStats(), completed: 2, roundsTotal: 6, winsMonsters: 2 }

      expect(formatSummary(stats, context)).toEqual([
        'Players win: 0.0%, Monsters win: 100.0%',
        '>> Strategy Random, 2 of 10 battles',
        '>> Avg Rounds: 3',
        '>> Execution time: 1.2 s',
      ])
    })
  })
})
