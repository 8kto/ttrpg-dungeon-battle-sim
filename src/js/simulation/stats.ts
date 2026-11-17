import type { EffectCounters } from '../services/attacks/types'

// Cumulative results of a series of battles; plain data, so it can be sent from a worker
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
