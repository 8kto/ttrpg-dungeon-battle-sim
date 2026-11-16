import { Dice } from 'ttrpg-lib-dice'

import type { CharStats } from '../../types'
import { CharTable } from '../CharTable'

const rowTemplate = `
  <tr>
    <td><input class="name-input" /></td>
    <td><input class="ac-input" /></td>
    <td><input class="tohit-input" /></td>
    <td><input class="hd-count-input" /></td>
    <td>
      <select class="hd-type-select">
        <option value="4">d4</option>
        <option value="6">d6</option>
        <option value="8">d8</option>
      </select>
    </td>
    <td><input class="damage-input" /></td>
    <td><button class="duplicate-row"></button><button class="remove-row"></button></td>
  </tr>`

const goblin: CharStats = { armorClass: 13, damage: 'd6, d4', hdCount: 2, hdType: Dice.d8, prefix: 'Goblin', toHit: 1 }

describe('CharTable', () => {
  let body: HTMLTableSectionElement
  let table: CharTable

  beforeEach(() => {
    document.body.innerHTML = `<table><tbody id="chars">${rowTemplate}</tbody></table>`
    body = document.getElementById('chars') as HTMLTableSectionElement
    table = new CharTable(body)
  })

  const names = (): string[] => table.read().map((c) => c.name)

  it('reads characters from rows', () => {
    table.init([goblin])

    expect(table.read()).toEqual([
      { armorClass: 13, damage: ['d6', 'd4'], hitDice: [2, Dice.d8], name: 'Goblin', toHit: 1 },
    ])
  })

  it('ignores empty damage entries', () => {
    table.init([{ ...goblin, damage: 'd6, ,' }])
    expect(table.read()[0].damage).toEqual(['d6'])
  })

  it('numbers rows with the same prefix', () => {
    table.init([goblin, goblin, { ...goblin, prefix: 'Orc' }, goblin])
    expect(names()).toEqual(['Goblin', 'Goblin 2', 'Orc', 'Goblin 3'])
  })

  it('duplicates a row with its current values', () => {
    table.init([goblin])
    ;(body.querySelector('.ac-input') as HTMLInputElement).value = '17'
    ;(body.querySelector('.duplicate-row') as HTMLButtonElement).click()

    expect(table.size).toBe(2)
    expect(names()).toEqual(['Goblin', 'Goblin 2'])
    expect(table.read()[1].armorClass).toBe(17)
  })

  it('removes a row but keeps the last one', () => {
    table.init([goblin, goblin])
    ;(body.querySelector('.remove-row') as HTMLButtonElement).click()
    expect(table.size).toBe(1)
    ;(body.querySelector('.remove-row') as HTMLButtonElement).click()
    expect(table.size).toBe(1)
  })

  it('loads characters, replacing existing rows', () => {
    table.init([goblin, goblin])
    table.load([{ armorClass: 15, damage: ['d8', 'd6+1'], hitDice: [1, Dice.d6], name: 'Fighter', toHit: 2 }])

    expect(table.read()).toEqual([
      { armorClass: 15, damage: ['d8', 'd6+1'], hitDice: [1, Dice.d6], name: 'Fighter', toHit: 2 },
    ])
  })
})
