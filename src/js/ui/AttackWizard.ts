import { Dice } from 'ttrpg-lib-dice'

import { DamageFormula } from '../services/attacks/DamageFormula'
import { DamageParser } from '../services/attacks/DamageParser'
import { DamageSerializer } from '../services/attacks/DamageSerializer'
import type { IDamageFormula } from '../services/attacks/IDamageFormula'
import type { IDamageParser } from '../services/attacks/IDamageParser'
import type { IDamageSerializer, SerializableAttack } from '../services/attacks/IDamageSerializer'
import type { Attack, Modifier } from '../services/attacks/types'
import { ModifierKind, SaveType } from '../services/attacks/types'
import { messages } from '../services/messages/MessageService'
import { MaxStrategy } from '../services/strategies/MaxStrategy'
import { DamageValidator } from '../services/validation/DamageValidator'
import type { DamageCheck, IDamageValidator } from '../services/validation/IDamageValidator'
import { button, el, onClick, query } from '../utils/dom'
import { capitalize } from '../utils/text'
import { DamageField } from './DamageField'
import type { DraftAttack, IAttackWizard } from './IAttackWizard'

// Builds the damage of a character by clicks: alternative options, attacks of a turn, their effects and modifiers.
// The dialog markup (#attack-wizard) holds the static parts, the editor is rendered into .attack-wizard__options
export class AttackWizard implements IAttackWizard {
  private static readonly DICE: readonly number[] = [Dice.d4, Dice.d6, Dice.d8, Dice.d10, Dice.d12, Dice.d20]
  private static readonly SAVE_ONLY: ReadonlySet<ModifierKind> = new Set([
    ModifierKind.SaveOrDie,
    ModifierKind.SaveForHalf,
  ])
  // no brackets, commas or pipes of the damage syntax; emojis may have skin tones and be joined: 🧊, 🧙🏽‍♂️
  private static readonly LABEL_RE: RegExp = /^(?:[\w\p{Extended_Pictographic}\p{Emoji_Modifier} -]|\u200d|\ufe0f)+$/u

  private static newAttack(): DraftAttack {
    return {
      damage: 'd6',
      label: '',
      modifiers: [],
      save: SaveType.Poison,
      saveMod: 0,
      tag: 'none',
    }
  }

  private static newModifier(kind: ModifierKind): Modifier {
    switch (kind) {
      case ModifierKind.Paralyze:
        return { duration: null, kind }
      case ModifierKind.SaveOrDie:
        return { kind }
      case ModifierKind.SaveForHalf:
      case ModifierKind.ExtraDamage:
        return { damage: 'd6', kind }
      case ModifierKind.DamageEachRound:
        return { damage: 'd4', duration: null, kind }
      default:
        throw new Error(`Unknown modifier: ${kind}`)
    }
  }

  private static toDraft({ damage, effect }: Attack): DraftAttack {
    return {
      damage,
      label: effect && effect.save === null ? effect.label : '',
      modifiers: effect ? effect.modifiers.map((m) => ({ ...m })) : [],
      save: effect?.save ?? SaveType.Poison,
      saveMod: effect?.saveMod ?? 0,
      tag: !effect ? 'none' : effect.save ? 'save' : 'label',
    }
  }

  private static toAttack({ damage, label, modifiers, save, saveMod, tag }: DraftAttack): SerializableAttack {
    switch (tag) {
      case 'none':
        return { damage: damage.trim(), effect: null }
      case 'label':
        // an empty label labels nothing; with modifiers it's still required by the syntax
        return label.trim() === '' && modifiers.length === 0
          ? { damage: damage.trim(), effect: null }
          : { damage: damage.trim(), effect: { label: label.trim(), modifiers, save: null, saveMod: 0 } }
      case 'save':
        return { damage: damage.trim(), effect: { label: save, modifiers, save, saveMod } }
    }
  }

  private draft: DraftAttack[][] = []
  private onApply: ((damage: string) => void) | null = null

  private readonly options: HTMLElement
  private readonly notice: HTMLElement
  private readonly code: HTMLElement
  private readonly preview: HTMLElement
  private readonly errors: HTMLElement
  private readonly errorList: HTMLElement
  private readonly applyButton: HTMLButtonElement

