import { Dice } from 'ttrpg-lib-dice'

import { DEFAULT_SAVES } from '../../services/attacks/types'
import { Rounding, Strategy } from '../../services/types'
import type { SimulationRequest } from '../runSimulation'
import type { WorkerMessage } from '../workerHandler'
import { handleSimulationRequest, PROGRESS_INTERVAL_MS } from '../workerHandler'

const request: SimulationRequest = {
  monsters: [{ armorClass: 1, damage: 'd4', hitDice: [1, Dice.d6], name: 'Goblin', saves: DEFAULT_SAVES, toHit: -100 }],
  players: [{ armorClass: 30, damage: 'd6', hitDice: [1, Dice.d8], name: 'Hero', saves: DEFAULT_SAVES, toHit: 100 }],
  settings: {
    battleCount: 4,
    biasMonsters: 0,
    biasPlayers: 0,
    logsEnabled: false,
    maxAttacksPerTarget: 0,
    rounding: Rounding.Up,
    strategy: Strategy.Max,
  },
}

describe('handleSimulationRequest', () => {
  it('posts throttled progress and a final done message', () => {
    const messages: WorkerMessage[] = []
    // each call advances the clock by half an interval: progress is posted every second battle
    let time = 0
    const now = (): number => (time += PROGRESS_INTERVAL_MS / 2)

    handleSimulationRequest(request, (m) => messages.push(m), now)

    expect(messages.map((m) => m.type)).toEqual(['progress', 'progress', 'done'])
    expect(messages[0]).toMatchObject({ stats: { completed: 2 }, type: 'progress' })
    expect(messages[2]).toMatchObject({ stats: { completed: 4, winsPlayers: 4 }, type: 'done' })
  })

  it('sends log lines with messages when logs are enabled', () => {
    const messages: WorkerMessage[] = []
    handleSimulationRequest({ ...request, settings: { ...request.settings, battleCount: 1, logsEnabled: true } }, (m) =>
      messages.push(m),
    )

    expect(messages).toHaveLength(1)
    expect(messages[0].lines).toContain('[Battle 1]')
  })

  it('posts an error message when the simulation throws', () => {
    const messages: WorkerMessage[] = []
    handleSimulationRequest({ ...request, settings: { ...request.settings, maxAttacksPerTarget: -1 } }, (m) =>
      messages.push(m),
    )

    expect(messages).toEqual([{ lines: [], message: 'Invalid max attacks per target: -1', type: 'error' }])
  })
})
