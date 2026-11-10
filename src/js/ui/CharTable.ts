import type { Dice } from 'ttrpg-lib-dice'

import type { Saves } from '../services/attacks/types'
import { DEFAULT_SAVES, SaveType } from '../services/attacks/types'
import type { ICharacter } from '../services/types'
import type { CharStats } from '../types'

const toCharStats = (char: ICharacter): CharStats => ({
  armorClass: char.armorClass,
  damage: char.damage,
  hdCount: char.hitDice[0],
  hdType: char.hitDice[1],
  prefix: char.name,
  saves: char.saves,
  toHit: char.toHit,
})

const saveInput = (group: HTMLElement, save: SaveType): HTMLInputElement =>
  group.querySelector(`.save-input[data-save="${save}"]`) as HTMLInputElement

// Editable table of characters (one side of the battle); every character is a <tbody class="char">
// with the main row and the saves row
export class CharTable {
  private readonly template: HTMLTableSectionElement

  constructor(private readonly table: HTMLTableElement) {
    this.template = table.querySelector('tbody.char') as HTMLTableSectionElement
  }

  get size(): number {
    return this.groups.length
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
    this.reindexNames()
  }

  read(): ICharacter[] {
    return this.groups.map((group) => {
      const ni = group.querySelector('.name-input') as HTMLInputElement
      const ac = parseInt((group.querySelector('.ac-input') as HTMLInputElement).value, 10)
      const th = parseInt((group.querySelector('.tohit-input') as HTMLInputElement).value, 10)
      const hc = parseInt((group.querySelector('.hd-count-input') as HTMLInputElement).value, 10)
      const ht = parseInt((group.querySelector('.hd-type-select') as HTMLSelectElement).value, 10) as Dice
      const dmg = (group.querySelector('.damage-input') as HTMLInputElement).value.trim()
      const saves = Object.fromEntries(
        Object.values(SaveType).map((save) => [save, parseInt(saveInput(group, save).value, 10)]),
      ) as Saves

      return { armorClass: ac, damage: dmg, hitDice: [hc, ht], name: ni.value, saves, toHit: th }
    })
  }

  private get groups(): HTMLTableSectionElement[] {
    return Array.from(this.table.querySelectorAll<HTMLTableSectionElement>('tbody.char'))
  }

  private reset(): void {
    this.groups.forEach((g) => g.remove())
  }

  private initGroup(group: HTMLTableSectionElement, defs: CharStats): void {
    ;(group.querySelector('.name-input') as HTMLInputElement).value = defs.prefix
    ;(group.querySelector('.ac-input') as HTMLInputElement).value = defs.armorClass.toString()
    ;(group.querySelector('.tohit-input') as HTMLInputElement).value = defs.toHit.toString()
    ;(group.querySelector('.hd-count-input') as HTMLInputElement).value = defs.hdCount.toString()
    ;(group.querySelector('.hd-type-select') as HTMLSelectElement).value = defs.hdType.toString()
    ;(group.querySelector('.damage-input') as HTMLInputElement).value = defs.damage

    const saves = defs.saves ?? DEFAULT_SAVES
    Object.values(SaveType).forEach((save) => (saveInput(group, save).value = saves[save].toString()))

    group.dataset.prefix = defs.prefix
  }

  private bindControls(group: HTMLTableSectionElement, defs: CharStats): void {
    const removeBtn = group.querySelector('.remove-row') as HTMLButtonElement
    const dupBtn = group.querySelector('.duplicate-row') as HTMLButtonElement

    dupBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      const clone = group.cloneNode(true) as HTMLTableSectionElement
      const cloneInputs = clone.querySelectorAll('input')
      const cloneSelects = clone.querySelectorAll('select')

      // cloneNode doesn't copy current values, only attributes
      group.querySelectorAll('input').forEach((inp, i) => (cloneInputs[i].value = inp.value))
      group.querySelectorAll('select').forEach((sel, i) => (cloneSelects[i].selectedIndex = sel.selectedIndex))

      clone.dataset.prefix = defs.prefix
      this.table.insertBefore(clone, group.nextSibling)

      this.bindControls(clone, defs)
      this.reindexNames()
    })

    removeBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      if (this.size > 1) {
        group.remove()
        this.reindexNames()
      }
    })
  }

  // characters with the same prefix get numbered names: "Goblin", "Goblin 2", "Goblin 3"...
  private reindexNames(): void {
    const nameIndices: Record<string, number> = {}

    this.groups.forEach((group) => {
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
