import type { BattleStats, SummaryContext } from '../stats'
import { createStats } from '../stats'
import { SummaryFormatter } from '../SummaryFormatter'

describe('SummaryFormatter', () => {
  const formatter = new SummaryFormatter()

  const context: SummaryContext = { elapsedMs: 1234, playersCount: 4, runs: 10, strategyLabel: 'Random' }

  it('reports no completed battles', () => {
    expect(formatter.format(createStats(), context)).toEqual(['No battles completed'])
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

    expect(formatter.format(stats, context)).toEqual([
      'Players win: 50.0%, Monsters win: 25.0%',
      '>> Draws (round limit reached or no one left to fight): 25.0%',
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

    expect(formatter.format(stats, context)).toEqual([
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

    expect(formatter.format(stats, context)).toEqual([
      'Players win: 0.0%, Monsters win: 100.0%',
      '>> Strategy Random, 2 of 10 battles',
      '>> Avg Rounds: 3',
      '>> Execution time: 1.2 s',
    ])
  })
})