  constructor(
    private readonly dialog: HTMLDialogElement,
    private readonly damageParser: IDamageParser = new DamageParser(),
    // formula validity doesn't depend on the strategy
    private readonly damageValidator: IDamageValidator = new DamageValidator(
      new MaxStrategy(damageParser),
      damageParser,
    ),
    private readonly damageSerializer: IDamageSerializer = new DamageSerializer(),
    private readonly damageFormula: IDamageFormula = new DamageFormula(),
  ) {
    this.options = query(dialog, '.attack-wizard__options')
    this.notice = query(dialog, '.attack-wizard__notice')
    this.code = query(dialog, '.attack-wizard__code')
    this.preview = query(dialog, '.attack-wizard__preview')
    this.errors = query(dialog, '.attack-wizard__errors')
    this.errorList = query(dialog, '.attack-wizard__error-list')
    this.applyButton = query(dialog, '.attack-wizard__apply')

    onClick(this.applyButton, () => this.apply())
  }

  open(damage: string, onApply: (damage: string) => void): void {
    this.onApply = onApply
    const { errors, options } = this.damageValidator.check(damage)
    const valid = errors.length === 0
    this.draft = valid ? options.map((attacks) => attacks.map(AttackWizard.toDraft)) : [[AttackWizard.newAttack()]]
    // damage that doesn't parse can't be edited here, the wizard starts over
    this.notice.hidden = valid || damage.trim() === ''

    this.render()
    this.dialog.showModal()
  }

  get damage(): string {
    return this.damageSerializer.serializeDamage(this.draft.map((attacks) => attacks.map(AttackWizard.toAttack)))
  }

  private apply(): void {
    const damage = this.damage
    if (this.check(damage).errors.length > 0) {
      return
    }
    this.onApply?.(damage)
    this.dialog.close()
  }

  // the whole editor, after structural changes; typing only updates the result
  private render(): void {
    this.options.replaceChildren(
      ...this.draft.map((attacks, i) => this.renderOption(attacks, i)),
      button('attack-wizard__add', messages.t('ui.attackWizard.addOption'), () => {
        this.draft.push([AttackWizard.newAttack()])
        this.render()
      }),
    )
    this.update()
  }

  // label errors come first: a label with brackets or commas may still parse, as something else
  private check(damage: string): DamageCheck {
    const labelErrors = this.draft.flat().flatMap((attack) => this.labelErrors(attack))

    return labelErrors.length > 0 ? { errors: labelErrors, options: [] } : this.damageValidator.check(damage)
  }

  // an empty label is reported by the validator, if it's required
  private labelErrors({ label, tag }: DraftAttack): string[] {
    const text = label.trim()
    if (tag !== 'label' || text === '') {
      return []
    }
    if (!AttackWizard.LABEL_RE.test(text)) {
      return [messages.t('ui.attackWizard.errors.labelChars', { label: text })]
    }
    if (this.damageParser.readsAsSave(text)) {
      return [messages.t('ui.attackWizard.errors.labelIsSave', { label: text })]
    }

    return []
  }

  private update(): void {
    const damage = this.damage
    const { errors, options } = this.check(damage)

    this.code.textContent = damage
    this.errorList.replaceChildren(...errors.map((error) => el('li', '', error)))
    this.errors.hidden = errors.length === 0
    this.applyButton.disabled = errors.length > 0
    // the chips keep their height while empty
    this.preview.hidden = errors.length > 0
    if (errors.length > 0) {
      this.preview.replaceChildren()
    } else {
      DamageField.renderAttackOptions(this.preview, options)
    }
  }

  private renderOption(attacks: DraftAttack[], index: number): HTMLElement {
    const option = el('fieldset', 'attack-wizard__option')
    const legend = el('legend', 'attack-wizard__legend', messages.t('ui.attackWizard.option', { number: index + 1 }))
    option.appendChild(legend)

    if (this.draft.length > 1) {
      legend.appendChild(
        button('attack-wizard__remove', '✕', () => {
          this.draft.splice(index, 1)
          this.render()
        }),
      )
      option.appendChild(el('p', 'attack-wizard__hint', messages.t('ui.attackWizard.optionHint')))
    }

    attacks.forEach((attack, i) => option.appendChild(this.renderAttack(attacks, attack, i)))
    option.appendChild(
      button('attack-wizard__add', messages.t('ui.attackWizard.addAttack'), () => {
        attacks.push(AttackWizard.newAttack())
        this.render()
      }),
    )

    return option
  }

