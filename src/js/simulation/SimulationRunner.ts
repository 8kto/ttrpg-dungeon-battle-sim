import type { SimulationRequest } from './runSimulation'
import type { BattleStats } from './stats'
import { createStats } from './stats'
import type { WorkerMessage } from './workerHandler'

export type SimulationOutcome = {
  stats: BattleStats
  aborted: boolean
}

type UpdateHandler = (stats: BattleStats, lines: string[]) => void

// Page-side wrapper around the simulation worker
export class SimulationRunner {
  private stopCurrent: (() => void) | null = null

  run(request: SimulationRequest, onUpdate: UpdateHandler): Promise<SimulationOutcome> {
    this.stop()

    const worker = new Worker(new URL('./simulation.worker.ts', import.meta.url), { type: 'module' })
    let lastStats = createStats()

    return new Promise<SimulationOutcome>((resolve, reject) => {
      const finish = (): void => {
        worker.terminate()
        this.stopCurrent = null
      }

      // terminating is immediate, even in the middle of a battle; stats of finished battles are kept
      this.stopCurrent = (): void => {
        finish()
        resolve({ aborted: true, stats: lastStats })
      }

      worker.onmessage = (e: MessageEvent<WorkerMessage>): void => {
        const message = e.data
        if (message.type === 'error') {
          onUpdate(lastStats, message.lines)
          finish()
          reject(new Error(message.message))

          return
        }

        lastStats = message.stats
        onUpdate(message.stats, message.lines)
        if (message.type === 'done') {
          finish()
          resolve({ aborted: false, stats: message.stats })
        }
      }

      worker.onerror = (e: ErrorEvent): void => {
        finish()
        reject(new Error(e.message))
      }

      worker.postMessage(request)
    })
  }

  stop(): void {
    this.stopCurrent?.()
  }
}
