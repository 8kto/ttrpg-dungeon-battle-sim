import type { Modifier, SaveType } from '../services/attacks/types'

export interface IAttackWizard {
  // edits the damage in the modal; onApply gets the new damage, it's not called on cancel
  open(damage: string, onApply: (damage: string) => void): void
}

export type TagKind = 'none' | 'label' | 'save'

// an attack as edited in the wizard; the label and the save are kept while switching the tag kind
export type DraftAttack = {
  damage: string
  tag: TagKind
  label: string
  save: SaveType
  saveMod: number
  modifiers: Modifier[]
}