  private renderAttack(attacks: DraftAttack[], attack: DraftAttack, index: number): HTMLElement {
    const card = el('div', 'attack-wizard__attack')

    const header = el('div', 'attack-wizard__attack-header')
    header.appendChild(el('span', '', messages.t('ui.attackWizard.attack', { number: index + 1 })))
    if (attacks.length > 1) {
      header.appendChild(
        button('attack-wizard__remove', '✕', () => {
          attacks.splice(index, 1)
          this.render()
        }),
      )
    }
    card.appendChild(header)

    card.appendChild(
      this.row(
        messages.t('ui.attackWizard.damage'),
        this.formulaField(attack.damage, '', (value) => (attack.damage = value)),
      ),
    )
    card.appendChild(this.row(messages.t('ui.attackWizard.effect'), ...this.renderTag(attack)))

    if (attack.tag !== 'none') {
      card.appendChild(this.renderModifiers(attack))
    }

    return card
  }

  // one select for the tag kind and the save type: "None", "Label, no save", "Save vs Poison"...
  private renderTag(attack: DraftAttack): HTMLElement[] {
    const select = el('select', 'attack-wizard__tag border rounded px-1')
    const addOption = (value: string, text: string): void => {
      const option = el('option', '', text)
      option.value = value
      select.appendChild(option)
    }
    addOption('none', messages.t('ui.attackWizard.tag.none'))
    addOption('label', messages.t('ui.attackWizard.tag.label'))
    Object.values(SaveType).forEach((save) =>
      addOption(save, messages.t('ui.attackWizard.tag.save', { save: capitalize(save) })),
    )
    select.value = attack.tag === 'save' ? attack.save : attack.tag
    select.addEventListener('change', (): void => {
      if (select.value === 'none' || select.value === 'label') {
        attack.tag = select.value
      } else {
        attack.tag = 'save'
        attack.save = select.value as SaveType
      }
      // without a save these modifiers make the damage invalid
      if (attack.tag !== 'save') {
        attack.modifiers = attack.modifiers.filter((m) => !AttackWizard.SAVE_ONLY.has(m.kind))
      }
      this.render()
    })

    if (attack.tag === 'label') {
      const input = el('input', 'attack-wizard__label border rounded px-2')
      input.type = 'text'
      input.value = attack.label
      input.placeholder = messages.t('ui.attackWizard.labelPlaceholder')
      input.setAttribute('aria-label', messages.t('ui.attackWizard.label'))
      const mark = (): void => {
        const missing = input.value.trim() === '' && attack.modifiers.length > 0
        input.classList.toggle('damage-input--invalid', missing || this.labelErrors(attack).length > 0)
      }
      input.addEventListener('input', (): void => {
        attack.label = input.value
        mark()
        this.update()
      })
      mark()

      return [select, input]
    }

    if (attack.tag === 'save') {
      const label = el('label', 'attack-wizard__save-mod', messages.t('ui.attackWizard.saveBonus'))
      const input = el('input', 'num-input border rounded px-2')
      input.type = 'number'
      input.step = '1'
      input.value = String(attack.saveMod)
      input.addEventListener('input', (): void => {
        attack.saveMod = Math.trunc(Number(input.value)) || 0
        this.update()
      })
      label.appendChild(input)

      return [select, label]
    }

    return [select]
  }

