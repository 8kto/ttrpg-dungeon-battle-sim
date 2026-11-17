import { Dice } from 'ttrpg-lib-dice'

import { capitalize } from '../../utils/text'
import { SaveType } from '../attacks/types'
import { messages } from '../messages/MessageService'
import type { ICharacter } from '../types'
import type { ICharacterRule } from './ICharacterValidator'
import type { IDamageValidator } from './IDamageValidator'
import type { Range } from './limits'
import { formatRange, isInRange } from './limits'

// A numeric characteristic must be an integer within the range
export class RangeRule implements ICharacterRule {
  constructor(
    private readonly field: string,
    private readonly read: (char: ICharacter) => number,
    private readonly range: Range,
  ) {}

  check(char: ICharacter): string[] {
    return isInRange(this.read(char), this.range)
      ? []
      : [messages.t('validation.errors.range', { field: this.field, range: formatRange(this.range) })]
  }
}

// The count of hit dice is limited, the die type must be one of the supported dice
export class HitDiceRule implements ICharacterRule {
  constructor(
    private readonly range: Range,
    private readonly dice: readonly Dice[] = Object.values(Dice).filter((d): d is Dice => typeof d === 'number'),
  ) {}

  check({ hitDice: [count, type] }: ICharacter): string[] {
    const errors: string[] = []
    if (!isInRange(count, this.range)) {
      errors.push(messages.t('validation.errors.hitDice', { range: formatRange(this.range) }))
    }
    if (!this.dice.includes(type)) {
      errors.push(messages.t('validation.errors.hitDiceType', { dice: this.dice.map((d) => `d${d}`).join(', ') }))
    }

    return errors
  }
}

// Every saving throw must be within the range
export class SavesRule implements ICharacterRule {
  constructor(private readonly range: Range) {}

  check({ saves }: ICharacter): string[] {
    return Object.values(SaveType)
      .filter((save) => !isInRange(saves[save], this.range))
      .map((save) => messages.t('validation.errors.save', { range: formatRange(this.range), save: capitalize(save) }))
  }
}

export class DamageRule implements ICharacterRule {
  constructor(private readonly damageValidator: IDamageValidator) {}

  check({ damage }: ICharacter): string[] {
    return this.damageValidator.validate(damage)
  }
}
