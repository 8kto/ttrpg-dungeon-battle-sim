import type { IDamageSerializer, SerializableAttack } from './IDamageSerializer'
import type { AttackEffect, Modifier } from './types'
import { ModifierKind } from './types'

// Writes parsed attacks back in the damage field syntax; the opposite of DamageParser.parseDamage
export class DamageSerializer implements IDamageSerializer {
  private static signed(n: number): string {
    return n > 0 ? `+${n}` : String(n)
  }

  private static withArgs(name: string, ...args: (string | null)[]): string {
    const present = args.filter((a): a is string => a !== null)

    return present.length ? `${name}(${present.join(', ')})` : name
  }

  serializeDamage(options: SerializableAttack[][]): string {
    return options.map((attacks) => attacks.map((attack) => this.serializeAttack(attack)).join(', ')).join(' | ')
  }

  serializeAttack({ damage, effect }: SerializableAttack): string {
    return effect ? `${damage}[${this.serializeEffect(effect)}]` : damage
  }

  private serializeEffect({ label, modifiers, save, saveMod }: AttackEffect): string {
    const tag = save === null ? label : saveMod ? `${save}(${DamageSerializer.signed(saveMod)})` : save

    return [tag, ...modifiers.map((m) => this.serializeModifier(m))].join(', ')
  }

  private serializeModifier(modifier: Modifier): string {
    switch (modifier.kind) {
      case ModifierKind.Paralyze:
        return DamageSerializer.withArgs(modifier.kind, modifier.duration)
      case ModifierKind.SaveOrDie:
        return modifier.kind
      case ModifierKind.SaveForHalf:
        return DamageSerializer.withArgs(modifier.kind, modifier.damage)
      case ModifierKind.ExtraDamage:
        return modifier.damage
      case ModifierKind.DamageEachRound:
        return DamageSerializer.withArgs(modifier.kind, modifier.damage, modifier.duration)
      default:
        throw new Error(`Unknown modifier: ${JSON.stringify(modifier)}`)
    }
  }
}
