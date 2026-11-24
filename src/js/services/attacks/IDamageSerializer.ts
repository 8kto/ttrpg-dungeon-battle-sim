import type { Attack, AttackEffect } from './types'

// the label and the id are derived from the name and the effect
export type SerializableEffect = Omit<AttackEffect, 'id' | 'label'>

// an attack without its source text, which is what the serializer builds
export type SerializableAttack = Pick<Attack, 'damage' | 'name'> & { effect: SerializableEffect | null }

export interface IDamageSerializer {
  // The whole damage field, e.g. "d6, d4 | d8<Bite>[poison(-2), save_or_die]"
  serializeDamage(options: SerializableAttack[][]): string
  // One attack, e.g. "d8<Bite>[poison(-2), save_or_die]"
  serializeAttack(attack: SerializableAttack): string
  // The text inside the square brackets, e.g. "poison(-2), save_or_die"
  serializeEffect(effect: SerializableEffect): string
}
