import { CharacterClasses } from '../../config/snw/CharacterClasses'
import type { Inventory } from '../../domain/Inventory'
import { Alignment, CharacterRace } from '../../domain/snw/CharacterClass'

export const clericInventoryMock: Inventory = {
  character: {
    alignment: Alignment.Chaotic,
    ancestry: CharacterRace.Human,
    armorClass: { aac: 10, armor: 'None', dac: 9 },
    classDef: CharacterClasses.Cleric,
    damageMod: '0',
    experiencePoints: 0,
    experiencePointsBonus: 5,
    gold: 110,
    hitPoints: 6,
    level: 1,
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
    toHit: { melee: '0', missiles: '0' },
  },
  id: 'ClericInventory',
  isCompact: false,
  items: { 'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weight: 8 } },
  name: 'st. John Godheart',
}