  private renderModifiers(attack: DraftAttack): HTMLElement {
    const section = el('div', 'attack-wizard__modifiers')
    section.appendChild(el('div', 'attack-wizard__subtitle', messages.t('ui.attackWizard.modifiers')))
    section.appendChild(el('p', 'attack-wizard__hint', messages.t('ui.attackWizard.modifiersHint')))

    attack.modifiers.forEach((modifier, i) => {
      const remove = button('attack-wizard__remove', '✕', () => {
        attack.modifiers.splice(i, 1)
        this.render()
      })
      remove.title = messages.t('ui.attackWizard.remove')
      const row = this.row(
        messages.t(`ui.attackWizard.modifier.${modifier.kind}`),
        ...this.renderModifierFields(modifier),
        remove,
      )
      row.classList.add('attack-wizard__modifier')
      section.appendChild(row)
    })

    const add = el('div', 'attack-wizard__add-modifiers')
    Object.values(ModifierKind).forEach((kind) => {
      const addButton = button('attack-wizard__add', messages.t(`ui.attackWizard.addModifier.${kind}`), () => {
        attack.modifiers.push(AttackWizard.newModifier(kind))
        this.render()
      })
      if (AttackWizard.SAVE_ONLY.has(kind) && attack.tag !== 'save') {
        addButton.disabled = true
        addButton.title = messages.t('ui.attackWizard.needsSave')
      }
      add.appendChild(addButton)
    })
    section.appendChild(add)

    return section
  }

  // an empty duration means "until the end of battle"
  private renderModifierFields(modifier: Modifier): HTMLElement[] {
    const wholeBattle = messages.t('ui.attackWizard.wholeBattle')
    const duration = (m: Extract<Modifier, { duration: string | null }>): HTMLElement =>
      this.formulaField(
        m.duration ?? '',
        wholeBattle,
        (value) => (m.duration = value.trim() === '' ? null : value),
        true,
      )

    switch (modifier.kind) {
      case ModifierKind.Paralyze:
        return [duration(modifier)]
      case ModifierKind.SaveOrDie:
        return []
      case ModifierKind.SaveForHalf:
      case ModifierKind.ExtraDamage:
        return [this.formulaField(modifier.damage, '', (value) => (modifier.damage = value))]
      case ModifierKind.DamageEachRound:
        return [
          this.formulaField(modifier.damage, '', (value) => (modifier.damage = value)),
          el('span', 'attack-wizard__for', messages.t('ui.attackWizard.for')),
          duration(modifier),
        ]
      default:
        throw new Error(`Unknown modifier: ${JSON.stringify(modifier)}`)
    }
  }

  // a formula built by clicks, the input is read-only: d6 adds a d6 ("d6" → "2d6"), ±1 changes the constant,
  // ⌫ clears it; a required formula is outlined while empty, an optional one shows the placeholder
  private formulaField(
    value: string,
    placeholder: string,
    onChange: (value: string) => void,
    optional: boolean = false,
  ): HTMLElement {
    const field = el('div', 'formula-field')
    const input = el('input', 'formula-field__input border rounded px-2')
    input.type = 'text'
    input.readOnly = true
    input.tabIndex = -1
    input.placeholder = placeholder
    let formula = value

    const show = (): void => {
      input.value = formula
      input.classList.toggle('damage-input--invalid', !optional && formula === '')
    }
    const set = (next: string): void => {
      formula = next
      onChange(formula)
      show()
      this.update()
    }
    show()

    const dice = el('div', 'formula-field__dice')
    AttackWizard.DICE.forEach((sides) =>
      dice.appendChild(button('formula-field__die', `d${sides}`, () => set(this.damageFormula.addDie(formula, sides)))),
    )
    dice.appendChild(button('formula-field__die', '+1', () => set(this.damageFormula.addConstant(formula, 1))))
    dice.appendChild(button('formula-field__die', '−1', () => set(this.damageFormula.addConstant(formula, -1))))
    const clear = button('formula-field__die formula-field__clear', '⌫', () => set(''))
    clear.title = messages.t('ui.attackWizard.clearFormula')
    dice.appendChild(clear)

    field.append(input, dice)

    return field
  }

  private row(label: string, ...content: HTMLElement[]): HTMLElement {
    const row = el('div', 'attack-wizard__row')
    row.appendChild(el('span', 'attack-wizard__row-label', label))
    const body = el('div', 'attack-wizard__row-body')
    body.append(...content)
    row.appendChild(body)

    return row
  }
}
