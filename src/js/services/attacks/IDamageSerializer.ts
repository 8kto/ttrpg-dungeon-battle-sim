import type { Attack } from './types'

// an attack without its source text, which is what the serializer builds
export type SerializableAttack = Pick<Attack, 'damage' | 'effect'>

export interface IDamageSerializer {
  // The whole damage field, e.g. "d6, d4 | d8[poison(-2), save_or_die]"
  serializeDamage(options: SerializableAttack[][]): string
  // One attack, e.g. "d8[poison(-2), save_or_die]"
  serializeAttack(attack: SerializableAttack): string
}
