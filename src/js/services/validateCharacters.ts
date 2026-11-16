import { DamageParser } from './attacks/DamageParser'
import type { IDamageParser } from './attacks/IDamageParser'
import { SaveType } from './attacks/types'
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

// Allowed ranges (inclusive) of numeric characteristics
export const LIMITS = Object.freeze({
  armorClass: { max: 20, min: 6 },
  hitDice: { max: 50, min: 1 },
  save: { max: 20, min: 6 },
  toHit: { max: 10, min: -5 },
})

const isInRange = (value: number, { max, min }: { max: number; min: number }): boolean =>
  Number.isInteger(value) && value >= min && value <= max

const capitalize = (text: string): string => `${text[0].toUpperCase()}${text.slice(1)}`

export const validateDamage = (
  damage: string,
  strategy: ICombatStrategy,
  damageParser: IDamageParser = new DamageParser(),
): string[] => {
  if (damage.trim() === '') {
    return ['no damage formula']
  }

  try {
    return damageParser
      .parseDamage(damage)
      .flat()
      .flatMap((attack) => damageParser.getFormulasOf(attack))
      .filter((formula) => !isValidFormula(formula, strategy))
      .map((formula) => `invalid damage formula "${formula}"`)
  } catch (err) {
    return [(err as Error).message]
  }
}

// Returns a list of human-readable errors; empty list means the characters are valid
export const validateCharacters = (
  chars: ICharacter[],
  strategy: ICombatStrategy,
  sideName: string,
  damageParser: IDamageParser = new DamageParser(),
): string[] => {
  if (chars.length === 0) {
    return [`${sideName}: no characters`]
  }

  const errors: string[] = []

  chars.forEach((char, i) => {
    const label = `${sideName} #${i + 1} (${char.name})`
    const [hdCount, hdType] = char.hitDice

    if (!isInRange(char.armorClass, LIMITS.armorClass)) {
      errors.push(`${label}: invalid AC (${LIMITS.armorClass.min}..${LIMITS.armorClass.max})`)
    }
    if (!isInRange(char.toHit, LIMITS.toHit)) {
      errors.push(`${label}: invalid To-Hit (${LIMITS.toHit.min}..${LIMITS.toHit.max})`)
    }
    if (!isInRange(hdCount, LIMITS.hitDice) || !Number.isFinite(hdType)) {
      errors.push(`${label}: invalid Hit Dice (${LIMITS.hitDice.min}..${LIMITS.hitDice.max})`)
    }
    validateDamage(char.damage, strategy, damageParser).forEach((error) => errors.push(`${label}: ${error}`))
    Object.values(SaveType)
      .filter((save) => !isInRange(char.saves[save], LIMITS.save))
      .forEach((save) =>
        errors.push(`${label}: invalid ${capitalize(save)} save (${LIMITS.save.min}..${LIMITS.save.max})`),
      )
  })

  return errors
}
