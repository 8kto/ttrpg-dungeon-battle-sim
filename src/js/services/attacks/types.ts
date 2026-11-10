export enum SaveType {
  Paralyze = 'paralyze',
  Poison = 'poison',
  Breath = 'breath',
  Device = 'device',
  Magic = 'magic',
}

// Saving throw values; a save succeeds when d20 + bonus >= value
export type Saves = Record<SaveType, number>

export const DEFAULT_SAVES: Readonly<Saves> = Object.freeze({
  breath: 15,
  device: 13,
  magic: 16,
  paralyze: 14,
  poison: 12,
})

export type Modifier =
  | { kind: 'paralyze'; duration: string | null } // null = until the end of battle
  | { kind: 'save_or_die' }
  | { kind: 'save_for_half'; damage: string }
  | { kind: 'extra_damage'; damage: string } // bare formula, e.g. [magic,d8]
  | { kind: 'damage_each_round'; damage: string; duration: string | null }

export type AttackEffect = {
  label: string // save name for save tags (without bonus), otherwise the tag text as written
  save: SaveType | null
  saveMod: number // 0 when absent or for non-save tags
  modifiers: Modifier[]
}

export type Attack = {
  source: string
  damage: string
  effect: AttackEffect | null
}

// attacks made in one turn
export type AttackOption = Attack[]

// how often effects with a given label were applied (failed save or no save) and saved against
export type EffectCounters = Record<string, { applied: number; saved: number; hasSave: boolean }>
