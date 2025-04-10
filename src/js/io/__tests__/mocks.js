/* eslint-disable sort-keys-fix/sort-keys-fix,@typescript-eslint/no-var-requires */

const exportedStats = {
  maincharacter1744304617534: {
    id: 'maincharacter1744304617534',
    name: 'MainCharacter',
    items: {
      'Basic accessories': {
        cost: 0,
        name: 'Basic accessories',
        weight: 8,
        quantity: 2,
      },
      Leather: {
        cost: 5,
        name: 'Leather',
        weight: 25,
        ascArmorClass: 2,
        quantity: 1,
      },
      'Arrows (20)': {
        cost: 2,
        name: 'Arrows (20)',
        weight: 1,
        damage: 'd6',
        flags: 16,
        quantity: 1,
      },
      'Bow, Short': {
        cost: 15,
        name: 'Bow, Short',
        weight: 5,
        damage: '',
        flags: 16,
        quantity: 1,
      },
      'Sword, Long': {
        cost: 15,
        name: 'Sword, Long',
        weight: 10,
        damage: 'd8',
        flags: 8,
        quantity: 1,
      },
      'Oil, lamp (1 pint)': {
        cost: 0.1,
        name: 'Oil, lamp (1 pint)',
        weight: 1,
        quantity: 3,
      },
      'Rations, trail': {
        cost: 1,
        name: 'Rations, trail',
        weight: 2,
        quantity: 5,
      },
    },
    character: {
      gold: 900,
      hitPoints: 11,
      stats: {
        Strength: {
          Score: 10,
          ToHit: 0,
          Damage: 0,
          Doors: '1-2',
          Carry: 5,
        },
        Dexterity: {
          Score: 14,
          MissilesToHit: 1,
          ArmorClass: 1,
        },
        Constitution: {
          Score: 9,
          HitPoints: 0,
          RaiseDeadSurvivalChance: '75%',
        },
        Intelligence: {
          Score: 8,
          MaxAdditionalLanguages: 1,
          MaxSpellLevel: 5,
          NewSpellUnderstandingChance: 40,
          SpellsPerLevel: '3/5',
        },
        Wisdom: {
          Score: 14,
        },
        Charisma: {
          Score: 7,
          MaxNumberOfSpecialHirelings: 3,
        },
      },
      level: 1,
      classDef: {
        name: 'Thief',
        PrimeAttr: [['Dexterity', 13]],
        SavingThrow: {
          snw: {
            value: 15,
            details: '+2 against devices, including traps, magical wands or staffs, and other magical devices',
          },
          alternative: {
            DeathRaysAndPoison: 13,
            Wands: 14,
            TurnedToStone: 13,
            DragonsBreath: 16,
            SpellsAndStaffs: 15,
          },
        },
        HitDice: 4,
        ArmorPermitted: 'Leather armor only; no shield',
        WeaponsPermitted: 'All, but magical weapons are limited to daggers and swords',
        Race: ['Human', 'Dwarf', 'Elf', 'HalfElf', 'Hobbit'],
        Alignment: ['Neutral', 'Chaotic'],
      },
      ancestry: 'Human',
      toHit: {
        melee: '0',
        missiles: '+1',
      },
      alignment: 'Neutral',
      armorClass: {
        aac: 10,
        armor: 'None',
        dac: 9,
      },
      damageMod: '0',
      experiencePoints: 0,
      experiencePointsBonus: 10,
      $classDefName: 'Thief',
    },
    isCompact: false,
  },
}

module.exports = {
  exportedStats,
}
