import type { BattleSimulationConfig } from '../../types'

// Settings missing in the config keep their current values in the form
export type ImportedConfig = Pick<BattleSimulationConfig, 'players' | 'monsters'> &
  Partial<Omit<BattleSimulationConfig, 'players' | 'monsters'>>

export type ParseResult = { ok: true; config: ImportedConfig } | { ok: false; errors: string[] }

export interface IConfigParser {
  // Checks the structure of an exported config; value ranges are checked before the simulation
  parse(json: string): ParseResult
}
