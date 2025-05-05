import type { Dice } from 'ttrpg-lib-dice'

import { BattleSimulator } from './services/BattleSimulator'
import { henchmanDefaults, monsterDefaults, playerDefaults } from './consts'
import { Logger } from './services/Logger'
import type { ICharacter } from './services/types'
import { Strategy } from './services/types'
import { CharStats } from './types'

// export/import config
const readConfig = (body: HTMLTableSectionElement): ICharacter[] =>
  Array.from(body.rows).map((row) => {
    const ni = row.querySelector('.name-input') as HTMLInputElement
    const ac = parseInt((row.querySelector('.ac-input') as HTMLInputElement).value, 10)
    const th = parseInt((row.querySelector('.tohit-input') as HTMLInputElement).value, 10)
    const hc = parseInt((row.querySelector('.hd-count-input') as HTMLInputElement).value, 10)
    const ht = parseInt((row.querySelector('.hd-type-select') as HTMLSelectElement).value, 10) as Dice
    const dmg = (row.querySelector('.damage-input') as HTMLInputElement).value
      .trim()
      .split(',')
      .map((s) => s.trim())

    return { armorClass: ac, damage: dmg, hitDice: [hc, ht], name: ni.value, toHit: th }
  })

document.addEventListener('DOMContentLoaded', (): void => {
  const playersBody = document.getElementById('players-table') as HTMLTableSectionElement
  const monstersBody = document.getElementById('monsters-table') as HTMLTableSectionElement
  const playerTemplate = playersBody.querySelector('tr') as HTMLTableRowElement
  const monsterTemplate = monstersBody.querySelector('tr') as HTMLTableRowElement

  const addPlayerBtn = document.getElementById('add-player') as HTMLButtonElement
  const addHenchBtn = document.getElementById('add-henchman') as HTMLButtonElement
  const clearPlayersBtn = document.getElementById('clear-players') as HTMLButtonElement

  const addMonsterBtn = document.getElementById('add-monster') as HTMLButtonElement
  const clearMonstersBtn = document.getElementById('clear-monsters') as HTMLButtonElement

  const runBtn = document.getElementById('run-sim') as HTMLButtonElement
  const clearLogBtn = document.getElementById('clear-log') as HTMLButtonElement
  const exportCfgBtn = document.getElementById('export-config') as HTMLButtonElement
  const importCfgBtn = document.getElementById('import-config') as HTMLButtonElement

  const battleCount = document.getElementById('battle-count') as HTMLInputElement
  const strategySelect = document.getElementById('strategy-select') as HTMLSelectElement
  const progressBar = document.getElementById('progress-bar') as HTMLProgressElement

  const tabLogBtn = document.getElementById('tab-log-btn') as HTMLButtonElement
  const tabConfigBtn = document.getElementById('tab-config-btn') as HTMLButtonElement
  const tabLog = document.getElementById('tab-log') as HTMLDivElement
  const tabConfig = document.getElementById('tab-config') as HTMLDivElement
  const configArea = document.getElementById('config-area') as HTMLTextAreaElement

  const logger = new Logger('result-log')

  const bindRow = (row: HTMLTableRowElement, defs: CharStats, body: HTMLTableSectionElement): void => {
    const removeBtn = row.querySelector('.remove-row') as HTMLButtonElement
    const dupBtn = row.querySelector('.duplicate-row') as HTMLButtonElement

    const inputs = Array.from(row.querySelectorAll('input')) as HTMLInputElement[]
    const selects = Array.from(row.querySelectorAll('select')) as HTMLSelectElement[]

    dupBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      const clone = row.cloneNode(true) as HTMLTableRowElement
      // copy all fields
      inputs.forEach((inp, i) => {
        const target = clone.querySelectorAll('input')[i] as HTMLInputElement
        target.value = inp.value
      })
      selects.forEach((sel, i) => {
        const target = clone.querySelectorAll('select')[i] as HTMLSelectElement
        target.selectedIndex = sel.selectedIndex
      })
      clone.dataset.prefix = defs.prefix
      body.insertBefore(clone, row.nextSibling)
      bindRow(clone, defs, body)
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
    let pCount = 1,
      hCount = 1,
      mCount = 1

    Array.from(body.rows).forEach((row) => {
      // const prefix = row.dataset.prefix as string
      const ni = row.querySelector('.name-input') as HTMLInputElement

      if (ni.value.startsWith('Player')) {
        ni.value = `Player ${pCount++}`
      }

      if (ni.value.startsWith('Monster')) {
        ni.value = `Monster ${mCount++}`
      }

      if (ni.value.startsWith('Henchman')) {
        ni.value = `Henchman ${hCount++}`
      }
    })
  }

  const addRow = (body: HTMLTableSectionElement, defs: CharStats, template: HTMLTableRowElement): void => {
    const newRow = template.cloneNode(true) as HTMLTableRowElement
    newRow.dataset.prefix = defs.prefix
    newRow.querySelectorAll('input').forEach((inp) => (inp.value = ''))
    newRow.querySelectorAll('select').forEach((sel) => ((sel as HTMLSelectElement).selectedIndex = 0))
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

  // initial setup
  clearGroup(playersBody, playerDefaults, 5, playerTemplate)
  clearGroup(monstersBody, monsterDefaults, 1, monsterTemplate)

  addPlayerBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(playersBody, playerDefaults, playerTemplate)
  })
  addHenchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(playersBody, henchmanDefaults, playerTemplate)
  })
  clearPlayersBtn.addEventListener('click', (e) => {
    e.preventDefault()
    clearGroup(playersBody, playerDefaults, 1, playerTemplate)
  })

  addMonsterBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(monstersBody, monsterDefaults, monsterTemplate)
  })
  clearMonstersBtn.addEventListener('click', (e) => {
    e.preventDefault()
    clearGroup(monstersBody, monsterDefaults, 1, monsterTemplate)
  })

  clearLogBtn.addEventListener('click', (e) => {
    e.preventDefault()
    logger.clear()
  })

  // tab switching
  tabLogBtn.addEventListener('click', (): void => {
    tabLog.classList.remove('hidden')
    tabConfig.classList.add('hidden')
    tabLogBtn.classList.add('border-blue-600', 'text-blue-600')
    tabConfigBtn.classList.remove('border-blue-600', 'text-blue-600')
  })
  tabConfigBtn.addEventListener('click', (): void => {
    tabConfig.classList.remove('hidden')
    tabLog.classList.add('hidden')
    tabConfigBtn.classList.add('border-blue-600', 'text-blue-600')
    tabLogBtn.classList.remove('border-blue-600', 'text-blue-600')
  })

  exportCfgBtn.addEventListener('click', (): void => {
    const cfg = {
      monsters: readConfig(monstersBody),
      players: readConfig(playersBody),
    }
    configArea.value = JSON.stringify(cfg, null, 2)
  })

  importCfgBtn.addEventListener('click', (): void => {
    try {
      const cfg = JSON.parse(configArea.value) as { players: ICharacter[]; monsters: ICharacter[] }
      clearGroup(playersBody, playerDefaults, 0, playerTemplate)
      clearGroup(monstersBody, monsterDefaults, 0, monsterTemplate)
      cfg.players.forEach((char) => {
        addRow(playersBody, playerDefaults, playerTemplate)
        initDefaults(playersBody.lastElementChild as HTMLTableRowElement, playerDefaults, playersBody)
        // then overwrite with imported values:
        const last = playersBody.lastElementChild as HTMLTableRowElement

        ;(last.querySelector('.name-input') as HTMLInputElement).value = char.name
        ;(last.querySelector('.ac-input') as HTMLInputElement).value = char.armorClass.toString()
        ;(last.querySelector('.tohit-input') as HTMLInputElement).value = char.toHit.toString()
        ;(last.querySelector('.hd-count-input') as HTMLInputElement).value = char.hitDice[0].toString()
        ;(last.querySelector('.hd-type-select') as HTMLSelectElement).value = String(char.hitDice[1])
        ;(last.querySelector('.damage-input') as HTMLInputElement).value = char.damage.join(',')
      })
      cfg.monsters.forEach((char) => {
        addRow(monstersBody, monsterDefaults, monsterTemplate)
        initDefaults(monstersBody.lastElementChild as HTMLTableRowElement, monsterDefaults, monstersBody)
        const last = monstersBody.lastElementChild as HTMLTableRowElement

        ;(last.querySelector('.name-input') as HTMLInputElement).value = char.name
        ;(last.querySelector('.ac-input') as HTMLInputElement).value = char.armorClass.toString()
        ;(last.querySelector('.tohit-input') as HTMLInputElement).value = char.toHit.toString()
        ;(last.querySelector('.hd-count-input') as HTMLInputElement).value = char.hitDice[0].toString()
        ;(last.querySelector('.hd-type-select') as HTMLSelectElement).value = String(char.hitDice[1])
        ;(last.querySelector('.damage-input') as HTMLInputElement).value = char.damage.join(',')
      })
      reindex(playersBody)
      reindex(monstersBody)
    } catch {
      alert('Invalid JSON config')
    }
  })

  // run simulation
  runBtn.addEventListener('click', async (e): Promise<void> => {
    e.preventDefault()
    logger.clear()
    document.body.style.cursor = 'wait'
    progressBar.value = 0

    const runs = Math.max(1, parseInt(battleCount.value, 10) || 1)
    const strat = Strategy[strategySelect.value as keyof typeof Strategy]

    let winsP = 0,
      winsM = 0,
      survP = 0,
      survM = 0
    const initialP = playersBody.rows.length
    const initialM = monstersBody.rows.length

    const players = readConfig(playersBody)
    const monsters = readConfig(monstersBody)

    for (let i = 0; i < runs; i++) {
      await new Promise(requestAnimationFrame)
      progressBar.value = ((i + 1) / runs) * 100

      logger.log(`\n${'-'.repeat(80)}`)
      logger.log('[New battle]')
      logger.log('-'.repeat(80))

      const sim = new BattleSimulator(players, monsters, strat, logger)
      sim.renderDetails()
      logger.log('\n')

      const res = sim.simulate()
      if (res.winner === 'Players') {
        winsP++
        survP += res.survivors.filter((s) => s.side === 'Players').length
      } else {
        winsM++
      }
    }

    logger.log('\n')
    logger.log(
      `Players win: ${((winsP / runs) * 100).toFixed(1)}%, Monsters win: ${((winsM / runs) * 100).toFixed(1)}%`,
    )

    if (winsP) {
      logger.log(`>> Avg Players survivors: ${((survP / (winsP * initialP)) * 100).toFixed(1)}%`)
    }
    logger.log(`>> Strategy ${strategySelect.value}, ${runs} battles`)

    document.body.style.cursor = 'default'
  })
})
