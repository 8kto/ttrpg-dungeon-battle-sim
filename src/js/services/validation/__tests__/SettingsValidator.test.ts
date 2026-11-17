import type { SimulationSettings } from '../../../types'
import { Initiative, Rounding, Strategy, Targeting } from '../../types'
import { SettingsValidator } from '../SettingsValidator'

describe('SettingsValidator', () => {
  const validator = new SettingsValidator()
  const settings: SimulationSettings = {
    battleCount: 10,
    biasMonsters: 0,
    biasPlayers: 5,
    initiative: Initiative.Random,
    logsEnabled: false,
    maxAttacksPerTarget: 0,
    rounding: Rounding.Up,
    strategy: Strategy.Random,
    targeting: Targeting.Random,
  }

  it('returns no errors for valid settings', () => {
    expect(validator.validate(settings)).toEqual([])
  })

  it.each<[Partial<SimulationSettings>, string[]]>([
    [{ maxAttacksPerTarget: 3 }, []],
    [{ biasMonsters: 99, biasPlayers: 0 }, []],
    [{ maxAttacksPerTarget: -1 }, ['Max Attacks per Target must be 0 (unlimited) or more']],
    [{ maxAttacksPerTarget: NaN }, ['Max Attacks per Target must be 0 (unlimited) or more']],
    [{ biasPlayers: -1 }, ['invalid Players Bias (0..99)']],
    [{ biasPlayers: NaN }, ['invalid Players Bias (0..99)']],
    [{ biasMonsters: 100 }, ['invalid Monsters Bias (0..99)']],
    [{ biasMonsters: 2.5 }, ['invalid Monsters Bias (0..99)']],
    [{ maxAttacksPerTarget: 1.5 }, ['Max Attacks per Target must be 0 (unlimited) or more']],
  ])('validates %j', (override, errors) => {
    expect(validator.validate({ ...settings, ...override })).toEqual(errors)
  })

  it('uses the given limits', () => {
    expect(new SettingsValidator({ bias: { max: 3, min: 0 } }).validate(settings)).toEqual([
      'invalid Players Bias (0..3)',
    ])
  })
})
