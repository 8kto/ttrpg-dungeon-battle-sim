// simulation.ts
import { BattleSimulator } from './BattleSimulator'
import { Logger } from './Logger'
import type { ICharacter } from './types'
import { Strategy } from './types'

document.addEventListener('DOMContentLoaded', () => {
  const playersBody = document.getElementById('players-table') as HTMLTableSectionElement
  const monstersBody = document.getElementById('monsters-table') as HTMLTableSectionElement
  const addPlayerBtn = document.getElementById('add-player') as HTMLButtonElement
  const addMonsterBtn = document.getElementById('add-monster') as HTMLButtonElement
  const runBtn = document.getElementById('run-sim') as HTMLButtonElement
  const battleCountInput = document.getElementById('battle-count') as HTMLInputElement
  const strategySelect = document.getElementById('strategy-select') as HTMLSelectElement
  const logger = new Logger('result-log')

  function bindRemove(row: HTMLTableRowElement, body: HTMLTableSectionElement): void {
    const btn = row.querySelector('.remove-row') as HTMLButtonElement
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      if (body.childElementCount > 1) {
        row.remove()
        // re-index the remaining rows
        Array.from(body.rows).forEach((r, idx) => {
          const nameInput = r.querySelector('.name-input') as HTMLInputElement
          const prefix = body === playersBody ? 'Player' : 'Monster'
          nameInput.value = `${prefix} ${idx + 1}`
        })
      }
    })
  }

  function addRow(body: HTMLTableSectionElement, isPlayer: boolean): void {
    const template = body.querySelector('tr')!
    const clone = template.cloneNode(true) as HTMLTableRowElement

    // clear values
    clone.querySelectorAll('input').forEach((inp) => (inp.value = ''))
    clone.querySelectorAll('select').forEach((sel) => ((sel as HTMLSelectElement).selectedIndex = 0))

    body.appendChild(clone)
    bindRemove(clone, body)
    initRow(clone, isPlayer)
  }

  function initRow(row: HTMLTableRowElement, isPlayer: boolean): void {
    const nameInput = row.querySelector('.name-input') as HTMLInputElement
    const acInput = row.querySelector('.ac-input') as HTMLInputElement
    const toHitInput = row.querySelector('.tohit-input') as HTMLInputElement
    const hdCountInput = row.querySelector('.hd-count-input') as HTMLInputElement
    const hdTypeSelect = row.querySelector('.hd-type-select') as HTMLSelectElement
    const damageInput = row.querySelector('.damage-input') as HTMLInputElement

    const body = isPlayer ? playersBody : monstersBody
    const index = body.rows.length
    const prefix = isPlayer ? 'Player' : 'Monster'
    nameInput.value = `${prefix} ${index}`
    acInput.value = '12'
    toHitInput.value = '1'
    hdCountInput.value = '1'
    hdTypeSelect.value = '8'
    damageInput.value = 'd6'
  }

  // Initialize 5 players
  const firstPlayerRow = playersBody.querySelector('tr') as HTMLTableRowElement
  bindRemove(firstPlayerRow, playersBody)
  initRow(firstPlayerRow, true)
  for (let i = 1; i < 5; i++) {
    addRow(playersBody, true)
  }

  // Initialize 1 monster
  const firstMonsterRow = monstersBody.querySelector('tr') as HTMLTableRowElement
  bindRemove(firstMonsterRow, monstersBody)
  initRow(firstMonsterRow, false)

  addPlayerBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(playersBody, true)
  })
  addMonsterBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(monstersBody, false)
  })

  runBtn.addEventListener('click', (e) => {
    e.preventDefault()
    logger.clear()

    const runs = Math.max(1, parseInt(battleCountInput.value, 10) || 1)
    const stratKey = strategySelect.value as keyof typeof Strategy
    const strat = Strategy[stratKey]

    let winsPlayers = 0
    let winsMonsters = 0

    function readChars(body: HTMLTableSectionElement): ICharacter[] {
      return Array.from(body.rows).map((row) => {
        const name = (row.querySelector('.name-input') as HTMLInputElement).value
        const armorClass = parseInt((row.querySelector('.ac-input') as HTMLInputElement).value, 10)
        const toHit = parseInt((row.querySelector('.tohit-input') as HTMLInputElement).value, 10)
        const hdCount = parseInt((row.querySelector('.hd-count-input') as HTMLInputElement).value, 10)
        const hdType = parseInt((row.querySelector('.hd-type-select') as HTMLSelectElement).value, 10)
        const dmgValue = (row.querySelector('.damage-input') as HTMLInputElement).value.trim()
        const damage = dmgValue.split(',').map((s) => s.trim())

        return {
          armorClass,
          damage,
          hitDice: [hdCount, hdType] as [number, number],
          name,
          toHit,
        }
      })
    }

    const players = readChars(playersBody)
    const monsters = readChars(monstersBody)

    for (let i = 0; i < runs; i++) {
      const sim = new BattleSimulator(players, monsters, strat, logger)
      logger.log(`[New battle]\n`)
      sim.renderDetails()
      logger.log(`\n`)

      const result = sim.simulate()
      if (result.winner === 'Players') {
        winsPlayers++
      } else {
        winsMonsters++
      }
      logger.log(`${`-`.repeat(100)}\n`)
    }

    logger.log(
      `Players win: ${((winsPlayers / runs) * 100).toFixed(1)}%, ` +
        `Monsters win: ${((winsMonsters / runs) * 100).toFixed(1)}% ` +
        `(Strategy ${stratKey})`,
    )
  })
})
