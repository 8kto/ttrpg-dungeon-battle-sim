import type { Dice } from 'ttrpg-lib-dice'

import type { Saves } from '../services/attacks/types'
import { DEFAULT_SAVES, SaveType } from '../services/attacks/types'
import { messages } from '../services/messages/MessageService'
import type { ICharacter } from '../services/types'
import type { CharStats } from '../types'
import { onClick, query } from '../utils/dom'
import { parseNumber } from '../utils/number'
import type { DamageField } from './DamageField'

const toCharStats = (char: ICharacter): CharStats => ({
  armorClass: char.armorClass,
  damage: char.damage,
  hdCount: char.hitDice[0],
  hdType: char.hitDice[1],
  prefix: char.name,
  saves: char.saves,
  toHit: char.toHit,
})

const getSaveInput = (group: HTMLElement, save: SaveType): HTMLInputElement =>
  query<HTMLInputElement>(group, `.save-input[data-save="${save}"]`)

const setSavesExpanded = (group: HTMLElement, expanded: boolean): void => {
  const toggle = query<HTMLButtonElement>(group, '.saves-toggle')
  query<HTMLElement>(group, '.saves-fields').hidden = !expanded
  toggle.setAttribute('aria-expanded', String(expanded))
  toggle.textContent = messages.t(expanded ? 'ui.savesToggle.expanded' : 'ui.savesToggle.collapsed')
}

// Editable table of characters (one side of the battle); every character is a <tbody class="char">
// with the main row, the attacks row and the saves row
export class CharTable {
  private readonly template: HTMLTableSectionElement

  constructor(
    private readonly table: HTMLTableElement,
    private readonly damageField: DamageField | null = null,
  ) {
    this.template = query<HTMLTableSectionElement>(table, 'tbody.char')
  }

  get size(): number {
    return this.getGroups().length
  }

  init(defs: CharStats[]): void {
    this.reset()
    defs.forEach((d) => this.addRow(d))
  }

  load(chars: ICharacter[]): void {
    this.init(chars.map(toCharStats))
  }

  addRow(defs: CharStats): void {
    const group = this.template.cloneNode(true) as HTMLTableSectionElement
    group.querySelectorAll('input').forEach((inp) => (inp.value = ''))
    group.querySelectorAll('select').forEach((sel) => (sel.selectedIndex = 0))
    this.table.appendChild(group)

    this.bindControls(group, defs)
    this.initGroup(group, defs)
    this.damageField?.attach(group)
    this.reindexNames()
  }

  // fractional and empty values are kept as is (NaN for empty), so the validator can report them
  read(): ICharacter[] {
    return this.getGroups().map((group) => {
      const ni = query<HTMLInputElement>(group, '.name-input')
      const ac = parseNumber(query<HTMLInputElement>(group, '.ac-input').value)
      const th = parseNumber(query<HTMLInputElement>(group, '.tohit-input').value)
      const hc = parseNumber(query<HTMLInputElement>(group, '.hd-count-input').value)
      const ht = parseNumber(query<HTMLSelectElement>(group, '.hd-type-select').value) as Dice
      const dmg = query<HTMLInputElement>(group, '.damage-input').value.trim()
      const saves = Object.fromEntries(
        Object.values(SaveType).map((save) => [save, parseNumber(getSaveInput(group, save).value)]),
      ) as Saves

      return { armorClass: ac, damage: dmg, hitDice: [hc, ht], name: ni.value, saves, toHit: th }
    })
  }

  private getGroups(): HTMLTableSectionElement[] {
    return Array.from(this.table.querySelectorAll<HTMLTableSectionElement>('tbody.char'))
  }

  private reset(): void {
    this.getGroups().forEach((g) => g.remove())
  }

  private initGroup(group: HTMLTableSectionElement, defs: CharStats): void {
    query<HTMLInputElement>(group, '.name-input').value = defs.prefix
    query<HTMLInputElement>(group, '.ac-input').value = defs.armorClass.toString()
    query<HTMLInputElement>(group, '.tohit-input').value = defs.toHit.toString()
    query<HTMLInputElement>(group, '.hd-count-input').value = defs.hdCount.toString()
    query<HTMLSelectElement>(group, '.hd-type-select').value = defs.hdType.toString()
    query<HTMLInputElement>(group, '.damage-input').value = defs.damage

    const saves = defs.saves ?? DEFAULT_SAVES
    Object.values(SaveType).forEach((save) => (getSaveInput(group, save).value = saves[save].toString()))

    group.dataset.prefix = defs.prefix
  }

  private bindControls(group: HTMLTableSectionElement, defs: CharStats): void {
    const removeBtn = query<HTMLButtonElement>(group, '.remove-row')
    const dupBtn = query<HTMLButtonElement>(group, '.duplicate-row')
    const savesToggle = query<HTMLButtonElement>(group, '.saves-toggle')

    onClick(savesToggle, (): void => {
      setSavesExpanded(group, savesToggle.getAttribute('aria-expanded') !== 'true')
    })

    onClick(dupBtn, (): void => {
      const clone = group.cloneNode(true) as HTMLTableSectionElement
      const cloneInputs = clone.querySelectorAll('input')
      const cloneSelects = clone.querySelectorAll('select')

      // cloneNode doesn't copy current values, only attributes
      group.querySelectorAll('input').forEach((inp, i) => (cloneInputs[i].value = inp.value))
      group.querySelectorAll('select').forEach((sel, i) => (cloneSelects[i].selectedIndex = sel.selectedIndex))

      clone.dataset.prefix = defs.prefix
      this.table.insertBefore(clone, group.nextSibling)

      this.bindControls(clone, defs)
      this.damageField?.attach(clone)
      this.reindexNames()
    })

    onClick(removeBtn, (): void => {
      if (this.size > 1) {
        group.remove()
        this.reindexNames()
      }
    })
  }

  // characters with the same prefix get numbered names: "Goblin", "Goblin 2", "Goblin 3"...
  private reindexNames(): void {
    const nameIndices: Record<string, number> = {}

    this.getGroups().forEach((group) => {
      const name = group.dataset.prefix
      if (!name) {
        return
      }

      if (!nameIndices[name]) {
        nameIndices[name] = 1
      } else {
        ++nameIndices[name]
        const nameInput = group.querySelector<HTMLInputElement>('.name-input')
        if (!nameInput) {
          return
        }

        nameInput.value = `${name} ${nameIndices[name]}`
      }
    })
  }
}
