import { BufferLogger } from '../services/logger/BufferLogger'
import { LogLevel } from '../services/logger/ILogger'
import type { SimulationRequest } from './runSimulation'
import { runSimulation } from './runSimulation'
import type { BattleStats } from './stats'

// Messages sent from the simulation worker to the page; lines are new log lines since the previous message
export type WorkerMessage =
  | { type: 'progress'; stats: BattleStats; lines: string[] }
  | { type: 'done'; stats: BattleStats; lines: string[] }
  | { type: 'error'; message: string; lines: string[] }

// how often the worker reports progress (and log lines) to the page
export const PROGRESS_INTERVAL_MS = 100

export const handleSimulationRequest = (
  request: SimulationRequest,
  post: (message: WorkerMessage) => void,
  now: () => number = (): number => performance.now(),
): void => {
  const logger = new BufferLogger(request.settings.logsEnabled ? LogLevel.CAN_SKIP : LogLevel.NO_SKIP)
  let lastPostAt = now()

  try {
    const stats = runSimulation(request, logger, (current) => {
      if (now() - lastPostAt < PROGRESS_INTERVAL_MS) {
        return
      }

      // stats object keeps changing, so send a snapshot
      post({ lines: logger.drain(), stats: { ...current }, type: 'progress' })
      lastPostAt = now()
    })
    post({ lines: logger.drain(), stats, type: 'done' })
  } catch (err) {
    post({ lines: logger.drain(), message: err instanceof Error ? err.message : String(err), type: 'error' })
  }
}
