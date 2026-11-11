import type { Dice } from 'ttrpg-lib-dice'

import type { Saves } from './services/attacks/types'
import type { ICharacter, Rounding, Strategy } from './services/types'

export type CharStats = {
  prefix: string
  hdCount: number
  hdType: Dice
  toHit: number
  armorClass: number
  damage: string
  saves?: Saves // templates omit it: new characters get the default saves
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
  rounding?: string
  biasPlayers: number
  biasMonsters: number
  maxAttacks: number
}

// Global simulation settings as read from the form
export type SimulationSettings = {
  battleCount: number
  strategy: Strategy
  rounding: Rounding
  biasPlayers: number
  biasMonsters: number
  maxAttacksPerTarget: number // 0 = unlimited
  logsEnabled: boolean
}
