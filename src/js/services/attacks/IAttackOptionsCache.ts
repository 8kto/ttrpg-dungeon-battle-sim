import type { AttackOption } from './types'

export interface IAttackOptionsCache {
  // The parsed damage field, parsed once for every text: the same frozen options for every battle of a simulation
  get(damage: string): AttackOption[]
}
