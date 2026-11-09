import type { SimulationRequest } from './runSimulation'
import { handleSimulationRequest } from './workerHandler'

// Runs the simulation off the main thread, so the page stays responsive and can terminate it at any time
self.onmessage = (e: MessageEvent<SimulationRequest>): void => {
  handleSimulationRequest(e.data, (message) => self.postMessage(message))
}
