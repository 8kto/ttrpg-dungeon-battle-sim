module.exports = async (page) => {
  // Listen for console errors and log them
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`)
    }
  })

  // Makes page crash @see cd7cd37
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem(
      's&w-generator',
      `{"character-name1722692658967":{"id":"character-name1722692658967","name":"Галко","items":{"Basic accessories":{"cost":0,"name":"Basic accessories","quantity":1,"weight":8}},"character":{"stats":{"Strength":{"Score":13,"ToHit":0,"Damage":0,"Doors":"1-2","Carry":5},"Dexterity":{"Score":11,"MissilesToHit":0,"ArmorClass":0},"Constitution":{"Score":9,"HitPoints":0,"RaiseDeadSurvivalChance":"75%"},"Intelligence":{"Score":9,"MaxAdditionalLanguages":1,"MaxSpellLevel":5,"NewSpellUnderstandingChance":45,"SpellsPerLevel":"3/5"},"Wisdom":{"Score":9},"Charisma":{"Score":11,"MaxNumberOfSpecialHirelings":3},"Gold":70,"HitPoints":3},"characterClass":"Fighter"}},"character-name1722642036514":{"id":"character-name1722642036514","name":"Франческа","items":{"Basic accessories":{"cost":0,"name":"Basic accessories","quantity":1,"weight":8},"Dagger":{"cost":2,"name":"Dagger","weight":2,"flags":4,"damage":"d4","quantity":1},"Staff":{"cost":0,"name":"Staff","weight":10,"damage":"d6","flags":8,"quantity":1},"Backpack":{"cost":5,"name":"Backpack","weight":2,"quantity":1},"Bedroll":{"cost":1,"name":"Bedroll","weight":5,"quantity":1},"Candle":{"cost":0.01,"name":"Candle","weight":0.5,"quantity":1},"Case (map or scroll)":{"cost":1,"name":"Case (map or scroll)","weight":1,"quantity":1},"Chalk, 1 piece":{"cost":0.05,"name":"Chalk, 1 piece","weight":0,"quantity":1},"Flask, leather":{"cost":0.03,"name":"Flask, leather","weight":0.5,"quantity":1},"Ink (1-ounce bottle)":{"cost":1,"name":"Ink (1-ounce bottle)","weight":0.1,"quantity":1},"Lamp, bronze":{"cost":0.1,"name":"Lamp, bronze","weight":2,"quantity":1},"Oil, lamp (1 pint)":{"cost":0.1,"name":"Oil, lamp (1 pint)","weight":1,"quantity":1},"Spellbook, blank":{"cost":25,"name":"Spellbook, blank","weight":1,"quantity":1}},"character":{"stats":{"Strength":{"Score":12,"ToHit":0,"Damage":0,"Doors":"1-2","Carry":5},"Dexterity":{"Score":6,"MissilesToHit":-1,"ArmorClass":-1},"Constitution":{"Score":9,"HitPoints":0,"RaiseDeadSurvivalChance":"75%"},"Intelligence":{"Score":16,"MaxAdditionalLanguages":5,"MaxSpellLevel":8,"NewSpellUnderstandingChance":75,"SpellsPerLevel":"6/10"},"Wisdom":{"Score":12},"Charisma":{"Score":10,"MaxNumberOfSpecialHirelings":4},"Gold":120,"HitPoints":4},"characterClass":"MagicUser","spells":{"Read Magic":{"name":"Read Magic","level":1},"Hold Portal":{"name":"Hold Portal","level":1},"Detect Magic":{"name":"Detect Magic","level":1},"Magic Missile":{"name":"Magic Missile","level":1},"Light":{"name":"Light","level":1},"Protection from Evil":{"name":"Protection from Evil","level":1},"Shield":{"name":"Shield","level":1},"Charm Person":{"name":"Charm Person","level":1},"Sleep":{"name":"Sleep","level":1}},"prepared":["Sleep"]}}}`,
    )
  })

  await page.goto('http://localhost:3000', { waitUntil: 'load' })
}
