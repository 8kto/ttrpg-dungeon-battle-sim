import { messages } from '../messages/MessageService'
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
      return [messages.t('validation.character.noCharacters', { side: sideName })]
    }

    return chars.flatMap((char, i) => {
      const character = messages.t('validation.character.label', { index: i + 1, name: char.name, side: sideName })

      return this.rules
        .flatMap((rule) => rule.check(char))
        .map((error) => messages.t('validation.character.error', { character, error }))
    })
  }
}

export const getCharacterValidator = (
  strategy: ICombatStrategy,
  limits: CharacterLimits = DEFAULT_LIMITS,
): ICharacterValidator =>
  new CharacterValidator([
    new RangeRule(messages.t('validation.fields.armorClass'), (c) => c.armorClass, limits.armorClass),
    new RangeRule(messages.t('validation.fields.toHit'), (c) => c.toHit, limits.toHit),
    new HitDiceRule(limits.hitDice),
    new DamageRule(new DamageValidator(strategy)),
    new SavesRule(limits.save),
  ])
