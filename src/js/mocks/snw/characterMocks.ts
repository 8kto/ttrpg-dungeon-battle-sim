import { Inventory } from '../../domain/Inventory'
import { CharacterClass } from '../../domain/snw/CharacterClass'

export const clericInventoryMock: Inventory = {
  character: {
    characterClass: CharacterClass.Cleric,
    gold: 110,
    hitPoints: 6,
    spells: 'All',
    stats: {
      Charisma: { MaxNumberOfSpecialHirelings: 3, Score: 8 },
      Constitution: { HitPoints: 0, RaiseDeadSurvivalChance: '75%', Score: 11 },
      Dexterity: { ArmorClass: 0, MissilesToHit: 0, Score: 9 },
      Intelligence: {
        MaxAdditionalLanguages: 0,
        MaxSpellLevel: 4,
        NewSpellUnderstandingChance: 30,
        Score: 6,
        SpellsPerLevel: '2/4',
      },
      Strength: { Carry: 5, Damage: 0, Doors: '1-2', Score: 11, ToHit: 0 },
      Wisdom: { Score: 17 },
    },
  },
  id: 'ClericInventory',
  isCompact: false,
  items: { 'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weight: 8 } },
  name: 'st. John Godheart',
}
