/* eslint-disable sort-keys-fix/sort-keys-fix,@typescript-eslint/no-var-requires */
const { Alignment, CharacterClass } = require('../../domain/snw/CharacterClass')
const { MagicUsersSavingThrows } = require('../../config/snw/SavingThrows')
const { Dice } = require('../../domain/Dice')
const { ANY_RACE, PRIME_ATTR_MIN } = require('../../config/snw/CharacterClasses')

const exportedStats = {
  MainCharacter: {
    id: 'MainCharacter',
    name: 'Main Character',
    classDef: {
      name: CharacterClass.Thief,
      PrimeAttr: [['Dexterity', PRIME_ATTR_MIN]],
      SavingThrow: {
        snw: {
          value: 15,
          details: '+2 against devices, including traps, magical wands or staffs, and other magical devices',
        },
        alternative: MagicUsersSavingThrows,
      },
      HitDice: Dice.d4,
      ArmorPermitted: 'Leather armor only; no shield',
      WeaponsPermitted: 'All, but magical weapons are limited to daggers and swords',
      Race: ANY_RACE,
      Alignment: [Alignment.Neutral, Alignment.Chaotic],
    },
    items: {
      'Basic accessories': {
        cost: 0,
        name: 'Basic accessories',
        quantity: 1,
        weight: 8,
      },
    },
    character: {
      stats: {
        Strength: {
          Score: 7,
          ToHit: 0,
          Damage: 0,
          Doors: '1-2',
          Carry: 0,
        },
        Dexterity: {
          Score: 17,
          MissilesToHit: 1,
          ArmorClass: 1,
        },
        Constitution: {
          Score: 10,
          HitPoints: 0,
          RaiseDeadSurvivalChance: '75%',
        },
        Intelligence: {
          Score: 10,
          MaxAdditionalLanguages: 2,
          MaxSpellLevel: 5,
          NewSpellUnderstandingChance: 50,
          SpellsPerLevel: '4/6',
        },
        Wisdom: {
          Score: 12,
        },
        Charisma: {
          Score: 9,
          MaxNumberOfSpecialHirelings: 4,
        },
      },
      gold: 100,
      hitPoints: 2,
    },
    isCompact: false,
  },
}

module.exports = {
  exportedStats,
}
