/* eslint-disable sort-keys-fix/sort-keys-fix */
const exportedStats = {
  MainCharacter: {
    id: 'MainCharacter',
    name: 'Main Character',
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
      characterClass: 'Thief',
      gold: 100,
      hitPoints: 2,
    },
    isCompact: false,
  },
}

module.exports = {
  exportedStats,
}
