module.exports = async (page, scenario, vp) => {
  // Listen for console errors and log them
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`);
    }
  });

  await page.evaluate(() => {
    localStorage.setItem('s&w-generator', JSON.stringify(
      {
        "MainCharacter": {
          "id": "MainCharacter",
          "name": "Main Character",
          "items": {
            "Basic accessories": {
              "cost": 0,
              "name": "Basic accessories",
              "quantity": 1,
              "weight": 8
            }
          },
          "character": {
            "stats": {
              "Strength": {
                "Score": 11,
                "ToHit": 0,
                "Damage": 0,
                "Doors": "1-2",
                "Carry": 5
              },
              "Dexterity": {
                "Score": 9,
                "MissilesToHit": 0,
                "ArmorClass": 0
              },
              "Constitution": {
                "Score": 11,
                "HitPoints": 0,
                "RaiseDeadSurvivalChance": "75%"
              },
              "Intelligence": {
                "Score": 6,
                "MaxAdditionalLanguages": 0,
                "MaxSpellLevel": 4,
                "NewSpellUnderstandingChance": 30,
                "SpellsPerLevel": "2/4"
              },
              "Wisdom": {
                "Score": 17
              },
              "Charisma": {
                "Score": 8,
                "MaxNumberOfSpecialHirelings": 3
              },
              "Gold": 110,
              "HitPoints": 6
            },
            "characterClass": "Cleric",
            "spells": "All"
          }
        }
      }
    ));
  });
};
