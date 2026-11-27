import type { Attack, AttackEffect, SaveType } from './types'

// the label, the id and the area targets are derived from the name and the effect
export type SerializableEffect = Omit<AttackEffect, 'areaTargets' | 'id' | 'label'>

// an attack without its source text, which is what the serializer builds
export type SerializableAttack = Pick<Attack, 'damage' | 'name'> & { effect: SerializableEffect | null }

export interface IDamageSerializer {
  // The whole damage field, e.g. "d6, d4 | d8<Bite>[Poison(-2), save_or_die]"
  serializeDamage(options: SerializableAttack[][]): string
  // One attack, e.g. "d8<Bite>[Poison(-2), save_or_die]"
  serializeAttack(attack: SerializableAttack): string
  // The text inside the square brackets, e.g. "Poison(-2), save_or_die"
  serializeEffect(effect: SerializableEffect): string
  // A save tag with its bonus, e.g. "Poison(-2)", or "Poison" without one
  serializeSave(save: SaveType, saveMod: number): string
}
