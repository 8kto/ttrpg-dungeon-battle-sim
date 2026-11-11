import { BattleSimulator } from '../services/BattleSimulator'
import type { ILogger } from '../services/logger/ILogger'
import { NullLogger } from '../services/logger/NullLogger'
import type { ICharacter } from '../services/types'
import type { SimulationSettings } from '../types'
import type { BattleStats } from './stats'
import { addBattleResult, createStats } from './stats'

// battle details are logged for this many battles only, statistics cover all of them
export const MAX_LOGGED_BATTLES = 500

// Everything needed to run a simulation; plain data, so it can be sent to a worker
export type SimulationRequest = {
  settings: SimulationSettings
  players: ICharacter[]
  monsters: ICharacter[]
}

// Runs all requested battles synchronously; onBattle is called after each one with cumulative stats
export const runSimulation = (
  { monsters, players, settings }: SimulationRequest,
  logger: ILogger,
  onBattle: (stats: BattleStats) => void = (): void => {},
): BattleStats => {
  const stats = createStats()
  const silentLogger = new NullLogger()

  for (let i = 0; i < settings.battleCount; i++) {
    if (i === MAX_LOGGED_BATTLES && logger.isVerbose()) {
      logger.lineBreak()
      logger.log(`... details of further battles are not logged (limit: ${MAX_LOGGED_BATTLES} battles)`)
    }
    // thousands of logged battles would only bloat the page
    const battleLogger = i < MAX_LOGGED_BATTLES ? logger : silentLogger

    battleLogger.delimiter()
    battleLogger.log(`[Battle ${i + 1}]`)
    battleLogger.delimiter()

    const sim = new BattleSimulator(
      players,
      monsters,
      settings.strategy,
      settings.rounding,
      settings.biasPlayers,
      settings.biasMonsters,
      settings.maxAttacksPerTarget,
      battleLogger,
    )
    sim.renderDetails()
    battleLogger.lineBreak()

    const res = sim.simulate()
    addBattleResult(stats, res)

    battleLogger.log(`>>> total rounds: ${res.rounds}`)
    onBattle(stats)
  }

  return stats
}
