import type { BattleResult } from '../services/BattleSimulator'
import { Side } from '../types'
import type { IStatsAccumulator } from './IStatsAccumulator'
import type { BattleStats } from './stats'
import { createStats } from './stats'

// Sums up results of a series of battles
export class StatsAccumulator implements IStatsAccumulator {
  private readonly totals: BattleStats = createStats()

  get stats(): Readonly<BattleStats> {
    return this.totals
  }

  add(result: BattleResult): void {
    const stats = this.totals
    if (result.winner === Side.Players) {
      stats.winsPlayers++
      stats.survivingPlayers += result.survivors.filter((s) => s.side === Side.Players).length
    } else if (result.winner === Side.Monsters) {
      stats.winsMonsters++
    } else {
      stats.draws++
    }
    stats.roundsTotal += result.rounds
    stats.completed++

    Object.entries(result.effects).forEach(([label, { applied, hasSave, saved }]) => {
      const total = (stats.effects[label] ??= { applied: 0, hasSave, saved: 0 })
      total.applied += applied
      total.saved += saved
    })
  }
}
