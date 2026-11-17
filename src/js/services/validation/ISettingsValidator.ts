import type { SimulationSettings } from '../../types'

export interface ISettingsValidator {
  // Returns a list of human-readable errors; empty list means the settings are valid
  validate(settings: SimulationSettings): string[]
}
