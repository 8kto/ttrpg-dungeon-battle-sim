import type { SimulationSettings } from '../../types'
import { messages } from '../messages/MessageService'
import type { ISettingsValidator } from './ISettingsValidator'
import type { SettingsLimits } from './limits'
import { DEFAULT_SETTINGS_LIMITS, formatRange, isInRange } from './limits'

// Checks the global simulation settings; the form takes care of the selects and the battle count
export class SettingsValidator implements ISettingsValidator {
  constructor(private readonly limits: SettingsLimits = DEFAULT_SETTINGS_LIMITS) {}

  validate({ biasMonsters, biasPlayers, maxAttacksPerTarget }: SimulationSettings): string[] {
    const errors: string[] = []
    const { bias } = this.limits

    if (!isInRange(biasPlayers, bias)) {
      errors.push(messages.t('validation.settings.biasPlayers', { range: formatRange(bias) }))
    }
    if (!isInRange(biasMonsters, bias)) {
      errors.push(messages.t('validation.settings.biasMonsters', { range: formatRange(bias) }))
    }
    if (!Number.isInteger(maxAttacksPerTarget) || maxAttacksPerTarget < 0) {
      errors.push(messages.t('validation.settings.maxAttacks'))
    }

    return errors
  }
}
