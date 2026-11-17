import type { ISummaryFormatter } from './ISummaryFormatter'
import type { BattleStats, SummaryContext } from './stats'

// Averages are over completed battles only
export class SummaryFormatter implements ISummaryFormatter {
  format(stats: BattleStats, context: SummaryContext): string[] {
    const { completed, draws, roundsTotal, survivingPlayers, winsMonsters, winsPlayers } = stats
    if (completed === 0) {
      return ['No battles completed']
    }

    const lines = [
      `Players win: ${this.percent(winsPlayers, completed)}%, Monsters win: ${this.percent(winsMonsters, completed)}%`,
    ]
    if (draws > 0) {
      lines.push(`>> Draws (round limit reached): ${this.percent(draws, completed)}%`)
    }
    if (winsPlayers > 0) {
      lines.push(`>> Avg Players survivors: ${this.percent(survivingPlayers, winsPlayers * context.playersCount)}%`)
    }
    Object.keys(stats.effects)
      .sort()
      .forEach((label) => {
        const { applied, hasSave, saved } = stats.effects[label]
        lines.push(`>> ${label}: ${applied} applied${hasSave ? `, ${saved} saved` : ''}`)
      })
    lines.push(
      `>> Strategy ${context.strategyLabel}, ${completed} of ${context.runs} battles`,
      `>> Avg Rounds: ${parseFloat((roundsTotal / completed).toFixed(1))}`,
      `>> Execution time: ${(context.elapsedMs / 1000).toFixed(1)} s`,
    )

    return lines
  }

  private percent(value: number, total: number): string {
    return ((value / total) * 100).toFixed(1)
  }
}
