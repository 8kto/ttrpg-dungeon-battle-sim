export type AlternativeSavingThrow = {
  DeathRaysAndPoison: number
  Wands: number
  TurnedToStone: number
  DragonsBreath: number
  SpellsAndStaffs: number
}

export type SavingThrow = {
  swn: {
    value: number
    details: string | null
  }
  alternative: AlternativeSavingThrow
}
