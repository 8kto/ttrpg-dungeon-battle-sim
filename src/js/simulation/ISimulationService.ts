import type { ILogger } from '../services/logger/ILogger'
import type { ICharacter } from '../services/types'
import type { SimulationSettings } from '../types'
import type { BattleStats } from './stats'

// Everything needed to run a simulation; plain data, so it can be sent to a worker
export type SimulationRequest = {
  settings: SimulationSettings
  players: ICharacter[]
  monsters: ICharacter[]
}

export interface ISimulationService {
  // Runs all requested battles synchronously; onBattle is called after each one with cumulative stats
  run(request: SimulationRequest, logger: ILogger, onBattle?: (stats: Readonly<BattleStats>) => void): BattleStats
}
