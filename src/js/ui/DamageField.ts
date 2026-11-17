import { DamageParser } from '../services/attacks/DamageParser'
import type { IDamageParser } from '../services/attacks/IDamageParser'
import type { Attack, Modifier } from '../services/attacks/types'
import { ModifierKind } from '../services/attacks/types'
import { MaxStrategy } from '../services/strategies/MaxStrategy'
import { DamageValidator } from '../services/validation/DamageValidator'
import type { IDamageValidator } from '../services/validation/IDamageValidator'
import { capitalize } from '../utils/text'

type FieldElements = {
  input: HTMLInputElement
  error: HTMLElement
  preview: HTMLElement
  toggle: HTMLButtonElement
}

const el = (tag: string, className: string, text: string = ''): HTMLElement => {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text

  return node
}

const signed = (n: number): string => (n > 0 ? `+${n}` : String(n))

const describeModifier = (modifier: Modifier): string => {
  switch (modifier.kind) {
    case ModifierKind.Paralyze:
      return modifier.duration === null ? 'paralyze ∞' : `paralyze ${modifier.duration}`
    case ModifierKind.SaveOrDie:
      return 'save or die'
    case ModifierKind.SaveForHalf:
      return `${modifier.damage}, half on save`
    case ModifierKind.ExtraDamage:
      return `+${modifier.damage}`
    case ModifierKind.DamageEachRound:
      return `${modifier.damage}/round${modifier.duration === null ? '' : ` ×${modifier.duration}`}`
    default:
      throw new Error(`Unknown modifier: ${JSON.stringify(modifier)}`)
  }
}

const renderChip = ({ damage, effect }: Attack): HTMLElement => {
  const chip = el('span', 'damage-chip')
  chip.appendChild(el('span', 'damage-chip__formula', damage))

  if (effect) {
    chip.classList.add(effect.save ? `damage-chip--${effect.save}` : 'damage-chip--tag')
    const tag = effect.save
      ? `Save vs ${capitalize(effect.save)}${effect.saveMod ? ` (${signed(effect.saveMod)})` : ''}`
      : effect.label
    chip.appendChild(el('span', 'damage-chip__tag', tag))
    effect.modifiers.forEach((m) => chip.appendChild(el('span', 'damage-chip__modifier', describeModifier(m))))
  }

  return chip
}

// Damage of a character shown as chips of the parsed attacks; the input opens with the Damage label
// or a click on the chips, closes with the same label (now "Done"), and stays open while the damage is invalid
export class DamageField {
  constructor(
    private readonly damageParser: IDamageParser = new DamageParser(),
    // formula validity doesn't depend on the strategy
    private readonly damageValidator: IDamageValidator = new DamageValidator(new MaxStrategy(), damageParser),
  ) {}

  // binds the field of a character group; call it again for cloned groups, as listeners are not cloned
  attach(group: HTMLElement): void {
    const elements = this.getElements(group)
    if (!elements) {
      return
    }

    const { input, preview, toggle } = elements
    input.addEventListener('input', (): void => this.setEditing(elements, !input.hidden))
    input.addEventListener('keydown', (e): void => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        this.setEditing(elements, false)
      }
    })
    toggle.addEventListener('click', (e): void => {
      e.preventDefault()
      this.setEditing(elements, input.hidden)
    })
    preview.addEventListener('click', (): void => this.setEditing(elements, true))

    this.setEditing(elements, false)
  }

  private getElements(group: HTMLElement): FieldElements | null {
    const input = group.querySelector<HTMLInputElement>('.damage-input')
    const error = group.querySelector<HTMLElement>('.damage-error')
    const preview = group.querySelector<HTMLElement>('.damage-preview')
    const toggle = group.querySelector<HTMLButtonElement>('.damage-toggle')
    if (!input || !error || !preview || !toggle) {
      return null
    }

    return { error, input, preview, toggle }
  }

  // invalid damage keeps the input open; chips are shown only while it's closed
  private setEditing(elements: FieldElements, editing: boolean): void {
    const { input, preview, toggle } = elements
    const valid = this.render(elements)
    const open = editing || !valid
    const opening = open && input.hidden

    input.hidden = !open
    preview.hidden = open
    toggle.textContent = open ? 'Done' : 'Damage'
    if (opening) {
      input.focus()
    }
  }

  // returns whether the damage is valid
  private render({ error, input, preview }: FieldElements): boolean {
    const damage = input.value
    const errors = this.damageValidator.validate(damage)

    input.classList.toggle('damage-input--invalid', errors.length > 0)
    error.textContent = errors.join('; ')
    error.hidden = errors.length === 0

    preview.replaceChildren()
    if (errors.length > 0) {
      return false
    }

    this.damageParser.parseDamage(damage).forEach((attacks, i) => {
      if (i > 0) {
        preview.appendChild(el('span', 'damage-preview__or', 'or'))
      }
      const option = el('span', 'damage-preview__option')
      attacks.forEach((attack) => option.appendChild(renderChip(attack)))
      preview.appendChild(option)
    })

    return true
  }
}
