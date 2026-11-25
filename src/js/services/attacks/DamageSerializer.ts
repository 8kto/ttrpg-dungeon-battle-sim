import { signed } from '../../utils/number'
import { capitalize } from '../../utils/text'
import type { IDamageSerializer, SerializableAttack, SerializableEffect } from './IDamageSerializer'
import type { Modifier } from './types'
import { ModifierKind } from './types'

// Writes parsed attacks back in the damage field syntax, saves capitalized; the opposite of DamageParser.parseDamage
export class DamageSerializer implements IDamageSerializer {
  private static withArgs(name: string, ...args: (string | null)[]): string {
    const present = args.filter((a): a is string => a !== null)

    return present.length ? `${name}(${present.join(', ')})` : name
  }

  serializeDamage(options: SerializableAttack[][]): string {
    return options.map((attacks) => attacks.map((attack) => this.serializeAttack(attack)).join(', ')).join(' | ')
  }

  serializeAttack({ damage, effect, name }: SerializableAttack): string {
    return `${damage}${name === null ? '' : `<${name}>`}${effect ? `[${this.serializeEffect(effect)}]` : ''}`
  }

  serializeEffect({ modifiers, save, saveMod }: SerializableEffect): string {
    const name = save === null ? null : capitalize(save)
    const tag = name === null ? [] : [saveMod ? `${name}(${signed(saveMod)})` : name]

    return [...tag, ...modifiers.map((m) => this.serializeModifier(m))].join(', ')
  }

  private serializeModifier(modifier: Modifier): string {
    switch (modifier.kind) {
      case ModifierKind.Paralyzed:
      case ModifierKind.Petrified:
        return DamageSerializer.withArgs(modifier.kind, modifier.duration)
      case ModifierKind.Targets:
        return DamageSerializer.withArgs(modifier.kind, modifier.count)
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
