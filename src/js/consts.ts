import { Dice } from 'ttrpg-lib-dice'

import type { CharStats } from './types'

export const PlayerTemplates: CharStats[] = [
  {
    armorClass: 15,
    damage: 'd8',
    hdCount: 1,
    hdType: Dice.d8,
    prefix: 'Fighter',
    toHit: 1,
  },
  {
    armorClass: 13,
    damage: 'd6',
    hdCount: 1,
    hdType: Dice.d6,
    prefix: 'Cleric',
    toHit: 0,
  },
  {
    armorClass: 10,
    damage: 'd4',
    hdCount: 1,
    hdType: Dice.d4,
    prefix: 'Magic User',
    toHit: 0,
  },
  {
    armorClass: 12,
    damage: 'd6',
    hdCount: 1,
    hdType: Dice.d4,
    prefix: 'Thief',
    toHit: 0,
  },
]

export const PlayerCharTemplate: CharStats = PlayerTemplates[0]

export const HenchmanCharTemplate: CharStats = {
  armorClass: 12,
  damage: 'd6',
  hdCount: 1,
  hdType: Dice.d8,
  prefix: 'Henchman',
  toHit: 1,
}

export const MonsterTemplates: CharStats[] = [
  {
    armorClass: 13,
    damage: 'd6,d6',
    hdCount: 4,
    hdType: Dice.d8,
    prefix: 'Monster',
    toHit: 4,
  },
]

export const MonsterCharTemplate: CharStats = MonsterTemplates[0]
