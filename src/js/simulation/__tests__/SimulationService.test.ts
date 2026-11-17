import { Dice } from 'ttrpg-lib-dice'

import { DEFAULT_SAVES } from '../../services/attacks/types'
import type { BattleResult } from '../../services/BattleSimulator'
import type { IBattleSimulator } from '../../services/IBattleSimulator'
import { BufferLogger } from '../../services/logger/BufferLogger'
import { LogLevel } from '../../services/logger/ILogger'
import type { ICharacter } from '../../services/types'
import { Initiative, Rounding, Strategy, Targeting } from '../../services/types'
import type { SimulationRequest } from '../ISimulationService'
import type { IStatsAccumulator } from '../IStatsAccumulator'
import { MAX_LOGGED_BATTLES, SimulationService } from '../SimulationService'
import { StatsAccumulator } from '../StatsAccumulator'

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
    initiative: Initiative.Random,
    logsEnabled: true,
    maxAttacksPerTarget: 0,
    rounding: Rounding.Up,
    strategy: Strategy.Max,
    targeting: Targeting.Random,
    ...overrides,
  },
})

describe('SimulationService', () => {
  const service = new SimulationService()

  it('runs all battles and accumulates stats', () => {
    const onBattle = jest.fn()
    const stats = service.run(makeRequest(), new BufferLogger(), onBattle)

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
    service.run(makeRequest({ battleCount: 1 }), logger)

    const lines = logger.drain()
    expect(lines).toContain('[Battle 1]')
    expect(lines).toContain('🥷Hero HP: 8')
    expect(lines).toContain('>>> total rounds: 1')
  })

  it(`logs details of the first ${MAX_LOGGED_BATTLES} battles only`, () => {
    const logger = new BufferLogger()
    const stats = service.run(makeRequest({ battleCount: MAX_LOGGED_BATTLES + 2 }), logger)

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
    service.run(makeRequest(), logger)

    expect(logger.drain()).toEqual([])
  })

  describe('with injected dependencies', () => {
    const result: BattleResult = { effects: {}, rounds: 7, survivors: [], winner: null }
    const battle = (): IBattleSimulator => {
      const sim: IBattleSimulator = { renderDetails: () => sim, simulate: () => result }

      return sim
    }

    it('creates a battle per run with the request data', () => {
      const createBattle = jest.fn(battle)
      const request = makeRequest({ battleCount: 2 })
      const logger = new BufferLogger(LogLevel.NO_SKIP)

      new SimulationService(createBattle).run(request, logger)

      expect(createBattle).toHaveBeenCalledTimes(2)
      expect(createBattle).toHaveBeenCalledWith([hero], [goblin], logger, request.settings)
    })

    it('adds every result to the accumulator and returns its stats', () => {
      const add = jest.fn()
      const accumulator = { add, stats: { completed: 42 } } as object as IStatsAccumulator

      const stats = new SimulationService(battle, () => accumulator).run(makeRequest(), new BufferLogger())

      expect(add).toHaveBeenCalledTimes(3)
      expect(add).toHaveBeenCalledWith(result)
      expect(stats).toBe(accumulator.stats)
    })

    it('uses the given limit of logged battles', () => {
      const logger = new BufferLogger()
      new SimulationService(battle, () => new StatsAccumulator(), 1).run(makeRequest({ battleCount: 2 }), logger)

      const lines = logger.drain()
      expect(lines).toContain('[Battle 1]')
      expect(lines).not.toContain('[Battle 2]')
    })
  })
})
