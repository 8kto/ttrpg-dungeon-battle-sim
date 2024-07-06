import { AlternativeSavingThrow } from '../../domain/snw/SavingThrow'

/**
 * @fileoverview Alternative Saving Throws instead of one unified.
 * Note, these are just for the first few levels
 */

/**
 * Clerics (including Druids and Monks)
 * Levels: 1-5
 */
export const ClericSavingThrows: AlternativeSavingThrow = {
  DeathRaysAndPoison: 11,
  Wands: 12,
  TurnedToStone: 14,
  DragonsBreath: 16,
  SpellsAndStaffs: 15,
}

/**
 * Fighters (including Rangers and Paladins)
 * Levels: 1-4
 */
export const FightersSavingThrows: AlternativeSavingThrow = {
  DeathRaysAndPoison: 12,
  Wands: 13,
  TurnedToStone: 14,
  DragonsBreath: 15,
  SpellsAndStaffs: 16,
}

/**
 * Magic-Users, Thieves, and Assassins
 * Levels: 1-6
 */
export const MagicUsersSavingThrows: AlternativeSavingThrow = {
  DeathRaysAndPoison: 13,
  Wands: 14,
  TurnedToStone: 13,
  DragonsBreath: 16,
  SpellsAndStaffs: 15,
}
