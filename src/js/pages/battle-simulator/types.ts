import type { Dice } from 'ttrpg-lib-dice'

export interface ICharacter {
  name: string
  armorClass: number
  damage: string[]
  hitDice: [number, Dice] // e.g. [2, Dice.d6] which means 2d6 for hit-points
  toHit: number
}

export interface IPlayerCharacter extends ICharacter {}

export interface IMonster extends ICharacter {}

export enum Strategy {
  Average,
  Random,
}

export interface ICombatStrategy {
  calculateHp(hitDice: [number, Dice]): number
  calculateDamage(damage: string): number
}
