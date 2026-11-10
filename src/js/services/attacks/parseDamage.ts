import type { Attack, AttackEffect, AttackOption, Modifier } from './types'
import { ModifierKind, SaveType } from './types'

const SAVE_NAMES: string[] = Object.values(SaveType)
const OPENING: Record<string, string> = { '(': ')', '[': ']' }
const CLOSING = new Set(Object.values(OPENING))

const FORMULA_RE = /^\d*d\d+|^\d+/i
const NAMED_MODIFIER_RE = /^([a-z_]+)\s*(?:\((.*)\))?$/is
const SAVE_TAG_RE = new RegExp(`^(${SAVE_NAMES.join('|')})(.*)$`, 'is')
const SAVE_BONUS_RE = /^\(\s*([+-])?\s*(\d+)\s*\)$/

const normalizeFormula = (formula: string): string => formula.trim().toLowerCase()

// Splits on a separator outside of [] and (); `|` inside brackets is an error
const splitTopLevel = (input: string, separator: ',' | '|'): string[] => {
  const parts: string[] = []
  const stack: string[] = []
  let current = ''

  for (const char of input) {
    if (char in OPENING) {
      stack.push(OPENING[char])
    } else if (CLOSING.has(char)) {
      if (stack.pop() !== char) {
        throw new Error('unbalanced brackets')
      }
    } else if (char === '|' && stack.length > 0) {
      throw new Error('"|" inside brackets')
    } else if (char === separator && stack.length === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (stack.length > 0) {
    throw new Error('unbalanced brackets')
  }
  parts.push(current.trim())

  return parts
}

const parseTag = (tag: string): Pick<AttackEffect, 'label' | 'save' | 'saveMod'> => {
  const match = tag.match(SAVE_TAG_RE)
  // a save name followed by a letter or a space and a letter is just a label: "poisonous", "poison ivy"
  if (!match || /^\s*[^\s(+\-\d]/.test(match[2])) {
    return { label: tag, save: null, saveMod: 0 }
  }

  const save = match[1].toLowerCase() as SaveType
  const rest = match[2].trim()
  if (rest === '') {
    return { label: save, save, saveMod: 0 }
  }

  const bonus = rest.match(SAVE_BONUS_RE)
  if (!bonus) {
    throw new Error(`invalid save tag "${tag}", use ${save}(+N) or ${save}(-N)`)
  }
  if (!bonus[1]) {
    throw new Error(`save bonus needs a sign: ${save}(+${bonus[2]}) or ${save}(-${bonus[2]})`)
  }

  return { label: save, save, saveMod: parseInt(`${bonus[1]}${bonus[2]}`, 10) }
}

const parseModifier = (text: string, hasSave: boolean): Modifier => {
  if (FORMULA_RE.test(text)) {
    return { damage: normalizeFormula(text), kind: ModifierKind.ExtraDamage }
  }

  const match = text.match(NAMED_MODIFIER_RE)
  if (!match) {
    throw new Error(`unknown modifier "${text}"`)
  }

  const name = match[1].toLowerCase()
  // eslint-disable-next-line no-undefined
  const args = match[2] === undefined ? [] : splitTopLevel(match[2], ',').map(normalizeFormula)
  if (args.some((a) => a === '')) {
    throw new Error(`empty argument in ${name}`)
  }
  const requireSave = (): void => {
    if (!hasSave) {
      throw new Error(`${name} requires a save tag`)
    }
  }

  switch (name) {
    case ModifierKind.Paralyze:
      if (args.length > 1) {
        throw new Error('paralyze takes at most one argument')
      }

      return { duration: args[0] ?? null, kind: ModifierKind.Paralyze }

    case ModifierKind.SaveOrDie:
      if (args.length > 0) {
        throw new Error('save_or_die takes no arguments')
      }
      requireSave()

      return { kind: ModifierKind.SaveOrDie }

    case ModifierKind.SaveForHalf:
      if (args.length === 0) {
        throw new Error('save_for_half requires a damage formula')
      }
      if (args.length > 1) {
        throw new Error('save_for_half takes one argument')
      }
      requireSave()

      return { damage: args[0], kind: ModifierKind.SaveForHalf }

    case ModifierKind.DamageEachRound:
      if (args.length === 0) {
        throw new Error('damage_each_round requires a damage formula')
      }
      if (args.length > 2) {
        throw new Error('damage_each_round takes at most two arguments')
      }

      return { damage: args[0], duration: args[1] ?? null, kind: ModifierKind.DamageEachRound }

    default:
      throw new Error(`unknown modifier "${match[1]}"`)
  }
}

const parseEffect = (inner: string): AttackEffect => {
  if (inner.trim() === '') {
    throw new Error('missing tag')
  }

  const [tag, ...modifierTexts] = splitTopLevel(inner, ',')
  if (tag === '') {
    throw new Error('missing tag')
  }
  if (modifierTexts.some((m) => m === '')) {
    throw new Error('empty modifier')
  }

  const { label, save, saveMod } = parseTag(tag)
  if (save !== null && modifierTexts.length === 0) {
    throw new Error(`save tag without modifiers: "${tag}" does nothing`)
  }

  return { label, modifiers: modifierTexts.map((m) => parseModifier(m, save !== null)), save, saveMod }
}

// One attack: a damage formula with an optional effect in brackets, e.g. "d6[poison(-2),save_or_die]"
export const parseAttack = (source: string): Attack => {
  const text = source.trim()

  try {
    splitTopLevel(text, ',')

    const open = text.indexOf('[')
    if (open === -1) {
      return { damage: normalizeFormula(text), effect: null, source: text }
    }
    if (!text.endsWith(']')) {
      throw new Error('unexpected text after "]"')
    }

    const damage = normalizeFormula(text.slice(0, open))
    if (damage === '') {
      throw new Error('missing damage formula')
    }

    return { damage, effect: parseEffect(text.slice(open + 1, -1)), source: text }
  } catch (err) {
    throw new Error(`${(err as Error).message} in "${text}"`)
  }
}

// The whole damage field: options separated by "|", attacks of an option separated by ","
export const parseDamage = (input: string): AttackOption[] => {
  if (input.trim() === '') {
    throw new Error('empty damage')
  }

  const fail = (message: string): never => {
    throw new Error(`${message} in "${input.trim()}"`)
  }

  let options: string[] = []
  try {
    options = splitTopLevel(input, '|')
  } catch (err) {
    fail((err as Error).message)
  }

  return options.map((option) => {
    if (option === '') {
      fail('empty option')
    }

    const attacks = splitTopLevel(option, ',')
    if (attacks.some((a) => a === '')) {
      fail('empty attack')
    }

    return attacks.map(parseAttack)
  })
}

// The weapon formula and every formula used by modifiers, for validation
export const getFormulasOf = ({ damage, effect }: Attack): string[] => {
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
