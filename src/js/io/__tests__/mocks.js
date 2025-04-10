/* eslint-disable sort-keys-fix/sort-keys-fix,@typescript-eslint/no-var-requires */

const exportedStats = {
  "MainCharacter": {
    "id": "maincharacter1744237929955",
    "name": "MainCharacter",
    "items": {
      "Basic accessories": {
        "cost": 0,
        "name": "Basic accessories",
        "quantity": 1,
        "weight": 8,
      },
    },
    "character": {
      "gold": 110,
      "hitPoints": 1,
      "stats": {
        "Strength": {
          "Score": 9,
          "ToHit": 0,
          "Damage": 0,
          "Doors": "1-2",
          "Carry": 5,
        },
        "Dexterity": {
          "Score": 16,
          "MissilesToHit": 1,
          "ArmorClass": 1,
        },
        "Constitution": {
          "Score": 12,
          "HitPoints": 0,
          "RaiseDeadSurvivalChance": "75%",
        },
        "Intelligence": {
          "Score": 14,
          "MaxAdditionalLanguages": 4,
          "MaxSpellLevel": 7,
          "NewSpellUnderstandingChance": 65,
          "SpellsPerLevel": "5/8",
        },
        "Wisdom": {
          "Score": 11,
        },
        "Charisma": {
          "Score": 12,
          "MaxNumberOfSpecialHirelings": 4,
        },
      },
      "level": 1,
      "classDef": {
        "name": "MagicUser",
        "PrimeAttr": [
          [
            "Intelligence",
            13,
          ],
        ],
        "SavingThrow": {
          "snw": {
            "value": 15,
            "details": "+2 against spells, including spells from magic wands and staffs",
          },
          "alternative": {
            "DeathRaysAndPoison": 13,
            "Wands": 14,
            "TurnedToStone": 13,
            "DragonsBreath": 16,
            "SpellsAndStaffs": 15,
          },
        },
        "HitDice": 4,
        "ArmorPermitted": "None",
        "WeaponsPermitted": "Dagger, staff, and darts",
        "Race": [
          "Elf",
          "HalfElf",
          "Human",
        ],
        "Alignment": [
          "Chaotic",
          "Neutral",
          "Lawful",
        ],
        "$isCaster": true,
        "$spellsAtTheFirstLevel": 1,
      },
      "ancestry": "Human",
      "toHit": {
        "melee": "0",
        "missiles": "+1",
      },
      "alignment": "Neutral",
      "armorClass": {
        "aac": 10,
        "armor": "None",
        "dac": 9,
      },
      "damageMod": "0",
      "experiencePoints": 0,
      "experiencePointsBonus": 5,
      "spells": {
        "Read Languages": {
          "name": "Read Languages",
          "level": 1,
        },
        "Shield": {
          "name": "Shield",
          "level": 1,
        },
        "Hold Portal": {
          "name": "Hold Portal",
          "level": 1,
        },
        "Charm Person": {
          "name": "Charm Person",
          "level": 1,
        },
        "Magic Missile": {
          "name": "Magic Missile",
          "level": 1,
        },
        "Protection from Evil": {
          "name": "Protection from Evil",
          "level": 1,
        },
        "Read Magic": {
          "name": "Read Magic",
          "level": 1,
        },
      },
    },
  },
}

module.exports = {
  exportedStats,
}
