import { CharacterClass } from '../../domain/snw/CharacterClass'

/**
 * See the Quick Alternative rules in S&W rulebook: no attack tables,
 * just plain d20 and progression with levels.
 *
 * NB: All classes have Base To-Hit = 0 up to 3rd level.
 * NB: Note: I didn't include any logic for levels higher than the first.
 * It is intended to be a simple random character generator, after all.
 */
export const QuickAscendingArmorClassBaseToHit: Record<number, Record<CharacterClass, number>> = {
  1: {
    [CharacterClass.Assassin]: 0,
    [CharacterClass.Cleric]: 0,
    [CharacterClass.Druid]: 0,
    [CharacterClass.Fighter]: 0,
    [CharacterClass.MagicUser]: 0,
    [CharacterClass.Monk]: 0,
    [CharacterClass.Paladin]: 0,
    [CharacterClass.Ranger]: 0,
    [CharacterClass.Thief]: 0,
  },
  // Below are not used ATM, since the char generator supports only 1st level chars
  2: {
    [CharacterClass.Assassin]: 0,
    [CharacterClass.Cleric]: 0,
    [CharacterClass.Druid]: 0,
    [CharacterClass.Fighter]: 0,
    [CharacterClass.MagicUser]: 0,
    [CharacterClass.Monk]: 0,
    [CharacterClass.Paladin]: 0,
    [CharacterClass.Ranger]: 0,
    [CharacterClass.Thief]: 0,
  },
  3: {
    [CharacterClass.Assassin]: 0,
    [CharacterClass.Cleric]: 1,
    [CharacterClass.Druid]: 1,
    [CharacterClass.Fighter]: 1,
    [CharacterClass.MagicUser]: 0,
    [CharacterClass.Monk]: 1,
    [CharacterClass.Paladin]: 1,
    [CharacterClass.Ranger]: 1,
    [CharacterClass.Thief]: 0,
  },
}
