import type { ICombatStrategy } from '../strategies/ICombatStrategy'
import type { ICharacter } from '../types'
import { DamageValidator } from './DamageValidator'
import type { ICharacterRule, ICharacterValidator } from './ICharacterValidator'
import type { CharacterLimits } from './limits'
import { DEFAULT_LIMITS } from './limits'
import { DamageRule, HitDiceRule, RangeRule, SavesRule } from './rules'

// Applies the rules to every character of a side; new checks are added as rules, not here
export class CharacterValidator implements ICharacterValidator {
  constructor(private readonly rules: ICharacterRule[]) {}

  validate(chars: ICharacter[], sideName: string): string[] {
    if (chars.length === 0) {
      return [`${sideName}: no characters`]
    }

    return chars.flatMap((char, i) => {
      const label = `${sideName} #${i + 1} (${char.name})`

      return this.rules.flatMap((rule) => rule.check(char)).map((error) => `${label}: ${error}`)
    })
  }
}

export const getCharacterValidator = (
  strategy: ICombatStrategy,
  limits: CharacterLimits = DEFAULT_LIMITS,
): ICharacterValidator =>
  new CharacterValidator([
    new RangeRule('AC', (c) => c.armorClass, limits.armorClass),
    new RangeRule('To-Hit', (c) => c.toHit, limits.toHit),
    new HitDiceRule(limits.hitDice),
    new DamageRule(new DamageValidator(strategy)),
    new SavesRule(limits.save),
  ])
