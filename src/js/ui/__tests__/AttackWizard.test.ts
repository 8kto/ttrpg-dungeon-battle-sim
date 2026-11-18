import { query } from '../../utils/dom'
import { AttackWizard } from '../AttackWizard'
import { DamageField } from '../DamageField'

const dialogTemplate = `
  <dialog id="attack-wizard">
    <p class="attack-wizard__notice" hidden></p>
    <div class="attack-wizard__options"></div>
    <code class="attack-wizard__code"></code>
    <div class="attack-wizard__preview"></div>
    <div class="attack-wizard__errors" hidden><ul class="attack-wizard__error-list"></ul></div>
    <button class="attack-wizard__apply"></button>
  </dialog>`

describe('AttackWizard', () => {
  let dialog: HTMLDialogElement
  let wizard: AttackWizard
  let onApply: jest.Mock

  const open = (damage: string): void => {
    wizard.open(damage, onApply)
  }

  const $ = <T extends HTMLElement>(selector: string): T => dialog.querySelector(selector) as T
  const $$ = <T extends HTMLElement>(selector: string): T[] => Array.from(dialog.querySelectorAll<T>(selector))
  const code = (): string | null => $('.attack-wizard__code').textContent
  const clickText = (text: string, scope: ParentNode = dialog): void => {
    const target = Array.from(scope.querySelectorAll('button')).find((b) => b.textContent === text)
    if (!target) {
      throw new Error(`No button "${text}"`)
    }
    target.click()
  }
  const attacks = (): HTMLElement[] => $$('.attack-wizard__attack')
  const selectTag = (value: string, attack: number = 0): void => {
    const select = attacks()[attack].querySelector('.attack-wizard__tag') as HTMLSelectElement
    select.value = value
    select.dispatchEvent(new Event('change'))
  }
  const type = (input: HTMLInputElement, value: string): void => {
    input.value = value
    input.dispatchEvent(new Event('input'))
  }

  beforeEach(() => {
    document.body.innerHTML = dialogTemplate
    dialog = document.getElementById('attack-wizard') as HTMLDialogElement
    // jsdom does not implement the dialog API
    dialog.showModal = jest.fn(() => dialog.setAttribute('open', ''))
    dialog.close = jest.fn(() => dialog.removeAttribute('open'))
    wizard = new AttackWizard(dialog)
    onApply = jest.fn()
  })

  describe('open', () => {
    it('shows the current damage', () => {
      open('d6, d4 | d8[poison(-2), save_or_die]')
      expect(dialog.showModal).toHaveBeenCalled()
      expect(code()).toBe('d6, d4 | d8[poison(-2), save_or_die]')
      expect($$('.attack-wizard__option')).toHaveLength(2)
      expect(attacks()).toHaveLength(3)
      expect($('.attack-wizard__notice').hidden).toBe(true)
    })

    it('starts over when the damage is invalid', () => {
      open('d6[')
      expect(code()).toBe('d6')
      expect($('.attack-wizard__notice').hidden).toBe(false)
    })

    it('starts over silently when the damage is empty', () => {
      open('')
      expect(code()).toBe('d6')
      expect($('.attack-wizard__notice').hidden).toBe(true)
    })
  })

  describe('formulas', () => {
    beforeEach(() => open('d6'))

    it('are built by clicks on dice and constants', () => {
      const field = $('.formula-field')
      clickText('d6', field)
      clickText('+1', field)
      expect(code()).toBe('2d6+1')

      clickText('d4', field)
      expect(code()).toBe('d4+1')

      clickText('⌫', field)
      clickText('d20', field)
      clickText('−1', field)
      expect(code()).toBe('d20-1')
    })

    it('are read-only', () => {
      const input = $<HTMLInputElement>('.formula-field__input')
      expect(input.readOnly).toBe(true)
      expect(input.value).toBe('d6')
    })

    it('outline an empty damage', () => {
      const input = $<HTMLInputElement>('.formula-field__input')
      clickText('⌫', $('.formula-field'))
      expect(input.value).toBe('')
      expect(input.classList).toContain('damage-input--invalid')
      expect($<HTMLButtonElement>('.attack-wizard__apply').disabled).toBe(true)

      clickText('d8', $('.formula-field'))
      expect(input.classList).not.toContain('damage-input--invalid')
      expect(input.value).toBe('d8')
    })

    it('allow an empty duration', () => {
      selectTag('label')
      type($('.attack-wizard__label'), 'fire')
      clickText('+ Damage each round')
      const [, duration] = $$('.attack-wizard__modifier .formula-field')
      const input = query<HTMLInputElement>(duration, '.formula-field__input')
      expect(input.value).toBe('')
      expect(input.placeholder).toBe('whole battle')
      expect(input.classList).not.toContain('damage-input--invalid')

      clickText('+1', duration)
      expect(input.value).toBe('1')
      expect(code()).toBe('d6[fire, damage_each_round(d4, 1)]')
    })
  })

  describe('options and attacks', () => {
    beforeEach(() => open('d6'))

    it('adds attacks of one turn and alternative options', () => {
      clickText('+ Attack this turn')
      clickText('+ Alternative option')
      expect(code()).toBe('d6, d6 | d6')
    })

    it('removes attacks and options', () => {
      clickText('+ Attack this turn')
      clickText('+ Alternative option')
      clickText('×', attacks()[0])
      expect(code()).toBe('d6 | d6')

      clickText('×', $$('.attack-wizard__option')[1])
      expect(code()).toBe('d6')
      expect($$('.attack-wizard__remove')).toHaveLength(0)
    })
  })

  describe('effects', () => {
    beforeEach(() => open('d6'))

    it('treats an empty label as no effect', () => {
      selectTag('label')
      expect(code()).toBe('d6')
      expect($('.attack-wizard__errors').hidden).toBe(true)
    })

    it('requires a label for modifiers', () => {
      selectTag('label')
      clickText('+ Extra damage')
      expect($('.attack-wizard__label').classList).toContain('damage-input--invalid')
      expect($('.attack-wizard__errors').hidden).toBe(false)

      type($('.attack-wizard__label'), 'fire')
      expect($('.attack-wizard__label').classList).not.toContain('damage-input--invalid')
      expect(code()).toBe('d6[fire, d6]')
    })

    it('adds a label', () => {
      selectTag('label')
      type($('.attack-wizard__label'), 'claws')
      expect(code()).toBe('d6[claws]')
    })

    it.each(['claws!', 'fire, d6', 'a[b]', 'x | y', '🧊(2)'])('rejects the label "%s"', (label) => {
      selectTag('label')
      type($('.attack-wizard__label'), label)
      expect($('.attack-wizard__label').classList).toContain('damage-input--invalid')
      expect($$('.attack-wizard__error-list li').map((li) => li.textContent)).toEqual([
        `label "${label}" may contain only letters, digits, emojis, "_", "-" and spaces`,
      ])
      expect($<HTMLButtonElement>('.attack-wizard__apply').disabled).toBe(true)
    })

    it.each(['fire_breath', 'Ice-2', 'poison ivy', '🧊', 'ice 🧊', '🧙🏽‍♂️', '❄️'])('accepts the label "%s"', (label) => {
      selectTag('label')
      type($('.attack-wizard__label'), label)
      expect($('.attack-wizard__label').classList).not.toContain('damage-input--invalid')
      expect($('.attack-wizard__errors').hidden).toBe(true)
    })

    it.each(['Poison', 'magic 2'])('rejects the label "%s" that reads as a save', (label) => {
      selectTag('label')
      type($('.attack-wizard__label'), label)
      clickText('+ Paralyze')
      expect($('.attack-wizard__label').classList).toContain('damage-input--invalid')
      expect($$('.attack-wizard__error-list li').map((li) => li.textContent)).toEqual([
        `label "${label}" reads as a save, choose "Save vs …" instead`,
      ])
      expect($<HTMLButtonElement>('.attack-wizard__apply').disabled).toBe(true)
    })

    it('drops save-only modifiers without a save', () => {
      selectTag('poison')
      clickText('+ Save or die')
      clickText('+ Paralyze')
      selectTag('label')
      type($('.attack-wizard__label'), 'fire')
      expect(code()).toBe('d6[fire, paralyze]')
      expect($('.attack-wizard__errors').hidden).toBe(true)

      selectTag('none')
      selectTag('poison')
      expect(code()).toBe('d6[poison, paralyze]')
    })

    it('adds a save with a bonus and modifiers', () => {
      selectTag('poison')
      expect($('.attack-wizard__errors').hidden).toBe(false)
      expect($$('.attack-wizard__error-list li').map((li) => li.textContent)).toEqual([
        'save tag without modifiers: "poison" does nothing in "d6[poison]"',
      ])
      expect($<HTMLButtonElement>('.attack-wizard__apply').disabled).toBe(true)

      clickText('+ Save or die')
      type($('.attack-wizard__save-mod input'), '-2')
      expect(code()).toBe('d6[poison(-2), save_or_die]')
      expect($('.attack-wizard__errors').hidden).toBe(true)
      expect($<HTMLButtonElement>('.attack-wizard__apply').disabled).toBe(false)
    })

    it('adds every modifier with editable formulas', () => {
      selectTag('breath')
      clickText('+ Paralyze')
      clickText('+ Save for half')
      clickText('+ Extra damage')
      clickText('+ Damage each round')
      expect(code()).toBe('d6[breath, paralyze, save_for_half(d6), d6, damage_each_round(d4)]')

      const modifiers = $$('.attack-wizard__modifier')
      clickText('d4', modifiers[0])
      clickText('+1', modifiers[3].querySelectorAll('.formula-field')[1])
      clickText('+1', modifiers[3].querySelectorAll('.formula-field')[1])
      expect(code()).toBe('d6[breath, paralyze(d4), save_for_half(d6), d6, damage_each_round(d4, 2)]')

      clickText('×', modifiers[1])
      expect(code()).toBe('d6[breath, paralyze(d4), d6, damage_each_round(d4, 2)]')
    })

    it('allows save-only modifiers with a save', () => {
      selectTag('label')
      const disabled = $$<HTMLButtonElement>('.attack-wizard__add-modifiers button')
        .filter((b) => b.disabled)
        .map((b) => b.textContent)
      expect(disabled).toEqual(['+ Save or die', '+ Save for half'])
    })

    it('keeps the label and modifiers while switching the effect', () => {
      selectTag('label')
      type($('.attack-wizard__label'), 'fire')
      clickText('+ Extra damage')
      selectTag('none')
      expect(code()).toBe('d6')

      selectTag('label')
      expect(code()).toBe('d6[fire, d6]')
    })

    it('edits parsed effects', () => {
      open('d4[fire, damage_each_round(d4, 3)]')
      const select = $<HTMLSelectElement>('.attack-wizard__tag')
      expect(select.value).toBe('label')
      expect($<HTMLInputElement>('.attack-wizard__label').value).toBe('fire')

      selectTag('magic')
      expect(code()).toBe('d4[magic, damage_each_round(d4, 3)]')
    })
  })

  describe('apply', () => {
    it('passes the damage and closes the dialog', () => {
      open('d6')
      clickText('d8', $('.formula-field'))
      $('.attack-wizard__apply').click()
      expect(onApply).toHaveBeenCalledWith('d8')
      expect(dialog.close).toHaveBeenCalled()
    })

    it('does nothing while the damage is invalid', () => {
      open('d6')
      clickText('⌫', $('.formula-field'))
      $('.attack-wizard__apply').click()
      expect(onApply).not.toHaveBeenCalled()
      expect(dialog.close).not.toHaveBeenCalled()
    })
  })

  describe('in DamageField', () => {
    const setUp = (withWizard: boolean): HTMLElement => {
      document.body.insertAdjacentHTML(
        'beforeend',
        `<table><tbody class="char"><tr><td>
          <input class="damage-input" value="d6" hidden />
          <div class="damage-error" hidden></div>
          <div class="damage-preview" hidden></div>
          <button class="damage-toggle">Damage</button>
          <button class="damage-wizard-btn"></button>
        </td></tr></tbody></table>`,
      )
      const group = document.querySelector('tbody.char') as HTMLElement
      new DamageField(withWizard ? wizard : null).attach(group)

      return group
    }

    it('applies the wizard damage to the field', () => {
      const group = setUp(true)
      ;(group.querySelector('.damage-wizard-btn') as HTMLElement).click()
      expect(code()).toBe('d6')

      clickText('+ Attack this turn')
      $('.attack-wizard__apply').click()
      expect((group.querySelector('.damage-input') as HTMLInputElement).value).toBe('d6, d6')
      expect(group.querySelectorAll('.damage-preview .damage-chip')).toHaveLength(2)
    })

    it('hides the button without a wizard', () => {
      const group = setUp(false)
      expect((group.querySelector('.damage-wizard-btn') as HTMLElement).hidden).toBe(true)
    })
  })
})
