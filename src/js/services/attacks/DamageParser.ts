import { messages } from '../messages/MessageService'
import type { IDamageParser } from './IDamageParser'
import type { Attack, AttackEffect, AttackOption, Modifier } from './types'
import { ModifierKind, SaveType } from './types'

type SaveTag = Pick<AttackEffect, 'label' | 'save' | 'saveMod'>

export class DamageParser implements IDamageParser {
  private static readonly OPENING: Readonly<Record<string, string>> = { '(': ')', '[': ']' }
  private static readonly CLOSING: ReadonlySet<string> = new Set(Object.values(DamageParser.OPENING))

  private static readonly FORMULA_START_RE: RegExp = /^\d*d\d+|^\d+/i
  private static readonly NAMED_MODIFIER_RE: RegExp = /^([a-z_]+)\s*(?:\((.*)\))?$/is
  private static readonly SAVE_TAG_RE: RegExp = new RegExp(`^(${Object.values(SaveType).join('|')})(.*)$`, 'is')
  private static readonly SAVE_BONUS_RE: RegExp = /^\(\s*([+-])?\s*(\d+)\s*\)$/

  // sums and differences of dice and integers: "d6+d4", "2d6 - 1", "5"
  private static readonly FORMULA_RE: RegExp = /^(\d*d\d+|\d+)(\s*[+-]\s*(\d*d\d+|\d+))*$/i
  private static readonly TERM_RE: RegExp = /([+-]?)\s*(?:(\d*)d(\d+)|(\d+))/gi

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

  // TODO migrate to dice lib
  getMaxDamage(formula: string): number {
    const text = formula.trim()
    if (!DamageParser.FORMULA_RE.test(text)) {
      throw new Error(`Invalid damage formula: "${formula}"`)
    }

    let total = 0
    for (const [, sign, count, sides, constant] of text.matchAll(DamageParser.TERM_RE)) {
      const value = sides ? (count ? parseInt(count, 10) : 1) * parseInt(sides, 10) : parseInt(constant, 10)
      total += sign === '-' ? -value : value
    }

    return total
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
    const match = tag.match(DamageParser.SAVE_TAG_RE)
    // a save name followed by a letter or a space and a letter is just a label: "poisonous", "poison ivy"
    if (!match || /^\s*[^\s(+\-\d]/.test(match[2])) {
      return { label: tag, save: null, saveMod: 0 }
    }

    const save = match[1].toLowerCase() as SaveType
    const rest = match[2].trim()
    if (rest === '') {
      return { label: save, save, saveMod: 0 }
    }

    const bonus = rest.match(DamageParser.SAVE_BONUS_RE)
    if (!bonus) {
      throw new Error(messages.t('damage.errors.invalidSaveTag', { save, tag }))
    }
    if (!bonus[1]) {
      throw new Error(messages.t('damage.errors.saveBonusSign', { bonus: bonus[2], save }))
    }

    return { label: save, save, saveMod: parseInt(`${bonus[1]}${bonus[2]}`, 10) }
  }

  private parseModifier(text: string, hasSave: boolean): Modifier {
    if (DamageParser.FORMULA_START_RE.test(text)) {
      return { damage: DamageParser.normalizeFormula(text), kind: ModifierKind.ExtraDamage }
    }

    const match = text.match(DamageParser.NAMED_MODIFIER_RE)
    if (!match) {
      throw new Error(messages.t('damage.errors.unknownModifier', { modifier: text }))
    }

    const name = match[1].toLowerCase()
    // eslint-disable-next-line no-undefined
    const args = match[2] === undefined ? [] : this.splitTopLevel(match[2], ',').map(DamageParser.normalizeFormula)
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
        throw new Error(messages.t('damage.errors.unknownModifier', { modifier: match[1] }))
    }
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
