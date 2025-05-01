import type { Dice } from '../../domain/Dice'

export interface ICharacter {
  name: string
  armorClass: number
  damage: Dice[]
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
  calculateDamage(d: Dice): number
}
