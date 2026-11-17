import type { BattleSettings } from '../services/BattleSimulator'
import { BattleSimulator } from '../services/BattleSimulator'
import type { IBattleSimulator } from '../services/IBattleSimulator'
import type { ILogger } from '../services/logger/ILogger'
import { NullLogger } from '../services/logger/NullLogger'
import type { ICharacter } from '../services/types'
import type { ISimulationService, SimulationRequest } from './ISimulationService'
import type { IStatsAccumulator } from './IStatsAccumulator'
import type { BattleStats } from './stats'
import { StatsAccumulator } from './StatsAccumulator'

// battle details are logged for this many battles only, statistics cover all of them
export const MAX_LOGGED_BATTLES = 500

export type BattleFactory = (
  players: ICharacter[],
  monsters: ICharacter[],
  logger: ILogger,
  settings: BattleSettings,
) => IBattleSimulator

export class SimulationService implements ISimulationService {
  constructor(
    private readonly createBattle: BattleFactory = (...args): IBattleSimulator => new BattleSimulator(...args),
    private readonly createAccumulator: () => IStatsAccumulator = (): IStatsAccumulator => new StatsAccumulator(),
    private readonly maxLoggedBattles: number = MAX_LOGGED_BATTLES,
  ) {}

  run(
    { monsters, players, settings }: SimulationRequest,
    logger: ILogger,
    onBattle: (stats: Readonly<BattleStats>) => void = (): void => {},
  ): BattleStats {
    const accumulator = this.createAccumulator()
    const silentLogger = new NullLogger()

    for (let i = 0; i < settings.battleCount; i++) {
      if (i === this.maxLoggedBattles && logger.isVerbose()) {
        logger.lineBreak()
        logger.log(`... details of further battles are not logged (limit: ${this.maxLoggedBattles} battles)`)
      }
      // thousands of logged battles would only bloat the page
      const battleLogger = i < this.maxLoggedBattles ? logger : silentLogger

      battleLogger.delimiter()
      battleLogger.log(`[Battle ${i + 1}]`)
      battleLogger.delimiter()

      const sim = this.createBattle(players, monsters, battleLogger, settings)
      sim.renderDetails()
      battleLogger.lineBreak()

      const res = sim.simulate()
      accumulator.add(res)

      battleLogger.log(`>>> total rounds: ${res.rounds}`)
      onBattle(accumulator.stats)
    }

    return accumulator.stats
  }
}
