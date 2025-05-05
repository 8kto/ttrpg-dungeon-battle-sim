import type { Dice } from 'ttrpg-lib-dice'

export interface ICharacter {
  name: string
  armorClass: number
  damage: string[]
  hitDice: [number, Dice] // e.g. [2, Dice.d6] which means 2d6 for hit-points
  toHit: number
}

export type IPlayerCharacter = ICharacter

export type IMonster = ICharacter

export enum Strategy {
  Average,
  Random,
}
