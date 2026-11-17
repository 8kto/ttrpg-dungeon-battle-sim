import type { BattleResult } from '../services/BattleSimulator'
import type { BattleStats } from './stats'

export interface IStatsAccumulator {
  add(result: BattleResult): void
  // live totals: they keep changing as results are added
  readonly stats: Readonly<BattleStats>
}
