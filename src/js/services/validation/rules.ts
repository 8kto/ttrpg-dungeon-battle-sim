import { SaveType } from '../attacks/types'
import type { ICharacter } from '../types'
import type { ICharacterRule } from './ICharacterValidator'
import type { IDamageValidator } from './IDamageValidator'
import type { Range } from './limits'
import { formatRange, isInRange } from './limits'

const capitalize = (text: string): string => `${text[0].toUpperCase()}${text.slice(1)}`

// A numeric characteristic must be an integer within the range
export class RangeRule implements ICharacterRule {
  constructor(
    private readonly title: string,
    private readonly read: (char: ICharacter) => number,
    private readonly range: Range,
  ) {}

  check(char: ICharacter): string[] {
    return isInRange(this.read(char), this.range) ? [] : [`invalid ${this.title} (${formatRange(this.range)})`]
  }
}

// The count of hit dice is limited, the die type must be a number
export class HitDiceRule implements ICharacterRule {
  constructor(private readonly range: Range) {}

  check({ hitDice: [count, type] }: ICharacter): string[] {
    return isInRange(count, this.range) && Number.isFinite(type)
      ? []
      : [`invalid Hit Dice (${formatRange(this.range)})`]
  }
}

// Every saving throw must be within the range
export class SavesRule implements ICharacterRule {
  constructor(private readonly range: Range) {}

  check({ saves }: ICharacter): string[] {
    return Object.values(SaveType)
      .filter((save) => !isInRange(saves[save], this.range))
      .map((save) => `invalid ${capitalize(save)} save (${formatRange(this.range)})`)
  }
}

export class DamageRule implements ICharacterRule {
  constructor(private readonly damageValidator: IDamageValidator) {}

  check({ damage }: ICharacter): string[] {
    return this.damageValidator.validate(damage)
  }
}
