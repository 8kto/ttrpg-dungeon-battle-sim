export type StrengthModifierDef = {
  Damage: number;
  ToHit: number;
  Doors: string;
  Carry: number;
};

export type DexterityModifierDef = {
  MissilesToHit: number
  ArmorClass: number
};

export type ConstitutionModifierDef = {
   HitPoints: number
    RaiseDeadSurvivalChance: string
};

export type IntelligenceModifierDef = {
   MaxAdditionalLanguages: number
 MaxSpellLevel: number
 NewSpellUnderstandingChance: string
 SpellsPerLevel: string
};

export type WisdomModifierDef = {
  Score: number;
};

export type CharismaModifierDef = {
  MaxNumberOfSpecialHirelings: number
};

export type CharacterStats = {
  Strength: StrengthModifierDef;
  Dexterity: DexterityModifierDef;
  Constitution: ConstitutionModifierDef;
  Intelligence: IntelligenceModifierDef;
  Wisdom: WisdomModifierDef;
  Charisma: CharismaModifierDef;
  Gold: number;
  HitPoints: number;
};
