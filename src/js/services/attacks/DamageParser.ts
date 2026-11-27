import { capitalize } from '../../utils/text'
import { messages } from '../messages/MessageService'
import { DamageFormula } from './DamageFormula'
import { DamageSerializer } from './DamageSerializer'
import type { IDamageFormula } from './IDamageFormula'
import type { IDamageParser } from './IDamageParser'
import type { IDamageSerializer, SerializableEffect } from './IDamageSerializer'
import type { Attack, AttackEffect, AttackOption, Modifier } from './types'
import { DEFAULT_TARGETS, ModifierKind, SAVE_ONLY_MODIFIERS, SaveType, SINGLE_MODIFIERS } from './types'

type SaveTag = { save: SaveType; saveMod: number }
type SaveBonus = { sign: string | null; value: string }
type NamedModifier = { args: string | null; name: string }
type AttackParts = { formula: string; inner: string | null; name: string | null }

export class DamageParser implements IDamageParser {
  private static readonly OPENING: Readonly<Record<string, string>> = { '(': ')', '<': '>', '[': ']' }
  private static readonly CLOSING: ReadonlySet<string> = new Set(Object.values(DamageParser.OPENING))

  private static readonly NAMED_MODIFIER_RE: RegExp = /^([a-z_]+)\s*(?:\((.*)\))?$/is
  private static readonly SAVE_TAG_RE: RegExp = new RegExp(`^(${Object.values(SaveType).join('|')})\\s*(.*)$`, 'is')
  // a save with a bonus written wrong: "Poison+2", "Poison 2"
  private static readonly BROKEN_BONUS_RE: RegExp = /^[+\-\d]/
  private static readonly SAVE_BONUS_RE: RegExp = /^\(\s*([+-])?\s*(\d+)\s*\)$/
  // formula, optional <name>, optional [effect]; the brackets are balanced by splitTopLevel
  private static readonly ATTACK_RE: RegExp = /^([^<[]*?)\s*(?:<([^>]*)>)?\s*(?:\[(.*)\])?$/s
  private static readonly NAME_FORBIDDEN_RE: RegExp = /[<>[\],|]/
  private static readonly NAME_MAX_LENGTH: number = 30

  constructor(
    private readonly damageFormula: IDamageFormula = new DamageFormula(),
    private readonly damageSerializer: IDamageSerializer = new DamageSerializer(),
  ) {}

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

      const { formula, inner, name } = DamageParser.splitAttack(text)
      const damage = DamageParser.normalizeFormula(formula)
      if (damage === '') {
        throw new Error(messages.t('damage.errors.missingFormula'))
      }
      if (name !== null) {
        const error = this.checkName(name)
        if (error !== null) {
          throw new Error(error)
        }
      }

      return { damage, effect: inner === null ? null : this.parseEffect(inner, name), name, source: text }
    } catch (err) {
      throw DamageParser.withContext((err as Error).message, text)
    }
  }

  checkName(name: string): string | null {
    if (name === '') {
      return messages.t('damage.errors.emptyName')
    }
    if (DamageParser.NAME_FORBIDDEN_RE.test(name)) {
      return messages.t('damage.errors.nameChars', { name })
    }
    if ([...name].length > DamageParser.NAME_MAX_LENGTH) {
      return messages.t('damage.errors.nameTooLong', { max: DamageParser.NAME_MAX_LENGTH, name })
    }

    return null
  }

  getFormulasOf({ damage, effect }: Attack): string[] {
    const formulas = [damage]

    effect?.modifiers.forEach((modifier) => {
      switch (modifier.kind) {
        case ModifierKind.Paralyzed:
        case ModifierKind.Petrified:
          formulas.push(...(modifier.duration === null ? [] : [modifier.duration]))
          break
        case ModifierKind.Targets:
          formulas.push(...(modifier.count === null ? [] : [modifier.count]))
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

  // Splits on a separator outside of [], () and <>; `|` inside brackets is an error. A name in <> is taken as is,
  // up to the closing ">": "Bow (long" is a valid name, and checkName reports brackets and separators in it
  private splitTopLevel(input: string, separator: ',' | '|'): string[] {
    const parts: string[] = []
    const stack: string[] = []
    let current = ''

    for (const char of input) {
      if (stack[stack.length - 1] === '>') {
        if (char === '>') {
          stack.pop()
        }
      } else if (char in DamageParser.OPENING) {
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

  // a save with its bonus goes first, followed by modifiers: "Poison(-2), save_or_die"; without a save, modifiers only
  private parseEffect(inner: string, name: string | null): AttackEffect {
    if (inner.trim() === '') {
      throw new Error(messages.t('damage.errors.emptyEffect'))
    }

    const items = this.splitTopLevel(inner, ',')
    if (items.some((m) => m === '')) {
      throw new Error(messages.t('damage.errors.emptyModifier'))
    }

    const [first, ...rest] = items
    const tag = DamageParser.parseSaveTag(first)
    if (tag === null) {
      const modifiers = items.map((m) => this.parseModifier(m, false))

      return this.toEffect({ modifiers, save: null, saveMod: 0 }, name)
    }
    if (rest.length === 0) {
      throw new Error(messages.t('damage.errors.saveTagWithoutModifiers', { tag: first }))
    }

    const { save, saveMod } = tag

    return this.toEffect({ modifiers: rest.map((m) => this.parseModifier(m, true)), save, saveMod }, name)
  }

  // the id holds the effect written the same way for every spelling: "d6[ poison,save_or_die ]" is "Poison, save_or_die"
  private toEffect(effect: SerializableEffect, name: string | null): AttackEffect {
    const single = effect.modifiers.find(
      ({ kind }, i) => SINGLE_MODIFIERS.has(kind) && effect.modifiers.findIndex((m) => m.kind === kind) !== i,
    )
    if (single) {
      throw new Error(messages.t('damage.errors.duplicateModifier', { modifier: single.kind }))
    }

    const text = this.damageSerializer.serializeEffect(effect)
    const label = name ?? (effect.save === null ? null : capitalize(effect.save))

    return {
      ...effect,
      areaTargets: DamageParser.getAreaTargets(effect.modifiers),
      id: name === null ? text : messages.t('damage.namedEffect', { effect: text, name }),
      label,
    }
  }

  private parseModifier(text: string, hasSave: boolean): Modifier {
    const modifier = this.parseModifierArgs(text, hasSave)
    if (!hasSave && SAVE_ONLY_MODIFIERS.has(modifier.kind)) {
      throw new Error(messages.t('damage.errors.modifierNeedsSave', { modifier: modifier.kind }))
    }

    return modifier
  }

  private parseModifierArgs(text: string, hasSave: boolean): Modifier {
    // with a save anything but a named modifier is extra damage; the validator checks its formula
    const modifier = DamageParser.parseNamedModifier(text)
    if (modifier === null) {
      const damage = DamageParser.normalizeFormula(text)
      if (hasSave) {
        return { damage, kind: ModifierKind.ExtraDamage }
      }
      if (this.isFormula(damage)) {
        throw new Error(messages.t('damage.errors.extraDamageNeedsSave', { damage }))
      }

      throw new Error(messages.t('damage.errors.unknownModifier', { modifier: text }))
    }

    const name = modifier.name.toLowerCase()
    const args = modifier.args === null ? [] : this.splitTopLevel(modifier.args, ',').map(DamageParser.normalizeFormula)
    if (args.some((a) => a === '')) {
      throw new Error(messages.t('damage.errors.emptyArgument', { modifier: name }))
    }

    switch (name) {
      case ModifierKind.Paralyzed:
      case ModifierKind.Petrified:
        if (args.length > 1) {
          throw new Error(messages.t('damage.errors.atMostOneArgument', { modifier: name }))
        }

        return { duration: args[0] ?? null, kind: name }

      case ModifierKind.Targets:
        if (args.length > 1) {
          throw new Error(messages.t('damage.errors.atMostOneArgument', { modifier: name }))
        }

        return { count: args[0] ?? null, kind: ModifierKind.Targets }

      case ModifierKind.SaveOrDie:
        if (args.length > 0) {
          throw new Error(messages.t('damage.errors.noArguments', { modifier: name }))
        }

        return { kind: ModifierKind.SaveOrDie }

      case ModifierKind.SaveForHalf:
        if (args.length === 0) {
          throw new Error(messages.t('damage.errors.modifierNeedsFormula', { modifier: name }))
        }
        if (args.length > 1) {
          throw new Error(messages.t('damage.errors.oneArgument', { modifier: name }))
        }

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

  isFormula(text: string): boolean {
    try {
      this.damageFormula.parse(text)

      return true
    } catch {
      return false
    }
  }

  // "d6 <Sword> [Poison, save_or_die]" gives the formula, the name and the text inside the square brackets
  private static splitAttack(text: string): AttackParts {
    const match = text.match(DamageParser.ATTACK_RE)
    if (!match) {
      throw new Error(messages.t('damage.errors.invalidAttack'))
    }

    return { formula: match[1], inner: match[3] ?? null, name: match[2]?.trim() ?? null }
  }

  // "Poison" or "Magic (+2)", in any case; null when the text is not a save, like "paralyzed(d4)"; throws on a broken bonus
  private static parseSaveTag(text: string): SaveTag | null {
    const match = text.match(DamageParser.SAVE_TAG_RE)
    if (!match) {
      return null
    }

    const save = match[1].toLowerCase() as SaveType
    if (!match[2]) {
      return { save, saveMod: 0 }
    }
    if (DamageParser.BROKEN_BONUS_RE.test(match[2])) {
      throw new Error(messages.t('damage.errors.invalidSaveTag', { save: capitalize(save), tag: text }))
    }
    // "Poisonous" and "paralyzed" are not saves
    if (!match[2].startsWith('(')) {
      return null
    }

    const bonus = DamageParser.parseSaveBonus(match[2])
    if (bonus === null) {
      throw new Error(messages.t('damage.errors.invalidSaveTag', { save: capitalize(save), tag: text }))
    }
    if (bonus.sign === null) {
      throw new Error(messages.t('damage.errors.saveBonusSign', { bonus: bonus.value, save: capitalize(save) }))
    }

    return { save, saveMod: parseInt(`${bonus.sign}${bonus.value}`, 10) }
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

  // the count of targets as written, the default one for "targets" without a count
  private static getAreaTargets(modifiers: Modifier[]): string | null {
    const modifier = modifiers.find((m) => m.kind === ModifierKind.Targets)

    return modifier?.kind === ModifierKind.Targets ? modifier.count ?? String(DEFAULT_TARGETS) : null
  }

  private static normalizeFormula(formula: string): string {
    return formula.trim().toLowerCase()
  }

  private static withContext(message: string, text: string): Error {
    return new Error(messages.t('damage.errors.context', { error: message, text }))
  }
}
