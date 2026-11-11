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

const capitalize = (text: string): string => `${text[0].toUpperCase()}${text.slice(1)}`

const validateDamage = (damage: string, strategy: ICombatStrategy, damageParser: IDamageParser): string[] => {
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

    if (!Number.isFinite(char.armorClass)) {
      errors.push(`${label}: invalid AC`)
    }
    if (!Number.isFinite(char.toHit)) {
      errors.push(`${label}: invalid To-Hit`)
    }
    if (!Number.isInteger(hdCount) || hdCount < 1 || !Number.isFinite(hdType)) {
      errors.push(`${label}: invalid Hit Dice`)
    }
    validateDamage(char.damage, strategy, damageParser).forEach((error) => errors.push(`${label}: ${error}`))
    Object.values(SaveType)
      .filter((save) => {
        const value = char.saves[save]

        return !Number.isInteger(value) || value < 0 || value > 20
      })
      .forEach((save) => errors.push(`${label}: invalid ${capitalize(save)} save`))
  })

  return errors
}
