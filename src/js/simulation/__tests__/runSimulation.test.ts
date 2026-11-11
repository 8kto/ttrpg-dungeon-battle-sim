import { Dice } from 'ttrpg-lib-dice'

import { DEFAULT_SAVES } from '../../services/attacks/types'
import { BufferLogger } from '../../services/logger/BufferLogger'
import { LogLevel } from '../../services/logger/ILogger'
import type { ICharacter } from '../../services/types'
import { Rounding, Strategy } from '../../services/types'
import type { SimulationRequest } from '../runSimulation'
import { MAX_LOGGED_BATTLES, runSimulation } from '../runSimulation'

// players always hit, monsters never do: the outcome is deterministic
const hero: ICharacter = {
  armorClass: 30,
  damage: 'd6',
  hitDice: [1, Dice.d8],
  name: 'Hero',
  saves: DEFAULT_SAVES,
  toHit: 100,
}
const goblin: ICharacter = {
  armorClass: 1,
  damage: 'd4',
  hitDice: [1, Dice.d6],
  name: 'Goblin',
  saves: DEFAULT_SAVES,
  toHit: -100,
}

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
      effects: {},
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

  it(`logs details of the first ${MAX_LOGGED_BATTLES} battles only`, () => {
    const logger = new BufferLogger()
    const stats = runSimulation(makeRequest({ battleCount: MAX_LOGGED_BATTLES + 2 }), logger)

    const lines = logger.drain()
    expect(stats.completed).toBe(MAX_LOGGED_BATTLES + 2)
    expect(lines).toContain(`[Battle ${MAX_LOGGED_BATTLES}]`)
    expect(lines).not.toContain(`[Battle ${MAX_LOGGED_BATTLES + 1}]`)
    expect(lines[lines.length - 1]).toBe(
      `... details of further battles are not logged (limit: ${MAX_LOGGED_BATTLES} battles)`,
    )
  })

  it('logs nothing when not verbose', () => {
    const logger = new BufferLogger(LogLevel.NO_SKIP)
    runSimulation(makeRequest(), logger)

    expect(logger.drain()).toEqual([])
  })
})
