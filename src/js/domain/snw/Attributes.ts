export type StrengthModifierDef = {
  Damage: number
  ToHit: number
  Doors: string
  Carry: number
}

export type DexterityModifierDef = {
  MissilesToHit: number
  ArmorClass: number
}

export type ConstitutionModifierDef = {
  HitPoints: number
  RaiseDeadSurvivalChance: string
}

export type IntelligenceModifierDef = {
  MaxAdditionalLanguages: number
  MaxSpellLevel: number
  NewSpellUnderstandingChance: number
  SpellsPerLevel: string
}

export type WisdomModifierDef = {
  Score: number
}

export type CharismaModifierDef = {
  MaxNumberOfSpecialHirelings: number
}

export type ScoredModifierDef = {
  Score: number
}

/**
 * Character stats contain not only Scores but also matched modifiers,
 * not to match it every time it is needed
 * @see getMatchingScore
 */
export type Attributes = {
  Strength: StrengthModifierDef & ScoredModifierDef
  Dexterity: DexterityModifierDef & ScoredModifierDef
  Constitution: ConstitutionModifierDef & ScoredModifierDef
  Intelligence: IntelligenceModifierDef & ScoredModifierDef
  Wisdom: WisdomModifierDef & ScoredModifierDef
  Charisma: CharismaModifierDef & ScoredModifierDef
}
