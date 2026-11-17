export interface IDamageValidator {
  // Returns a list of human-readable errors; empty list means the damage field is valid
  validate(damage: string): string[]
}
