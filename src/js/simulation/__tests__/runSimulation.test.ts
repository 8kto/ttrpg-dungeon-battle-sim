import { Dice } from 'ttrpg-lib-dice'

import { BufferLogger } from '../../services/BufferLogger'
import { LogLevel } from '../../services/ILogger'
import type { ICharacter } from '../../services/types'
import { Rounding, Strategy } from '../../services/types'
import type { SimulationRequest } from '../runSimulation'
import { runSimulation } from '../runSimulation'

// players always hit, monsters never do: the outcome is deterministic
const hero: ICharacter = { armorClass: 30, damage: ['d6'], hitDice: [1, Dice.d8], name: 'Hero', toHit: 100 }
const goblin: ICharacter = { armorClass: 1, damage: ['d4'], hitDice: [1, Dice.d6], name: 'Goblin', toHit: -100 }

const makeRequest = (overrides: Partial<SimulationRequest['settings']> = {}): SimulationRequest => ({
  monsters: [goblin],
  players: [hero],
  settings: {
    battleCount: 3,
    biasMonsters: 0,
    biasPlayers: 0,
    logsEnabled: true,
    maxAttacksPerTarget: 0,
    rounding: Rounding.Up,
    strategy: Strategy.Max,
    ...overrides,
  },
})

describe('runSimulation', () => {
  it('runs all battles and accumulates stats', () => {
    const onBattle = jest.fn()
    const stats = runSimulation(makeRequest(), new BufferLogger(), onBattle)

    expect(stats).toEqual({
      completed: 3,
      draws: 0,
      roundsTotal: 3,
      survivingPlayers: 3,
      winsMonsters: 0,
      winsPlayers: 3,
    })
    expect(onBattle).toHaveBeenCalledTimes(3)
  })

  it('logs battle details when verbose', () => {
    const logger = new BufferLogger()
    runSimulation(makeRequest({ battleCount: 1 }), logger)

    const lines = logger.drain()
    expect(lines).toContain('[Battle 1]')
    expect(lines).toContain('🥷Hero HP: 8')
    expect(lines).toContain('>>> total rounds: 1')
  })

  it('logs nothing when not verbose', () => {
    const logger = new BufferLogger(LogLevel.NO_SKIP)
    runSimulation(makeRequest(), logger)

    expect(logger.drain()).toEqual([])
  })
})
