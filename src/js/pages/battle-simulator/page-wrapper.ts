import { BattleSimulator } from './BattleSimulator'
import type { CharStats } from './consts'
import { henchmanDefaults, monsterDefaults, playerDefaults } from './consts'
import { Logger } from './Logger'
import type { ICharacter } from './types'
import { Strategy } from './types'

document.addEventListener('DOMContentLoaded', (): void => {
  const playersBody = document.getElementById('players-table') as HTMLTableSectionElement
  const monstersBody = document.getElementById('monsters-table') as HTMLTableSectionElement

  // capture templates
  const playerTemplate = playersBody.querySelector('tr') as HTMLTableRowElement
  const monsterTemplate = monstersBody.querySelector('tr') as HTMLTableRowElement

  const addPlayerBtn = document.getElementById('add-player') as HTMLButtonElement
  const addHenchBtn = document.getElementById('add-henchman') as HTMLButtonElement
  const clearPlayersBtn = document.getElementById('clear-players') as HTMLButtonElement

  const addMonsterBtn = document.getElementById('add-monster') as HTMLButtonElement
  const clearMonstersBtn = document.getElementById('clear-monsters') as HTMLButtonElement

  const runBtn = document.getElementById('run-sim') as HTMLButtonElement
  const clearLogBtn = document.getElementById('clear-log') as HTMLButtonElement
  const battleCount = document.getElementById('battle-count') as HTMLInputElement
  const strategySelect = document.getElementById('strategy-select') as HTMLSelectElement
  const progressBar = document.getElementById('progress-bar') as HTMLProgressElement

  const logger = new Logger('result-log')

  const bindRow = (row: HTMLTableRowElement, defs: CharStats, body: HTMLTableSectionElement): void => {
    const removeBtn = row.querySelector('.remove-row') as HTMLButtonElement
    const dupBtn = row.querySelector('.duplicate-row') as HTMLButtonElement

    const inputs = Array.from(row.querySelectorAll('input')) as HTMLInputElement[]
    const selects = Array.from(row.querySelectorAll('select')) as HTMLSelectElement[]

    dupBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      const cloned = playerTemplate.cloneNode(true) as HTMLTableRowElement
      // copy values
      inputs.forEach((inp, i) => ((cloned.querySelectorAll('input')[i] as HTMLInputElement).value = inp.value))
      selects.forEach(
        (sel, i) => ((cloned.querySelectorAll('select')[i] as HTMLSelectElement).selectedIndex = sel.selectedIndex),
      )
      cloned.dataset.prefix = defs.prefix
      body.insertBefore(cloned, row.nextSibling)
      bindRow(cloned, defs, body)
      reindex(body)
    })

    removeBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      if (body.rows.length > 1) {
        row.remove()
        reindex(body)
      }
    })
  }

  const reindex = (body: HTMLTableSectionElement): void => {
    let pCount = 1
    let hCount = 1
    Array.from(body.rows).forEach((row) => {
      const prefix = row.dataset.prefix as string
      const ni = row.querySelector('.name-input') as HTMLInputElement
      if (prefix === 'Player') {
        ni.value = `Player ${pCount++}`
      } else if (prefix === 'Henchman') {
        ni.value = `Henchman ${hCount++}`
      }
    })
  }

  const addRow = (body: HTMLTableSectionElement, defs: CharStats, template: HTMLTableRowElement): void => {
    const newRow = template.cloneNode(true) as HTMLTableRowElement
    newRow.dataset.prefix = defs.prefix
    // clear and init
    Array.from(newRow.querySelectorAll('input')).forEach((inp) => (inp.value = ''))
    Array.from(newRow.querySelectorAll('select')).forEach((sel) => (sel.selectedIndex = 0))
    body.appendChild(newRow)
    bindRow(newRow, defs, body)
    initDefaults(newRow, defs, body)
    reindex(body)
  }

  const initDefaults = (row: HTMLTableRowElement, defs: CharStats, body: HTMLTableSectionElement): void => {
    const idx = Array.from(body.rows).indexOf(row) + 1
    row.dataset.prefix = defs.prefix
    ;(row.querySelector('.name-input') as HTMLInputElement).value = `${defs.prefix} ${idx}`
    ;(row.querySelector('.ac-input') as HTMLInputElement).value = defs.armor
    ;(row.querySelector('.tohit-input') as HTMLInputElement).value = defs.toHit
    ;(row.querySelector('.hd-count-input') as HTMLInputElement).value = defs.hdCount
    ;(row.querySelector('.hd-type-select') as HTMLSelectElement).value = defs.hdType
    ;(row.querySelector('.damage-input') as HTMLInputElement).value = defs.damage
  }

  const clearGroup = (
    body: HTMLTableSectionElement,
    defs: CharStats,
    count: number,
    template: HTMLTableRowElement,
  ): void => {
    Array.from(body.rows).forEach((r) => r.remove())
    for (let i = 0; i < count; i++) {
      addRow(body, defs, template)
    }
  }

  // initial
  clearGroup(playersBody, playerDefaults, 5, playerTemplate)
  clearGroup(monstersBody, monsterDefaults, 1, monsterTemplate)

  addPlayerBtn.addEventListener('click', (e): void => {
    e.preventDefault()
    addRow(playersBody, playerDefaults, playerTemplate)
  })
  addHenchBtn.addEventListener('click', (e): void => {
    e.preventDefault()
    addRow(playersBody, henchmanDefaults, playerTemplate)
  })
  clearPlayersBtn.addEventListener('click', (e): void => {
    e.preventDefault()
    clearGroup(playersBody, playerDefaults, 1, playerTemplate)
  })

  addMonsterBtn.addEventListener('click', (e): void => {
    e.preventDefault()
    addRow(monstersBody, monsterDefaults, monsterTemplate)
  })
  clearMonstersBtn.addEventListener('click', (e): void => {
    e.preventDefault()
    clearGroup(monstersBody, monsterDefaults, 1, monsterTemplate)
  })

  clearLogBtn.addEventListener('click', (e): void => {
    e.preventDefault()
    logger.clear()
  })

  runBtn.addEventListener('click', async (e): Promise<void> => {
    e.preventDefault()
    logger.clear()
    document.body.style.cursor = 'wait'
    progressBar.value = 0

    const runs = Math.max(1, parseInt(battleCount.value, 10) || 1)
    const stratKey = strategySelect.value as keyof typeof Strategy
    const strat = Strategy[stratKey]

    let winsP = 0,
      winsM = 0,
      survP = 0,
      survM = 0
    const initialP = playersBody.rows.length
    const initialM = monstersBody.rows.length

    const read = (body: HTMLTableSectionElement): ICharacter[] =>
      Array.from(body.rows).map((row) => {
        const ni = row.querySelector('.name-input') as HTMLInputElement
        const ac = parseInt((row.querySelector('.ac-input') as HTMLInputElement).value, 10)
        const th = parseInt((row.querySelector('.tohit-input') as HTMLInputElement).value, 10)
        const hc = parseInt((row.querySelector('.hd-count-input') as HTMLInputElement).value, 10)
        const ht = parseInt((row.querySelector('.hd-type-select') as HTMLSelectElement).value, 10)
        const dmg = (row.querySelector('.damage-input') as HTMLInputElement).value
          .trim()
          .split(',')
          .map((s) => s.trim())

        return { armorClass: ac, damage: dmg, hitDice: [hc, ht], name: ni.value, toHit: th }
      })

    const players = read(playersBody)
    const monsters = read(monstersBody)

    for (let i = 0; i < runs; i++) {
      // allow UI update
      await new Promise(requestAnimationFrame)
      progressBar.value = ((i + 1) / runs) * 100

      const sim = new BattleSimulator(players, monsters, strat, logger)

      logger.log(`\n`)
      logger.log(`-`.repeat(100))
      logger.log(`[New battle]`)
      logger.log(`-`.repeat(100))

      sim.renderDetails()
      logger.log(`\n`)

      const res = sim.simulate()
      if (res.winner === 'Players') {
        winsP++
        survP += res.survivors.filter((s) => s.name.startsWith('Player') || s.name.startsWith('Henchman')).length
      } else {
        winsM++
        survM += res.survivors.filter((s) => s.name.startsWith('Monster')).length
      }
    }

    logger.log(`\n`)
    logger.log(
      `Strategy ${stratKey} — Players win: ${((winsP / runs) * 100).toFixed(1)}%, Monsters win: ${((winsM / runs) * 100).toFixed(1)}%`,
    )
    if (winsP) {
      logger.log(`>> Avg Players survivors: ${((survP / (winsP * initialP)) * 100).toFixed(1)}%`)
    }
    // eslint-disable-next-line no-constant-condition
    if (false && winsM) {
      logger.log(`>> Avg Monsters survivors: ${((survM / (winsM * initialM)) * 100).toFixed(1)}%`)
    }

    document.body.style.cursor = 'default'
  })
})
