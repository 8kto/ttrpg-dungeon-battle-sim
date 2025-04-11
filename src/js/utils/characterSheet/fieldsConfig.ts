/* eslint-disable sort-keys-fix/sort-keys-fix */
export const MAP_FIELDS_TO_CHAR_ATTRS: Record<string, string> = {
  // Header Left
  'Class 2': 'character.classDef.name',
  'Alignment 2': 'character.alignment',
  'Ancestry 2': 'character.ancestry',
  'LEVEL 2': 'character.level',
  'Experience Points (XP) 2': 'character.experiencePoints',
  'Prime Attribute 2': 'character.classDef.PrimeAttr', // array
  'XP Bonus 2': 'character.experiencePointsBonus',

  // Header right
  'Hit Points 2': 'character.hitPoints',
  'Saving Throw 2': 'character.classDef.SavingThrow',
  'Armor Class 2': 'character.armorClass', // struct

  // Attributes
  'Strength 2': 'character.stats.Strength.Score',
  'Dexterity 2': 'character.stats.Dexterity.Score',
  'Constitution 2': 'character.stats.Constitution.Score',
  'Intelligence 2': 'character.stats.Intelligence.Score',
  'Wisdom 2': 'character.stats.Wisdom.Score',
  'Charisma 2': 'character.stats.Charisma.Score',

  // Attribute Bonuses
  'Bonus to Hit (STR) 2': 'character.stats.Strength.ToHit',
  'Open Doors (STR) 2': 'character.stats.Strength.Doors',
  'Damage Bonus (STR) 2': 'character.stats.Strength.Damage',
  'Carry Modifier (STR) 2': 'character.stats.Strength.Carry',
  'Bonus to Missiles (DEX) 2': 'character.stats.Dexterity.MissilesToHit',
  'Armor Bonus (DEX) 2': 'character.stats.Dexterity.ArmorClass',
  'Hit Point Bonus (CON) 2': 'character.stats.Constitution.HitPoints',
  'Raise Dead Survival (CON) 2': 'character.stats.Constitution.RaiseDeadSurvivalChance',
  'Additional Languages 2': 'character.stats.Intelligence.MaxAdditionalLanguages',
  'Max and # of Special Hirelings 2': 'character.stats.Charisma.MaxNumberOfSpecialHirelings',

  // Gold & Treasure
  'Coins 2': 'character.gold',
}
