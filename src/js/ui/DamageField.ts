import { DamageParser } from '../services/attacks/DamageParser'
import type { IDamageParser } from '../services/attacks/IDamageParser'
import type { Attack, AttackOption, Modifier } from '../services/attacks/types'
import { ModifierKind } from '../services/attacks/types'
import { messages } from '../services/messages/MessageService'
import { MaxStrategy } from '../services/strategies/MaxStrategy'
import { DamageValidator } from '../services/validation/DamageValidator'
import type { IDamageValidator } from '../services/validation/IDamageValidator'
import { el, onClick } from '../utils/dom'
import { capitalize } from '../utils/text'
import type { IAttackWizard } from './IAttackWizard'

type FieldElements = {
  input: HTMLInputElement
  error: HTMLElement
  preview: HTMLElement
  toggle: HTMLButtonElement
  wizardButton: HTMLButtonElement | null
}

const signed = (n: number): string => (n > 0 ? `+${n}` : String(n))

const describeModifier = (modifier: Modifier): string => {
  switch (modifier.kind) {
    case ModifierKind.Paralyze:
      return modifier.duration === null
        ? messages.t('ui.damageChip.paralyzeForever')
        : messages.t('ui.damageChip.paralyze', { duration: modifier.duration })
    case ModifierKind.SaveOrDie:
      return messages.t('ui.damageChip.saveOrDie')
    case ModifierKind.SaveForHalf:
      return messages.t('ui.damageChip.saveForHalf', { damage: modifier.damage })
    case ModifierKind.ExtraDamage:
      return messages.t('ui.damageChip.extraDamage', { damage: modifier.damage })
    case ModifierKind.DamageEachRound:
      return modifier.duration === null
        ? messages.t('ui.damageChip.damageEachRound', { damage: modifier.damage })
        : messages.t('ui.damageChip.damageEachRoundFor', { damage: modifier.damage, duration: modifier.duration })
    default:
      throw new Error(`Unknown modifier: ${JSON.stringify(modifier)}`)
  }
}

const renderChip = ({ damage, effect }: Attack): HTMLElement => {
  const chip = el('span', 'damage-chip')
  chip.appendChild(el('span', 'damage-chip__formula', damage))

  if (effect) {
    chip.classList.add(effect.save ? `damage-chip--${effect.save}` : 'damage-chip--tag')
    const save = effect.save && capitalize(effect.save)
    const tag = !save
      ? effect.label
      : effect.saveMod
        ? messages.t('ui.damageChip.saveVsWithMod', { mod: signed(effect.saveMod), save })
        : messages.t('ui.damageChip.saveVs', { save })
    chip.appendChild(el('span', 'damage-chip__tag', tag))
    effect.modifiers.forEach((m) => chip.appendChild(el('span', 'damage-chip__modifier', describeModifier(m))))
  }

  return chip
}

// Damage of a character shown as chips of the parsed attacks; the input opens with the Damage label
// or a click on the chips, closes with the same label (now "Done"), and stays open while the damage is invalid;
// the wizard button edits the damage in the attack wizard
export class DamageField {
  constructor(
    private readonly wizard: IAttackWizard | null = null,
    private readonly damageParser: IDamageParser = new DamageParser(),
    // formula validity doesn't depend on the strategy
    private readonly damageValidator: IDamageValidator = new DamageValidator(new MaxStrategy(), damageParser),
  ) {}

  // chips of every attack, options separated by "or"
  static renderAttackOptions(container: HTMLElement, options: AttackOption[]): void {
    container.replaceChildren()
    options.forEach((attacks, i) => {
      if (i > 0) {
        container.appendChild(el('span', 'damage-preview__or', messages.t('ui.damageChip.or')))
      }
      const option = el('span', 'damage-preview__option')
      attacks.forEach((attack) => option.appendChild(renderChip(attack)))
      container.appendChild(option)
    })
  }

  // binds the field of a character group; call it again for cloned groups, as listeners are not cloned
  attach(group: HTMLElement): void {
    const elements = this.getElements(group)
    if (!elements) {
      return
    }

    const { input, preview, toggle, wizardButton } = elements
    input.addEventListener('input', (): void => this.setEditing(elements, !input.hidden))
    input.addEventListener('keydown', (e): void => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        this.setEditing(elements, false)
      }
    })
    onClick(toggle, () => this.setEditing(elements, input.hidden))
    preview.addEventListener('click', (): void => this.setEditing(elements, true))
    // without the wizard the button would do nothing
    if (wizardButton) {
      wizardButton.hidden = !this.wizard
      onClick(wizardButton, () =>
        this.wizard?.open(input.value, (damage) => {
          input.value = damage
          this.setEditing(elements, false)
        }),
      )
    }

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
    const wizardButton = group.querySelector<HTMLButtonElement>('.damage-wizard-btn')

    return { error, input, preview, toggle, wizardButton }
  }

  // invalid damage keeps the input open; chips are shown only while it's closed
  private setEditing(elements: FieldElements, editing: boolean): void {
    const { input, preview, toggle } = elements
    const valid = this.render(elements)
    const open = editing || !valid
    const opening = open && input.hidden

    input.hidden = !open
    preview.hidden = open
    toggle.textContent = messages.t(open ? 'ui.damageToggle.open' : 'ui.damageToggle.closed')
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

    if (errors.length > 0) {
      preview.replaceChildren()

      return false
    }
    DamageField.renderAttackOptions(preview, this.damageParser.parseDamage(damage))

    return true
  }
}
