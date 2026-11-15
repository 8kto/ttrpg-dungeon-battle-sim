import { DamageField } from '../DamageField'

const fieldTemplate = `
  <tbody class="char">
    <tr><td>
      <input class="damage-input" hidden />
      <div class="damage-error" hidden></div>
      <div class="damage-preview" hidden></div>
      <button class="damage-toggle">Damage</button>
    </td></tr>
  </tbody>`

describe('DamageField', () => {
  let group: HTMLElement

  const setUp = (damage: string): void => {
    document.body.innerHTML = `<table>${fieldTemplate}</table>`
    group = document.querySelector('tbody') as HTMLElement
    input().value = damage
    new DamageField().attach(group)
  }

  const input = (): HTMLInputElement => group.querySelector('.damage-input') as HTMLInputElement
  const error = (): HTMLElement => group.querySelector('.damage-error') as HTMLElement
  const preview = (): HTMLElement => group.querySelector('.damage-preview') as HTMLElement
  const toggle = (): HTMLButtonElement => group.querySelector('.damage-toggle') as HTMLButtonElement
  const type = (value: string): void => {
    input().value = value
    input().dispatchEvent(new Event('input'))
  }
  const press = (key: string): void => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key }))
  }
  const chips = (): string[] =>
    Array.from(preview().querySelectorAll('.damage-chip')).map((chip) =>
      Array.from(chip.children)
        .map((part) => part.textContent)
        .join(' | '),
    )

  describe('view mode', () => {
    beforeEach(() => setUp('d6, d4'))

    it('shows only chips for valid damage', () => {
      expect(input().hidden).toBe(true)
      expect(error().hidden).toBe(true)
      expect(preview().hidden).toBe(false)
      expect(chips()).toEqual(['d6', 'd4'])
      expect(toggle().textContent).toBe('Damage')
    })

    it('opens the input with the Damage label and applies it with Done', () => {
      toggle().click()
      expect(input().hidden).toBe(false)
      expect(document.activeElement).toBe(input())
      expect(toggle().textContent).toBe('Done')

      toggle().click()
      expect(input().hidden).toBe(true)
      expect(toggle().textContent).toBe('Damage')
    })

    it('opens the input with a click on the chips', () => {
      preview().click()
      expect(input().hidden).toBe(false)
    })

    it.each(['Enter', 'Escape'])('closes the input with %s', (key) => {
      toggle().click()
      press(key)
      expect(input().hidden).toBe(true)
    })

    it('keeps chips live while editing', () => {
      toggle().click()
      type('d8 | d10')
      expect(chips()).toEqual(['d8', 'd10'])
      expect(preview().hidden).toBe(false)
    })
  })

  describe('invalid damage', () => {
    it('opens the input on attach', () => {
      setUp('d6[')
      expect(input().hidden).toBe(false)
      expect(error().hidden).toBe(false)
      expect(preview().hidden).toBe(true)
      expect(toggle().textContent).toBe('Done')
    })

    it('shows parser errors as they are typed', () => {
      setUp('d6')
      toggle().click()
      type('d6[poison]')
      expect(error().hidden).toBe(false)
      expect(error().textContent).toBe('save tag without modifiers: "poison" does nothing in "d6[poison]"')
      expect(input().classList).toContain('damage-input--invalid')
      expect(preview().hidden).toBe(true)

      type('d6[poison, save_or_die]')
      expect(error().hidden).toBe(true)
      expect(input().classList).not.toContain('damage-input--invalid')
      expect(preview().hidden).toBe(false)
    })

    it('opens the input when the value becomes invalid', () => {
      setUp('d6')
      type('d6[')
      expect(input().hidden).toBe(false)
    })

    it('shows invalid formulas', () => {
      setUp('d6x')
      expect(error().textContent).toBe('invalid damage formula "d6x"')
    })

    it('cannot be closed until fixed', () => {
      setUp('d6')
      toggle().click()
      type('')
      toggle().click()
      press('Enter')
      expect(input().hidden).toBe(false)
      expect(error().textContent).toBe('no damage formula')

      type('d8')
      press('Enter')
      expect(input().hidden).toBe(true)
    })
  })

  describe('chips', () => {
    it('show a plain formula', () => {
      setUp('2d6+1')
      expect(chips()).toEqual(['2d6+1'])
    })

    it('show attacks of one turn and options', () => {
      setUp('d6, d4 | d10')
      expect(chips()).toEqual(['d6', 'd4', 'd10'])
      expect(Array.from(preview().querySelectorAll('.damage-preview__option')).map((o) => o.children.length)).toEqual([
        2, 1,
      ])
      expect(preview().querySelectorAll('.damage-preview__or')).toHaveLength(1)
    })

    it('describe effects', () => {
      setUp(
        'd6[claws], d4[poison(-2), save_or_die] | d8[paralyze, paralyze(d4)], d6[breath, save_for_half(2d6)], ' +
          'd4[fire, damage_each_round(d4, 3), d6], d4[magic(+1), damage_each_round(1)], d4[device, paralyze]',
      )
      expect(chips()).toEqual([
        'd6 | claws',
        'd4 | Save vs Poison (-2) | save or die',
        'd8 | Save vs Paralyze | paralyze d4',
        'd6 | Save vs Breath | 2d6, half on save',
        'd4 | fire | d4/round ×3 | +d6',
        'd4 | Save vs Magic (+1) | 1/round',
        'd4 | Save vs Device | paralyze ∞',
      ])
    })

    it('are colored by the save type', () => {
      setUp('d6, d6[claws], d4[poison, save_or_die], d4[paralyze, paralyze]')
      expect(Array.from(preview().querySelectorAll('.damage-chip')).map((c) => c.className)).toEqual([
        'damage-chip',
        'damage-chip damage-chip--tag',
        'damage-chip damage-chip--poison',
        'damage-chip damage-chip--paralyze',
      ])
    })
  })
})
