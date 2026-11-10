import type { Dice } from 'ttrpg-lib-dice'

import type { Saves } from './attacks/types'

export interface ICharacter {
  name: string
  armorClass: number
  damage: string // as typed: options separated by "|", attacks by ",", effects in brackets
  hitDice: [number, Dice] // e.g. [2, Dice.d6] which means 2d6 for hit-points
  toHit: number
  saves: Saves
}

export type IPlayerCharacter = ICharacter

export type IMonster = ICharacter

export enum Strategy {
  Average,
  Random,
  Max,
}

// How fractional averages (e.g. d8 = 4.5) are turned into whole numbers
export enum Rounding {
  Up,
  Down,
}
