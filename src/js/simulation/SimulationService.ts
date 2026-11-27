import { AttackOptionsCache } from '../services/attacks/AttackOptionsCache'
import type { IAttackOptionsCache } from '../services/attacks/IAttackOptionsCache'
import type { BattleSettings } from '../services/BattleSimulator'
import { BattleSimulator } from '../services/BattleSimulator'
import type { IBattleSimulator } from '../services/IBattleSimulator'
import type { ILogger } from '../services/logger/ILogger'
import { NullLogger } from '../services/logger/NullLogger'
import { messages } from '../services/messages/MessageService'
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
  attackOptions: IAttackOptionsCache,
) => IBattleSimulator

export class SimulationService implements ISimulationService {
  constructor(
    private readonly createBattle: BattleFactory = (...args): IBattleSimulator => new BattleSimulator(...args),
    private readonly createAccumulator: () => IStatsAccumulator = (): IStatsAccumulator => new StatsAccumulator(),
    private readonly maxLoggedBattles: number = MAX_LOGGED_BATTLES,
    private readonly createAttackOptions: () => IAttackOptionsCache = (): IAttackOptionsCache =>
      new AttackOptionsCache(),
  ) {}

  run(
    { monsters, players, settings }: SimulationRequest,
    logger: ILogger,
    onBattle: (stats: Readonly<BattleStats>) => void = (): void => {},
  ): BattleStats {
    const accumulator = this.createAccumulator()
    const silentLogger = new NullLogger()
    // the damage of the characters is parsed once for all the battles
    const attackOptions = this.createAttackOptions()

    for (let i = 0; i < settings.battleCount; i++) {
      if (i === this.maxLoggedBattles && logger.isVerbose()) {
        logger.lineBreak()
        logger.log(messages.t('simulation.logLimit', { limit: this.maxLoggedBattles }))
      }
      // thousands of logged battles would only bloat the page
      const battleLogger = i < this.maxLoggedBattles ? logger : silentLogger

      battleLogger.delimiter()
      battleLogger.log(messages.t('battle.header', { number: i + 1 }))
      battleLogger.delimiter()

      const sim = this.createBattle(players, monsters, battleLogger, settings, attackOptions)
      sim.renderDetails()
      battleLogger.lineBreak()

      const res = sim.simulate()
      accumulator.add(res)

      battleLogger.log(messages.t('battle.totalRounds', { rounds: res.rounds }))
      onBattle(accumulator.stats)
    }

    return accumulator.stats
  }
}
