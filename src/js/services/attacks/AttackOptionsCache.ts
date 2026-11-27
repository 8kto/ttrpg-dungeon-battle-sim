import { deepFreeze } from '../../utils/object'
import { DamageParser } from './DamageParser'
import type { IAttackOptionsCache } from './IAttackOptionsCache'
import type { IDamageParser } from './IDamageParser'
import type { AttackOption } from './types'

// Lives for one simulation run, as the characters don't change during it. The options are shared by every battle of
// the run, so they are frozen: a change made by one battle would leak into the next ones
export class AttackOptionsCache implements IAttackOptionsCache {
  private readonly options: Map<string, AttackOption[]> = new Map()

  constructor(private readonly damageParser: IDamageParser = new DamageParser()) {}

  get(damage: string): AttackOption[] {
    const cached = this.options.get(damage)
    if (cached) {
      return cached
    }

    const options = deepFreeze(this.damageParser.parseDamage(damage))
    this.options.set(damage, options)

    return options
  }
}
