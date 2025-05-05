import { Dice, getRandomArrayItems, roll } from 'ttrpg-lib-dice'

import { MagicUserSpells } from '../../config/snw/Magic'
import type { Attributes } from '../../domain/snw/Attributes'
import type { Spell } from '../../domain/snw/Magic'
import { assert } from '../assert'

export const getMagicUserSpellsList = (stats: Attributes): Record<string, Spell> => {
  const res: Record<string, Spell> = {}
  const chunks = stats.Intelligence.SpellsPerLevel.split('/')
  const chances = stats.Intelligence.NewSpellUnderstandingChance
  const spells = Object.values(MagicUserSpells)

  const min = parseInt(chunks[0], 10)
  const max = chunks[1] === 'All' ? spells.length : parseInt(chunks[1], 10)

  assert(min && max, 'Invalid Intelligence.SpellsPerLevel value')

  const maxSpellsList = getRandomArrayItems(spells, max)
  const minSpellsList = getRandomArrayItems(maxSpellsList, min)
  const minSpellListNames = minSpellsList.map((s) => s.name)

  maxSpellsList.forEach((s) => {
    if (minSpellListNames.includes(s.name) || roll(Dice.d100) <= chances) {
      res[s.name] = s
    }
  })

  return res
}
