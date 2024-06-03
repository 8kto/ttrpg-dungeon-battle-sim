import { MELEE_AND_MISSILE, TWO_HANDED, VAR_HANDED } from '../data/equipment.js'

/**
 * @param {number} flags
 * @returns {string|string}
 */
export const getEquipNameSuffix = (flags) => {
  let sfx = ''
  if (flags & VAR_HANDED) {
    sfx += '†'
  }
  if (flags & TWO_HANDED) {
    sfx += '*'
  }
  if (flags & MELEE_AND_MISSILE) {
    sfx += '‡'
  }

  return sfx ? `<span class="text-red-800 ml-3">${sfx}</span>` : ''
}
