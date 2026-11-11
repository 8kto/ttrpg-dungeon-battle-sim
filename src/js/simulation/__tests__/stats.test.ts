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
        { effects: {}, rounds: 3, survivors: [survivor(Side.Players), survivor(Side.Players)], winner: Side.Players },
        { effects: {}, rounds: 5, survivors: [survivor(Side.Monsters)], winner: Side.Monsters },
        { effects: {}, rounds: 1000, survivors: [survivor(Side.Players), survivor(Side.Monsters)], winner: null },
      ]
      results.forEach((r) => addBattleResult(stats, r))

      expect(stats).toEqual({
        completed: 3,
        draws: 1,
        effects: {},
        roundsTotal: 1008,
        survivingPlayers: 2,
        winsMonsters: 1,
        winsPlayers: 1,
      })
    })
  })

  it('accumulates effect counters', () => {
    const stats = createStats()
    const result = (effects: BattleResult['effects']): BattleResult => ({
      effects,
      rounds: 1,
      survivors: [],
      winner: null,
    })

    addBattleResult(stats, result({ poison: { applied: 1, hasSave: true, saved: 2 } }))
    addBattleResult(
      stats,
      result({ poison: { applied: 1, hasSave: true, saved: 0 }, '🧊': { applied: 3, hasSave: false, saved: 0 } }),
    )

    expect(stats.effects).toEqual({
      poison: { applied: 2, hasSave: true, saved: 2 },
      '🧊': { applied: 3, hasSave: false, saved: 0 },
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
        effects: {},
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

    it('lists effects in the summary, sorted by label', () => {
      const stats: BattleStats = {
        ...createStats(),
        completed: 2,
        effects: {
          breath: { applied: 1, hasSave: true, saved: 0 },
          poison: { applied: 2, hasSave: true, saved: 2 },
          '🧊': { applied: 3, hasSave: false, saved: 0 },
        },
        roundsTotal: 6,
        winsMonsters: 2,
      }

      expect(formatSummary(stats, context)).toEqual([
        'Players win: 0.0%, Monsters win: 100.0%',
        '>> breath: 1 applied, 0 saved',
        '>> poison: 2 applied, 2 saved',
        '>> 🧊: 3 applied',
        '>> Strategy Random, 2 of 10 battles',
        '>> Avg Rounds: 3',
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
