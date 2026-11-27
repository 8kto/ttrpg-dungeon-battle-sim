import type { AttackOption } from '../attacks/types'

// the parsed damage and its errors; the options are empty when the damage doesn't parse
export type DamageCheck = {
  errors: string[]
  options: AttackOption[]
}

export interface IDamageValidator {
  // Returns a list of human-readable errors; empty list means the damage field is valid
  validate(damage: string): string[]
  // Like validate, but also returns the parsed damage, so callers don't parse it again
  check(damage: string): DamageCheck
}
