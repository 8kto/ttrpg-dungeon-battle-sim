/* eslint-disable sort-keys-fix/sort-keys-fix */
export const MAP_FIELDS_TO_CHAR_ATTRS: Record<string, string> = {
  // Main character name
  'character-name': 'name',

  // Header Left
  class: 'character.classDef.name',
  alignment: 'character.alignment',
  ancestry: 'character.ancestry',

  // Header center
  level: 'character.level',
  xp: 'character.experiencePoints',
  'prime-attribute': 'character.classDef.PrimeAttr', // array
  'xp-bonus': 'character.experiencePointsBonus',

  // Header right
  'hit-points': 'character.hitPoints',
  'saving-throw': 'character.classDef.SavingThrow',
  'armor-class': 'character.armorClass', // struct

  // Attributes
  strength: 'character.stats.Strength.Score',
  dexterity: 'character.stats.Dexterity.Score',
  constitution: 'character.stats.Constitution.Score',
  intelligence: 'character.stats.Intelligence.Score',
  wisdom: 'character.stats.Wisdom.Score',
  charisma: 'character.stats.Charisma.Score',

  // Attribute Bonuses
  'bonus-to-hit': 'character.stats.Strength.ToHit',
  'open-doors': 'character.stats.Strength.Doors',
  'damage-bonus': 'character.stats.Strength.Damage',
  'carry-modifier': 'character.stats.Strength.Carry',
  'bonus-to-missiles': 'character.stats.Dexterity.MissilesToHit',
  'armor-bonus': 'character.stats.Dexterity.ArmorClass',
  'hp-bonus': 'character.stats.Constitution.HitPoints',
  'raise-dead-survival': 'character.stats.Constitution.RaiseDeadSurvivalChance',
  'additional-languages': 'character.stats.Intelligence.MaxAdditionalLanguages',
  'max-hirelings': 'character.stats.Charisma.MaxNumberOfSpecialHirelings',

  // Gold & Treasure
  'gold-treasure': 'character.gold',

  // Equipment
  'items-equipment': 'items',
  'items--armor': 'items',
  'items--weapons': 'items',
}
