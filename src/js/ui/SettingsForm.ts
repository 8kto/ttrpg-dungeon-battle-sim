import { Rounding, Strategy } from '../services/types'
import type { BattleSimulationConfig, SimulationSettings } from '../types'

type GlobalConfig = Omit<BattleSimulationConfig, 'monsters' | 'players'>

const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T

// Global simulation settings: battle count, strategy, rounding, bias, attack limit, logs
export class SettingsForm {
  private readonly battleCount: HTMLInputElement = byId('battle-count')
  private readonly strategySelect: HTMLSelectElement = byId('strategy-select')
  private readonly roundingSelect: HTMLSelectElement = byId('rounding-select')
  private readonly biasPlayersInput: HTMLInputElement = byId('bias-players')
  private readonly biasMonstersInput: HTMLInputElement = byId('bias-monsters')
  private readonly maxAttacksInput: HTMLInputElement = byId('max-attacks')
  private readonly logsCheckbox: HTMLInputElement = byId('logs-checkbox')

  constructor() {
    this.strategySelect.addEventListener('change', () => this.syncRoundingState())
    this.syncRoundingState()
  }

  read(): SimulationSettings {
    return {
      battleCount: Math.max(1, parseInt(this.battleCount.value, 10) || 1),
      biasMonsters: parseInt(this.biasMonstersInput.value, 10),
      biasPlayers: parseInt(this.biasPlayersInput.value, 10),
      logsEnabled: this.logsCheckbox.checked,
      maxAttacksPerTarget: parseInt(this.maxAttacksInput.value, 10),
      rounding: Rounding[this.roundingSelect.value as keyof typeof Rounding],
      strategy: Strategy[this.strategySelect.value as keyof typeof Strategy],
    }
  }

  validate(): string[] {
    const { maxAttacksPerTarget } = this.read()

    return Number.isInteger(maxAttacksPerTarget) && maxAttacksPerTarget >= 0
      ? []
      : ['Max Attacks per Target must be 0 (unlimited) or more']
  }

  // e.g. "Average (rounding Up)"
  get strategyLabel(): string {
    const roundingInfo = this.roundingSelect.disabled ? '' : ` (rounding ${this.roundingSelect.value})`

    return `${this.strategySelect.value}${roundingInfo}`
  }

  toConfig(): GlobalConfig {
    return {
      battleCount: parseInt(this.battleCount.value, 10),
      biasMonsters: parseInt(this.biasMonstersInput.value, 10),
      biasPlayers: parseInt(this.biasPlayersInput.value, 10),
      maxAttacks: parseInt(this.maxAttacksInput.value, 10),
      rounding: this.roundingSelect.value,
      strategy: this.strategySelect.value,
    }
  }

  applyConfig(config: Partial<GlobalConfig>): void {
    if (config.battleCount) {
      this.battleCount.value = String(config.battleCount)
    }
    if (config.strategy) {
      this.strategySelect.value = config.strategy
    }
    if (config.rounding) {
      this.roundingSelect.value = config.rounding
    }
    this.syncRoundingState()
    // 0 is a valid bias and attack limit, so check for presence only
    // eslint-disable-next-line no-undefined
    if (config.biasPlayers !== undefined) {
      this.biasPlayersInput.value = String(config.biasPlayers)
    }
    // eslint-disable-next-line no-undefined
    if (config.biasMonsters !== undefined) {
      this.biasMonstersInput.value = String(config.biasMonsters)
    }
    // eslint-disable-next-line no-undefined
    if (config.maxAttacks !== undefined) {
      this.maxAttacksInput.value = String(config.maxAttacks)
    }
  }

  // rounding is used by the Average strategy only
  private syncRoundingState(): void {
    this.roundingSelect.disabled = this.read().strategy !== Strategy.Average
  }
}
