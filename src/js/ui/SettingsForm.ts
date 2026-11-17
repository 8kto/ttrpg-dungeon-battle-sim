import { messages } from '../services/messages/MessageService'
import { Initiative, Rounding, Strategy, Targeting } from '../services/types'
import type { BattleSimulationConfig, SimulationSettings } from '../types'
import { parseNumber } from '../utils/number'

type GlobalConfig = Omit<BattleSimulationConfig, 'monsters' | 'players'>

const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T

// Global simulation settings: battle count, strategy, rounding, targeting, initiative, bias, attack limit, logs
export class SettingsForm {
  private readonly battleCount: HTMLInputElement = byId('battle-count')
  private readonly strategySelect: HTMLSelectElement = byId('strategy-select')
  private readonly roundingSelect: HTMLSelectElement = byId('rounding-select')
  private readonly targetingSelect: HTMLSelectElement = byId('targeting-select')
  private readonly initiativeSelect: HTMLSelectElement = byId('initiative-select')
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
      biasMonsters: parseNumber(this.biasMonstersInput.value),
      biasPlayers: parseNumber(this.biasPlayersInput.value),
      initiative: Initiative[this.initiativeSelect.value as keyof typeof Initiative],
      logsEnabled: this.logsCheckbox.checked,
      maxAttacksPerTarget: parseNumber(this.maxAttacksInput.value),
      rounding: Rounding[this.roundingSelect.value as keyof typeof Rounding],
      strategy: Strategy[this.strategySelect.value as keyof typeof Strategy],
      targeting: Targeting[this.targetingSelect.value as keyof typeof Targeting],
    }
  }

  // e.g. "Average (rounding Up), targeting Focus, initiative Fixed"
  get strategyLabel(): string {
    const params = {
      initiative: this.initiativeSelect.value,
      strategy: this.strategySelect.value,
      targeting: this.targetingSelect.value,
    }

    return this.roundingSelect.disabled
      ? messages.t('ui.strategyLabel', params)
      : messages.t('ui.strategyLabelWithRounding', { ...params, rounding: this.roundingSelect.value })
  }

  toConfig(): GlobalConfig {
    return {
      battleCount: parseInt(this.battleCount.value, 10),
      biasMonsters: parseInt(this.biasMonstersInput.value, 10),
      biasPlayers: parseInt(this.biasPlayersInput.value, 10),
      initiative: this.initiativeSelect.value,
      maxAttacks: parseInt(this.maxAttacksInput.value, 10),
      rounding: this.roundingSelect.value,
      strategy: this.strategySelect.value,
      targeting: this.targetingSelect.value,
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
    if (config.targeting) {
      this.targetingSelect.value = config.targeting
    }
    if (config.initiative) {
      this.initiativeSelect.value = config.initiative
    }
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
