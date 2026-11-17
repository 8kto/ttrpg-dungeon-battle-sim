import { messages } from '../services/messages/MessageService'
import type { ISummaryFormatter } from './ISummaryFormatter'
import type { BattleStats, SummaryContext } from './stats'

// Averages are over completed battles only
export class SummaryFormatter implements ISummaryFormatter {
  format(stats: BattleStats, context: SummaryContext): string[] {
    const { completed, draws, roundsTotal, survivingPlayers, winsMonsters, winsPlayers } = stats
    if (completed === 0) {
      return [messages.t('stats.noneCompleted')]
    }

    const lines = [
      messages.t('stats.winRate', {
        monsters: this.percent(winsMonsters, completed),
        players: this.percent(winsPlayers, completed),
      }),
    ]
    if (draws > 0) {
      lines.push(messages.t('stats.draws', { percent: this.percent(draws, completed) }))
    }
    if (winsPlayers > 0) {
      const percent = this.percent(survivingPlayers, winsPlayers * context.playersCount)
      lines.push(messages.t('stats.survivors', { percent }))
    }
    Object.keys(stats.effects)
      .sort()
      .forEach((label) => {
        const { applied, hasSave, saved } = stats.effects[label]
        lines.push(
          hasSave
            ? messages.t('stats.effectWithSave', { applied, label, saved })
            : messages.t('stats.effect', { applied, label }),
        )
      })
    lines.push(
      messages.t('stats.strategy', { completed, runs: context.runs, strategy: context.strategyLabel }),
      messages.t('stats.avgRounds', { rounds: parseFloat((roundsTotal / completed).toFixed(1)) }),
      messages.t('stats.elapsed', { seconds: (context.elapsedMs / 1000).toFixed(1) }),
    )

    return lines
  }

  private percent(value: number, total: number): string {
    return ((value / total) * 100).toFixed(1)
  }
}
