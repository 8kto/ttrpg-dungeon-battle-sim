import type { Dice } from 'ttrpg-lib-dice'

import type { ICharacter } from './services/types'

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

export type BattleSimulationConfig = {
  players: ICharacter[]
  monsters: ICharacter[]
  battleCount: number
  strategy: string
  rounding?: string // optional: configs exported before the setting existed don't have it
  biasPlayers: number
  biasMonsters: number
  maxAttacks: number
}
