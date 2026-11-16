import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ICharacter } from './types'

const isValidFormula = (formula: string, strategy: ICombatStrategy): boolean => {
  try {
    strategy.calculateDamage(formula)

    return true
  } catch {
    return false
  }
}

// Returns a list of human-readable errors; empty list means the characters are valid
export const validateCharacters = (chars: ICharacter[], strategy: ICombatStrategy, sideName: string): string[] => {
  if (chars.length === 0) {
    return [`${sideName}: no characters`]
  }

  const errors: string[] = []

  chars.forEach((char, i) => {
    const label = `${sideName} #${i + 1} (${char.name})`
    const [hdCount, hdType] = char.hitDice

    if (!Number.isFinite(char.armorClass)) {
      errors.push(`${label}: invalid AC`)
    }
    if (!Number.isFinite(char.toHit)) {
      errors.push(`${label}: invalid To-Hit`)
    }
    if (!Number.isInteger(hdCount) || hdCount < 1 || !Number.isFinite(hdType)) {
      errors.push(`${label}: invalid Hit Dice`)
    }
    if (char.damage.length === 0) {
      errors.push(`${label}: no damage formula`)
    }
    char.damage
      .filter((formula) => !isValidFormula(formula, strategy))
      .forEach((formula) => errors.push(`${label}: invalid damage formula "${formula}"`))
  })

  return errors
}
