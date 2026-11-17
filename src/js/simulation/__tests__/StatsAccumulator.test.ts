import type { BattleResult } from '../../services/BattleSimulator'
import type { Participant } from '../../services/Participant'
import { Side } from '../../types'
import { StatsAccumulator } from '../StatsAccumulator'

const survivor = (side: Side): Participant => ({ side }) as Participant

describe('StatsAccumulator', () => {
  it('accumulates wins, draws, rounds and surviving players', () => {
    const accumulator = new StatsAccumulator()
    const results: BattleResult[] = [
      { effects: {}, rounds: 3, survivors: [survivor(Side.Players), survivor(Side.Players)], winner: Side.Players },
      { effects: {}, rounds: 5, survivors: [survivor(Side.Monsters)], winner: Side.Monsters },
      { effects: {}, rounds: 1000, survivors: [survivor(Side.Players), survivor(Side.Monsters)], winner: null },
    ]
    results.forEach((r) => accumulator.add(r))

    expect(accumulator.stats).toEqual({
      completed: 3,
      draws: 1,
      effects: {},
      roundsTotal: 1008,
      survivingPlayers: 2,
      winsMonsters: 1,
      winsPlayers: 1,
    })
  })

  it('accumulates effect counters', () => {
    const accumulator = new StatsAccumulator()
    const result = (effects: BattleResult['effects']): BattleResult => ({
      effects,
      rounds: 1,
      survivors: [],
      winner: null,
    })

    accumulator.add(result({ poison: { applied: 1, hasSave: true, saved: 2 } }))
    accumulator.add(
      result({ poison: { applied: 1, hasSave: true, saved: 0 }, '🧊': { applied: 3, hasSave: false, saved: 0 } }),
    )

    expect(accumulator.stats.effects).toEqual({
      poison: { applied: 2, hasSave: true, saved: 2 },
      '🧊': { applied: 3, hasSave: false, saved: 0 },
    })
  })
})
