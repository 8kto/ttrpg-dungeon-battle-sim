import type { BattleStats, SummaryContext } from './stats'

export interface ISummaryFormatter {
  // Summary lines shown after a simulation
  format(stats: BattleStats, context: SummaryContext): string[]
}
