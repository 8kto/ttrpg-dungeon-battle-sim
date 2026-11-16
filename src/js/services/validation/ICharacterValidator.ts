import type { ICharacter } from '../types'

// A single check of a character, e.g. its AC range; errors don't include the character label
export interface ICharacterRule {
  check(char: ICharacter): string[]
}

export interface ICharacterValidator {
  // Returns a list of human-readable errors; empty list means the characters are valid
  validate(chars: ICharacter[], sideName: string): string[]
}
