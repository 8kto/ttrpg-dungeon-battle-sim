import type { Dice } from 'ttrpg-lib-dice'

import type { ICharacter } from '../services/types'
import type { CharStats } from '../types'

const toCharStats = (char: ICharacter): CharStats => ({
  armorClass: char.armorClass,
  damage: char.damage.join(','),
  hdCount: char.hitDice[0],
  hdType: char.hitDice[1],
  prefix: char.name,
  toHit: char.toHit,
})

// Editable table of characters (one side of the battle)
export class CharTable {
  private readonly template: HTMLTableRowElement

  constructor(private readonly body: HTMLTableSectionElement) {
    this.template = body.querySelector('tr') as HTMLTableRowElement
  }

  get size(): number {
    return this.body.rows.length
  }

  init(defs: CharStats[]): void {
    this.reset()
    defs.forEach((d) => this.addRow(d))
  }

  load(chars: ICharacter[]): void {
    this.init(chars.map(toCharStats))
  }

  addRow(defs: CharStats): void {
    const newRow = this.template.cloneNode(true) as HTMLTableRowElement
    newRow.querySelectorAll('input').forEach((inp) => (inp.value = ''))
    newRow.querySelectorAll('select').forEach((sel) => (sel.selectedIndex = 0))
    this.body.appendChild(newRow)

    this.bindRowControls(newRow, defs)
    this.initRow(newRow, defs)
    this.reindexNames()
  }

  read(): ICharacter[] {
    return Array.from(this.body.rows).map((row) => {
      const ni = row.querySelector('.name-input') as HTMLInputElement
      const ac = parseInt((row.querySelector('.ac-input') as HTMLInputElement).value, 10)
      const th = parseInt((row.querySelector('.tohit-input') as HTMLInputElement).value, 10)
      const hc = parseInt((row.querySelector('.hd-count-input') as HTMLInputElement).value, 10)
      const ht = parseInt((row.querySelector('.hd-type-select') as HTMLSelectElement).value, 10) as Dice
      const dmg = (row.querySelector('.damage-input') as HTMLInputElement).value
        .trim()
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '')

      return { armorClass: ac, damage: dmg, hitDice: [hc, ht], name: ni.value, toHit: th }
    })
  }

  private reset(): void {
    Array.from(this.body.rows).forEach((r) => r.remove())
  }

  private initRow(row: HTMLTableRowElement, defs: CharStats): void {
    ;(row.querySelector('.name-input') as HTMLInputElement).value = defs.prefix
    ;(row.querySelector('.ac-input') as HTMLInputElement).value = defs.armorClass.toString()
    ;(row.querySelector('.tohit-input') as HTMLInputElement).value = defs.toHit.toString()
    ;(row.querySelector('.hd-count-input') as HTMLInputElement).value = defs.hdCount.toString()
    ;(row.querySelector('.hd-type-select') as HTMLSelectElement).value = defs.hdType.toString()
    ;(row.querySelector('.damage-input') as HTMLInputElement).value = defs.damage

    row.dataset.prefix = defs.prefix
  }

  private bindRowControls(row: HTMLTableRowElement, defs: CharStats): void {
    const removeBtn = row.querySelector('.remove-row') as HTMLButtonElement
    const dupBtn = row.querySelector('.duplicate-row') as HTMLButtonElement

    dupBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      const clone = row.cloneNode(true) as HTMLTableRowElement
      const cloneInputs = clone.querySelectorAll('input')
      const cloneSelects = clone.querySelectorAll('select')

      // cloneNode doesn't copy current values, only attributes
      row.querySelectorAll('input').forEach((inp, i) => (cloneInputs[i].value = inp.value))
      row.querySelectorAll('select').forEach((sel, i) => (cloneSelects[i].selectedIndex = sel.selectedIndex))

      clone.dataset.prefix = defs.prefix
      this.body.insertBefore(clone, row.nextSibling)

      this.bindRowControls(clone, defs)
      this.reindexNames()
    })

    removeBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      if (this.body.rows.length > 1) {
        row.remove()
        this.reindexNames()
      }
    })
  }

  // rows with the same prefix get numbered names: "Goblin", "Goblin 2", "Goblin 3"...
  private reindexNames(): void {
    const nameIndices: Record<string, number> = {}

    Array.from(this.body.rows).forEach((row) => {
      const name = row.dataset.prefix
      if (!name) {
        return
      }

      if (!nameIndices[name]) {
        nameIndices[name] = 1
      } else {
        ++nameIndices[name]
        const nameInput = row.querySelector<HTMLInputElement>('.name-input')
        if (!nameInput) {
          return
        }

        nameInput.value = `${name} ${nameIndices[name]}`
      }
    })
  }
}
