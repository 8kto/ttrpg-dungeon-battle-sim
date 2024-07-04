import { CharacterStats } from '../../../domain/snw/CharacterStats'
import { getMagicUserSpellsList } from '../magic'

describe('magic utils', () => {
  describe('getMagicUserSpellsList', () => {
    it('returns spells list', () => {
      const res = getMagicUserSpellsList({
          Intelligence: {
            MaxAdditionalLanguages: 3,
            MaxSpellLevel: 6,
            NewSpellUnderstandingChance: 55,
            SpellsPerLevel: '4/6',
          },
        } as CharacterStats)

        expect(res).toEqual({})
    })
  })
})
