import type { CharStats } from './types'

export const playerDefaults: CharStats = {
  armor: '12',
  damage: 'd6',
  hdCount: '1',
  hdType: '8',
  prefix: 'Player',
  toHit: '1',
}
export const henchmanDefaults: CharStats = {
  armor: '12',
  damage: 'd6',
  hdCount: '1',
  hdType: '8',
  prefix: 'Henchman',
  toHit: '1',
}
export const monsterDefaults: CharStats = {
  armor: '13',
  damage: 'd6,d6',
  hdCount: '4',
  hdType: '8',
  prefix: 'Monster',
  toHit: '4',
}
