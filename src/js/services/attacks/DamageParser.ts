import { messages } from '../messages/MessageService'
import { DamageFormula } from './DamageFormula'
import type { IDamageFormula } from './IDamageFormula'
import type { IDamageParser } from './IDamageParser'
import type { Attack, AttackEffect, AttackOption, Modifier } from './types'
import { ModifierKind, SaveType } from './types'

type SaveTag = Pick<AttackEffect, 'label' | 'save' | 'saveMod'>
type SaveTagParts = { rest: string; save: SaveType }
type SaveBonus = { sign: string | null; value: string }
type NamedModifier = { args: string | null; name: string }

export class DamageParser implements IDamageParser {
  private static readonly OPENING: Readonly<Record<string, string>> = { '(': ')', '[': ']' }
  private static readonly CLOSING: ReadonlySet<string> = new Set(Object.values(DamageParser.OPENING))

  private static readonly NAMED_MODIFIER_RE: RegExp = /^([a-z_]+)\s*(?:\((.*)\))?$/is
  private static readonly SAVE_TAG_RE: RegExp = new RegExp(`^(${Object.values(SaveType).join('|')})(.*)$`, 'is')
  private static readonly SAVE_BONUS_RE: RegExp = /^\(\s*([+-])?\s*(\d+)\s*\)$/
  private static readonly LABEL_CONTINUATION_RE: RegExp = /^\s*[^\s(+\-\d]/

  constructor(private readonly damageFormula: IDamageFormula = new DamageFormula()) {}

  parseDamage(input: string): AttackOption[] {
    const text = input.trim()
    if (text === '') {
      throw new Error(messages.t('damage.errors.empty'))
    }

    let options: string[]
    try {
      options = this.splitTopLevel(text, '|')
    } catch (err) {
      throw DamageParser.withContext((err as Error).message, text)
    }

    return options.map((option) => {
      if (option === '') {
        throw DamageParser.withContext(messages.t('damage.errors.emptyOption'), text)
      }

      const attacks = this.splitTopLevel(option, ',')
      if (attacks.some((a) => a === '')) {
        throw DamageParser.withContext(messages.t('damage.errors.emptyAttack'), text)
      }

      return attacks.map((attack) => this.parseAttack(attack))
    })
  }

  parseAttack(source: string): Attack {
    const text = source.trim()

    try {
      this.splitTopLevel(text, ',')

      const open = text.indexOf('[')
      if (open === -1) {
        return { damage: DamageParser.normalizeFormula(text), effect: null, source: text }
      }
      if (!text.endsWith(']')) {
        throw new Error(messages.t('damage.errors.textAfterBracket'))
      }

      const damage = DamageParser.normalizeFormula(text.slice(0, open))
      if (damage === '') {
        throw new Error(messages.t('damage.errors.missingFormula'))
      }

      return { damage, effect: this.parseEffect(text.slice(open + 1, -1)), source: text }
    } catch (err) {
      throw DamageParser.withContext((err as Error).message, text)
    }
  }

  getFormulasOf({ damage, effect }: Attack): string[] {
    const formulas = [damage]

    effect?.modifiers.forEach((modifier) => {
      switch (modifier.kind) {
        case ModifierKind.Paralyze:
          formulas.push(...(modifier.duration === null ? [] : [modifier.duration]))
          break
        case ModifierKind.SaveOrDie:
          break
        case ModifierKind.SaveForHalf:
        case ModifierKind.ExtraDamage:
          formulas.push(modifier.damage)
          break
        case ModifierKind.DamageEachRound:
          formulas.push(modifier.damage, ...(modifier.duration === null ? [] : [modifier.duration]))
          break
        default:
          throw new Error(`Unknown modifier: ${JSON.stringify(modifier)}`)
      }
    })

    return formulas
  }

  getMaxDamage(formula: string): number {
    const { mod, multiplier, sides } = this.damageFormula.parse(formula)

    return multiplier * sides + mod
  }

  // Splits on a separator outside of [] and (); `|` inside brackets is an error
  private splitTopLevel(input: string, separator: ',' | '|'): string[] {
    const parts: string[] = []
    const stack: string[] = []
    let current = ''

    for (const char of input) {
      if (char in DamageParser.OPENING) {
        stack.push(DamageParser.OPENING[char])
      } else if (DamageParser.CLOSING.has(char)) {
        if (stack.pop() !== char) {
          throw new Error(messages.t('damage.errors.unbalancedBrackets'))
        }
      } else if (char === '|' && stack.length > 0) {
        throw new Error(messages.t('damage.errors.pipeInBrackets'))
      } else if (char === separator && stack.length === 0) {
        parts.push(current.trim())
        current = ''
        continue
      }
      current += char
    }
    if (stack.length > 0) {
      throw new Error(messages.t('damage.errors.unbalancedBrackets'))
    }
    parts.push(current.trim())

    return parts
  }

  private parseEffect(inner: string): AttackEffect {
    if (inner.trim() === '') {
      throw new Error(messages.t('damage.errors.missingTag'))
    }

    const [tag, ...modifierTexts] = this.splitTopLevel(inner, ',')
    if (tag === '') {
      throw new Error(messages.t('damage.errors.missingTag'))
    }
    if (modifierTexts.some((m) => m === '')) {
      throw new Error(messages.t('damage.errors.emptyModifier'))
    }

    const { label, save, saveMod } = this.parseTag(tag)
    if (save !== null && modifierTexts.length === 0) {
      throw new Error(messages.t('damage.errors.saveTagWithoutModifiers', { tag }))
    }

    return { label, modifiers: modifierTexts.map((m) => this.parseModifier(m, save !== null)), save, saveMod }
  }

  private parseTag(tag: string): SaveTag {
    const parts = DamageParser.splitSaveTag(tag)
    if (parts === null) {
      return { label: tag, save: null, saveMod: 0 }
    }

    const { rest, save } = parts
    if (rest === '') {
      return { label: save, save, saveMod: 0 }
    }

    const bonus = DamageParser.parseSaveBonus(rest)
    if (bonus === null) {
      throw new Error(messages.t('damage.errors.invalidSaveTag', { save, tag }))
    }
    if (bonus.sign === null) {
      throw new Error(messages.t('damage.errors.saveBonusSign', { bonus: bonus.value, save }))
    }

    return { label: save, save, saveMod: parseInt(`${bonus.sign}${bonus.value}`, 10) }
  }

  private parseModifier(text: string, hasSave: boolean): Modifier {
    // anything but a named modifier is extra damage; the validator checks its formula
    const modifier = DamageParser.parseNamedModifier(text)
    if (modifier === null) {
      return { damage: DamageParser.normalizeFormula(text), kind: ModifierKind.ExtraDamage }
    }

    const name = modifier.name.toLowerCase()
    const args = modifier.args === null ? [] : this.splitTopLevel(modifier.args, ',').map(DamageParser.normalizeFormula)
    if (args.some((a) => a === '')) {
      throw new Error(messages.t('damage.errors.emptyArgument', { modifier: name }))
    }

    switch (name) {
      case ModifierKind.Paralyze:
        if (args.length > 1) {
          throw new Error(messages.t('damage.errors.atMostOneArgument', { modifier: name }))
        }

        return { duration: args[0] ?? null, kind: ModifierKind.Paralyze }

      case ModifierKind.SaveOrDie:
        if (args.length > 0) {
          throw new Error(messages.t('damage.errors.noArguments', { modifier: name }))
        }
        DamageParser.requireSave(name, hasSave)

        return { kind: ModifierKind.SaveOrDie }

      case ModifierKind.SaveForHalf:
        if (args.length === 0) {
          throw new Error(messages.t('damage.errors.modifierNeedsFormula', { modifier: name }))
        }
        if (args.length > 1) {
          throw new Error(messages.t('damage.errors.oneArgument', { modifier: name }))
        }
        DamageParser.requireSave(name, hasSave)

        return { damage: args[0], kind: ModifierKind.SaveForHalf }

      case ModifierKind.DamageEachRound:
        if (args.length === 0) {
          throw new Error(messages.t('damage.errors.modifierNeedsFormula', { modifier: name }))
        }
        if (args.length > 2) {
          throw new Error(messages.t('damage.errors.atMostTwoArguments', { modifier: name }))
        }

        return { damage: args[0], duration: args[1] ?? null, kind: ModifierKind.DamageEachRound }

      default:
        throw new Error(messages.t('damage.errors.unknownModifier', { modifier: modifier.name }))
    }
  }

  // "wis (+2)" gives the save and the rest after it; null when the tag is not a save
  private static splitSaveTag(tag: string): SaveTagParts | null {
    const match = tag.match(DamageParser.SAVE_TAG_RE)
    // a save name followed by a letter or a space and a letter is just a label: "poisonous", "poison ivy"
    if (!match || DamageParser.LABEL_CONTINUATION_RE.test(match[2])) {
      return null
    }

    return { rest: match[2].trim(), save: match[1].toLowerCase() as SaveType }
  }

  // "(+2)" or "(2)"; the sign is null when missing
  private static parseSaveBonus(text: string): SaveBonus | null {
    const match = text.match(DamageParser.SAVE_BONUS_RE)

    return match ? { sign: match[1] ?? null, value: match[2] } : null
  }

  // "paralyze(1d4)" gives the name and the raw argument list, null without parentheses
  private static parseNamedModifier(text: string): NamedModifier | null {
    const match = text.match(DamageParser.NAMED_MODIFIER_RE)

    return match ? { args: match[2] ?? null, name: match[1] } : null
  }

  private static requireSave(name: string, hasSave: boolean): void {
    if (!hasSave) {
      throw new Error(messages.t('damage.errors.modifierNeedsSave', { modifier: name }))
    }
  }

  private static normalizeFormula(formula: string): string {
    return formula.trim().toLowerCase()
  }

  private static withContext(message: string, text: string): Error {
    return new Error(messages.t('damage.errors.context', { error: message, text }))
  }
}
