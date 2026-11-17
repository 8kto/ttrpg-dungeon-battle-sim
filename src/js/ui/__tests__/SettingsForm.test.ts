import { Rounding, Strategy, Targeting } from '../../services/types'
import { SettingsForm } from '../SettingsForm'

describe('SettingsForm', () => {
  let form: SettingsForm

  const el = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T
  const changeStrategy = (value: string): void => {
    el<HTMLSelectElement>('strategy-select').value = value
    el('strategy-select').dispatchEvent(new Event('change'))
  }

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="battle-count" value="1000" />
      <select id="strategy-select">
        <option value="Max">Maximum</option>
        <option value="Average">Average</option>
        <option value="Random" selected>Random</option>
      </select>
      <select id="rounding-select">
        <option value="Up" selected>Up</option>
        <option value="Down">Down</option>
      </select>
      <select id="targeting-select">
        <option value="Random" selected>Random</option>
        <option value="Focus">Focus</option>
      </select>
      <input id="bias-players" value="5" />
      <input id="bias-monsters" value="0" />
      <input id="max-attacks" value="5" />
      <input id="logs-checkbox" type="checkbox" checked />`
    form = new SettingsForm()
  })

  it('reads settings', () => {
    expect(form.read()).toEqual({
      battleCount: 1000,
      biasMonsters: 0,
      biasPlayers: 5,
      logsEnabled: true,
      maxAttacksPerTarget: 5,
      rounding: Rounding.Up,
      strategy: Strategy.Random,
      targeting: Targeting.Random,
    })
  })

  it('reads at least 1 battle', () => {
    el<HTMLInputElement>('battle-count').value = ''
    expect(form.read().battleCount).toBe(1)
  })

  it('enables rounding for the Average strategy only', () => {
    expect(el<HTMLSelectElement>('rounding-select').disabled).toBe(true)
    expect(form.strategyLabel).toBe('Random, targeting Random')

    changeStrategy('Average')
    expect(el<HTMLSelectElement>('rounding-select').disabled).toBe(false)
    expect(form.strategyLabel).toBe('Average (rounding Up), targeting Random')
  })

  it('round-trips config, including zero values', () => {
    form.applyConfig({
      battleCount: 50,
      biasMonsters: 0,
      biasPlayers: 0,
      maxAttacks: 0,
      rounding: 'Down',
      strategy: 'Average',
      targeting: 'Focus',
    })

    expect(form.toConfig()).toEqual({
      battleCount: 50,
      biasMonsters: 0,
      biasPlayers: 0,
      maxAttacks: 0,
      rounding: 'Down',
      strategy: 'Average',
      targeting: 'Focus',
    })
    expect(form.read().targeting).toBe(Targeting.Focus)
    expect(el<HTMLSelectElement>('rounding-select').disabled).toBe(false)
  })

  it('keeps current values for fields missing in config', () => {
    form.applyConfig({ strategy: 'Max' })
    expect(form.toConfig()).toEqual({
      battleCount: 1000,
      biasMonsters: 0,
      biasPlayers: 5,
      maxAttacks: 5,
      rounding: 'Up',
      strategy: 'Max',
      targeting: 'Random',
    })
  })
})
