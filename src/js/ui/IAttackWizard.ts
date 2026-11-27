import type { Modifier, SaveType } from '../services/attacks/types'

export interface IAttackWizard {
  // edits the damage in the modal; onApply gets the new damage, it's not called on cancel
  open(damage: string, onApply: (damage: string) => void): void
}

// an attack as edited in the wizard; an empty name is no name, the save bonus is kept while there's no save
export type DraftAttack = {
  damage: string
  name: string
  save: SaveType | null
  saveMod: number
  modifiers: Modifier[]
}
