import type { Dice } from 'ttrpg-lib-dice'

export type CharStats = {
  prefix: string
  hdCount: number
  hdType: Dice
  toHit: number
  armorClass: number
  damage: string
}

export enum Side {
  Players = 'Players',
  Monsters = 'Monsters',
}
