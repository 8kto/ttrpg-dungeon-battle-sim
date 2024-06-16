/* eslint-disable sort-keys-fix/sort-keys-fix */

/**
 * @typedef StrengthModifierDef
 * @property {number} Damage
 * @property {number} ToHit
 * @property {string} Doors
 * @property {number} Carry
 */

/**
 * @type {Array<StrengthModifierDef>}
 */
export const strengthModifiers = {
  4: {
    ToHit: -2,
    Damage: -1,
    Doors: '1',
    Carry: -10,
  },
  6: {
    ToHit: -1,
    Damage: 0,
    Doors: '1',
    Carry: -5,
  },
  8: {
    ToHit: 0,
    Damage: 0,
    Doors: '1-2',
    Carry: 0,
  },
  12: {
    ToHit: 0,
    Damage: 0,
    Doors: '1-2',
    Carry: 5,
  },
  15: {
    ToHit: 1,
    Damage: 0,
    Doors: '1-2',
    Carry: 10,
  },
  16: {
    ToHit: 1,
    Damage: 1,
    Doors: '1-3',
    Carry: 15,
  },
  17: {
    ToHit: 2,
    Damage: 2,
    Doors: '1-4',
    Carry: 30,
  },
  18: {
    ToHit: 2,
    Damage: 3,
    Doors: '1-5',
    Carry: 50,
  },
}
