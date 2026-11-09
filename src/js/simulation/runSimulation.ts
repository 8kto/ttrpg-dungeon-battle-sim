import { BattleSimulator } from '../services/BattleSimulator'
import type { ILogger } from '../services/ILogger'
import type { ICharacter } from '../services/types'
import type { SimulationSettings } from '../types'
import type { BattleStats } from './stats'
import { addBattleResult, createStats } from './stats'

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

  for (let i = 0; i < settings.battleCount; i++) {
    logger.delimiter()
    logger.log(`[Battle ${i + 1}]`)
    logger.delimiter()

    const sim = new BattleSimulator(
      players,
      monsters,
      settings.strategy,
      settings.rounding,
      settings.biasPlayers,
      settings.biasMonsters,
      settings.maxAttacksPerTarget,
      logger,
    )
    sim.renderDetails()
    logger.lineBreak()

    const res = sim.simulate()
    addBattleResult(stats, res)

    logger.log(`>>> total rounds: ${res.rounds}`)
    onBattle(stats)
  }

  return stats
}
