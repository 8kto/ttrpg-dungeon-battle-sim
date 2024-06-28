/**
 * @type {Record<number, StrengthModifierDef>}
 */
export const strengthModifiers = {
  4: {
    ToHit: -2,
    Damage: -1,
    Doors: '1',
    Carry: -10,
  },
  6: {
    ToHit: -1,
    Damage: 0,
    Doors: '1',
    Carry: -5,
  },
  8: {
    ToHit: 0,
    Damage: 0,
    Doors: '1-2',
    Carry: 0,
  },
  12: {
    ToHit: 0,
    Damage: 0,
    Doors: '1-2',
    Carry: 5,
  },
  15: {
    ToHit: 1,
    Damage: 0,
    Doors: '1-2',
    Carry: 10,
  },
  16: {
    ToHit: 1,
    Damage: 1,
    Doors: '1-3',
    Carry: 15,
  },
  17: {
    ToHit: 2,
    Damage: 2,
    Doors: '1-4',
    Carry: 30,
  },
  18: {
    ToHit: 2,
    Damage: 3,
    Doors: '1-5',
    Carry: 50,
  },
}

/**
 * @typedef DexterityModifierDef
 * @property {number} MissilesToHit
 * @property {number} ArmorClass
 */

/**
 * @type {Record<number, DexterityModifierDef>}
 */
export const dexterityModifiers = {
  8: {
    MissilesToHit: -1,
    ArmorClass: -1,
  },
  12: {
    MissilesToHit: 0,
    ArmorClass: 0,
  },
  18: {
    MissilesToHit: 1,
    ArmorClass: 1,
  },
}

/**
 * @typedef ConstitutionModifierDef
 * @property {number} HitPoints
 * @property {string} RaiseDeadSurvivalChance
 */

/**
 * @type {Record<number, ConstitutionModifierDef>}
 */
export const constitutionModifiers = {
  8: {
    HitPoints: -1,
    RaiseDeadSurvivalChance: '50%',
  },
  12: {
    HitPoints: 0,
    RaiseDeadSurvivalChance: '75%',
  },
  18: {
    HitPoints: 1,
    RaiseDeadSurvivalChance: '100%',
  },
}

/**
 * @typedef IntelligenceModifierDef
 * @property {number} MaxAdditionalLanguages
 * @property {number} MaxSpellLevel
 * @property {string} NewSpellUnderstandingChance
 * @property {string} SpellsPerLevel
 */

/**
 * @type {Record<number, IntelligenceModifierDef>}
 */
export const intelligenceModifiers = {
  7: {
    MaxAdditionalLanguages: 0,
    MaxSpellLevel: 4,
    NewSpellUnderstandingChance: '30%',
    SpellsPerLevel: '2/4',
  },
  8: {
    MaxAdditionalLanguages: 1,
    MaxSpellLevel: 5,
    NewSpellUnderstandingChance: '40%',
    SpellsPerLevel: '3/5',
  },
  9: {
    MaxAdditionalLanguages: 1,
    MaxSpellLevel: 5,
    NewSpellUnderstandingChance: '45%',
    SpellsPerLevel: '3/5',
  },
  10: {
    MaxAdditionalLanguages: 2,
    MaxSpellLevel: 5,
    NewSpellUnderstandingChance: '50%',
    SpellsPerLevel: '4/6',
  },
  11: {
    MaxAdditionalLanguages: 2,
    MaxSpellLevel: 6,
    NewSpellUnderstandingChance: '50%',
    SpellsPerLevel: '4/6',
  },
  12: {
    MaxAdditionalLanguages: 3,
    MaxSpellLevel: 6,
    NewSpellUnderstandingChance: '55%',
    SpellsPerLevel: '4/6',
  },
  13: {
    MaxAdditionalLanguages: 3,
    MaxSpellLevel: 7,
    NewSpellUnderstandingChance: '65%',
    SpellsPerLevel: '5/8',
  },
  14: {
    MaxAdditionalLanguages: 4,
    MaxSpellLevel: 7,
    NewSpellUnderstandingChance: '65%',
    SpellsPerLevel: '5/8',
  },
  15: {
    MaxAdditionalLanguages: 4,
    MaxSpellLevel: 8,
    NewSpellUnderstandingChance: '75%',
    SpellsPerLevel: '6/10',
  },
  16: {
    MaxAdditionalLanguages: 5,
    MaxSpellLevel: 8,
    NewSpellUnderstandingChance: '75%',
    SpellsPerLevel: '6/10',
  },
  17: {
    MaxAdditionalLanguages: 5,
    MaxSpellLevel: 9,
    NewSpellUnderstandingChance: '85%',
    SpellsPerLevel: '7/All',
  },
  18: {
    MaxAdditionalLanguages: 6,
    MaxSpellLevel: 9,
    NewSpellUnderstandingChance: '95%',
    SpellsPerLevel: '8/All',
  },
}

/**
 * @typedef CharismaModifierDef
 * @property {number} MaxNumberOfSpecialHirelings
 */

/**
 * @type {Record<number, CharismaModifierDef>}
 */
export const charismaModifiers = {
  4: { MaxNumberOfSpecialHirelings: 1 },
  6: { MaxNumberOfSpecialHirelings: 2 },
  8: { MaxNumberOfSpecialHirelings: 3 },
  12: { MaxNumberOfSpecialHirelings: 4 },
  15: { MaxNumberOfSpecialHirelings: 5 },
  17: { MaxNumberOfSpecialHirelings: 6 },
  18: { MaxNumberOfSpecialHirelings: 7 },
}
