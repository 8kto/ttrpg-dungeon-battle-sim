import type { SpellsLevelMap } from '../../domain/snw/Spells'

export const getMagicUserSpellsTable = (data: SpellsLevelMap, className: string): HTMLTableElement => {
  const table = document.createElement('table')
  table.className = `table w-full table--spells-level gap-2 ${className}`

  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')

  // Header cells: "Level", "1st", ..., "9th"
  const headers = ['Level', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
  for (const text of headers) {
    const th = document.createElement('th')
    th.textContent = text
    headRow.appendChild(th)
  }
  thead.appendChild(headRow)
  table.appendChild(thead)

  const tbody = document.createElement('tbody')

  const levels = Object.keys(data)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b)

  for (const lvl of levels) {
    const row = document.createElement('tr')

    // Character level cell
    const lvlCell = document.createElement('td')
    lvlCell.textContent = lvl === 21 ? '21+' : String(lvl)
    row.appendChild(lvlCell)

    // Spell levels 1–9
    for (let spellLvl = 1; spellLvl <= 9; spellLvl++) {
      const cell = document.createElement('td')
      const slots = data[lvl][spellLvl]
      if (typeof slots === 'number' && slots > 0) {
        cell.textContent = String(slots)
      }
      row.appendChild(cell)
    }

    tbody.appendChild(row)
  }

  table.appendChild(tbody)

  return table
}
