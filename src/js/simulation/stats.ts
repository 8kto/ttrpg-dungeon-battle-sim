import type { EffectCounters } from '../services/attacks/types'
import type { BattleResult } from '../services/BattleSimulator'
import { Side } from '../types'

// Cumulative results of a series of battles
export type BattleStats = {
  completed: number
  draws: number
  effects: EffectCounters
  roundsTotal: number
  survivingPlayers: number // summed over battles won by the players
  winsMonsters: number
  winsPlayers: number
}

export type SummaryContext = {
  runs: number // requested battles; fewer may complete when stopped
  playersCount: number
  strategyLabel: string
  elapsedMs: number
}

export const createStats = (): BattleStats => ({
  completed: 0,
  draws: 0,
  effects: {},
  roundsTotal: 0,
  survivingPlayers: 0,
  winsMonsters: 0,
  winsPlayers: 0,
})

export const addBattleResult = (stats: BattleStats, result: BattleResult): void => {
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

const percent = (value: number, total: number): string => ((value / total) * 100).toFixed(1)

// Summary lines shown after a simulation; averages are over completed battles only
export const formatSummary = (stats: BattleStats, context: SummaryContext): string[] => {
  const { completed, draws, roundsTotal, survivingPlayers, winsMonsters, winsPlayers } = stats
  if (completed === 0) {
    return ['No battles completed']
  }

  const lines = [`Players win: ${percent(winsPlayers, completed)}%, Monsters win: ${percent(winsMonsters, completed)}%`]
  if (draws > 0) {
    lines.push(`>> Draws (round limit reached): ${percent(draws, completed)}%`)
  }
  if (winsPlayers > 0) {
    lines.push(`>> Avg Players survivors: ${percent(survivingPlayers, winsPlayers * context.playersCount)}%`)
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
