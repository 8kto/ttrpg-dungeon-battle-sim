import { Dice } from 'ttrpg-lib-dice'

import { DEFAULT_SAVES } from '../../services/attacks/types'
import type { CharStats } from '../../types'
import { CharTable } from '../CharTable'

const saveInput = (save: string): string => `<label>${save}</label><input class="save-input" data-save="${save}" />`

// one character: the main row and the saves row
const charTemplate = `
  <tbody class="char">
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
    </tr>
    <tr class="saves-row">
      <td colspan="7">${['paralyze', 'poison', 'breath', 'device', 'magic'].map(saveInput).join('')}</td>
    </tr>
  </tbody>`

const goblin: CharStats = { armorClass: 13, damage: 'd6, d4', hdCount: 2, hdType: Dice.d8, prefix: 'Goblin', toHit: 1 }

describe('CharTable', () => {
  let element: HTMLTableElement
  let table: CharTable

  beforeEach(() => {
    document.body.innerHTML = `<table id="chars"><thead><tr><th>Name</th></tr></thead>${charTemplate}</table>`
    element = document.getElementById('chars') as HTMLTableElement
    table = new CharTable(element)
  })

  const names = (): string[] => table.read().map((c) => c.name)
  const input = (selector: string, index: number = 0): HTMLInputElement =>
    element.querySelectorAll<HTMLInputElement>(selector)[index]
  const click = (selector: string, index: number = 0): void =>
    element.querySelectorAll<HTMLButtonElement>(selector)[index].click()

  it('reads characters with default saves', () => {
    table.init([goblin])

    expect(table.read()).toEqual([
      { armorClass: 13, damage: 'd6, d4', hitDice: [2, Dice.d8], name: 'Goblin', saves: DEFAULT_SAVES, toHit: 1 },
    ])
  })

  it('reads edited saves', () => {
    table.init([goblin])
    input('.save-input[data-save="poison"]').value = '9'

    expect(table.read()[0].saves).toEqual({ ...DEFAULT_SAVES, poison: 9 })
  })

  it('reads damage as typed', () => {
    table.init([{ ...goblin, damage: '  d8, d6[poison,damage_each_round(d4,3)] | 2d6 ' }])
    expect(table.read()[0].damage).toBe('d8, d6[poison,damage_each_round(d4,3)] | 2d6')
  })

  it('numbers characters with the same prefix', () => {
    table.init([goblin, goblin, { ...goblin, prefix: 'Orc' }, goblin])
    expect(names()).toEqual(['Goblin', 'Goblin 2', 'Orc', 'Goblin 3'])
  })

  it('duplicates the whole character with its current values', () => {
    table.init([goblin])
    input('.ac-input').value = '17'
    input('.save-input[data-save="magic"]').value = '5'
    click('.duplicate-row')

    expect(table.size).toBe(2)
    expect(element.tBodies).toHaveLength(2)
    expect(names()).toEqual(['Goblin', 'Goblin 2'])
    expect(table.read()[1].armorClass).toBe(17)
    expect(table.read()[1].saves.magic).toBe(5)
  })

  it('removes the whole character but keeps the last one', () => {
    table.init([goblin, goblin])
    click('.remove-row')
    expect(table.size).toBe(1)
    expect(element.querySelectorAll('.saves-row')).toHaveLength(1)
    click('.remove-row')
    expect(table.size).toBe(1)
  })

  it('loads characters with saves, replacing existing ones', () => {
    table.init([goblin, goblin])
    const fighter = {
      armorClass: 15,
      damage: 'd8, d6+1 | d10',
      hitDice: [1, Dice.d6] as [number, Dice],
      name: 'Fighter',
      saves: { ...DEFAULT_SAVES, magic: 3 },
      toHit: 2,
    }
    table.load([fighter])

    expect(table.read()).toEqual([fighter])
  })
})
