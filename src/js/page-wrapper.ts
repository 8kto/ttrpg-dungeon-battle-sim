import type { Dice } from 'ttrpg-lib-dice'

import {
  HenchmanCharTemplate,
  MonsterCharTemplate,
  MonsterTemplates,
  PlayerCharTemplate,
  PlayerTemplates,
} from './consts'
import { BattleSimulator } from './services/BattleSimulator'
import { Logger } from './services/Logger'
import type { ICharacter } from './services/types'
import { Strategy } from './services/types'
import type { BattleSimulationConfig, CharStats } from './types'
import { Side } from './types'

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
  const runSimBtn = document.getElementById('run-sim') as HTMLButtonElement
  const stopSimBtn = document.getElementById('stop-sim') as HTMLButtonElement
  const clearLogBtn = document.getElementById('clear-log') as HTMLButtonElement
  const exportCfgBtn = document.getElementById('export-config') as HTMLButtonElement
  const importCfgBtn = document.getElementById('import-config') as HTMLButtonElement

  const battleCount = document.getElementById('battle-count') as HTMLInputElement
  const strategySelect = document.getElementById('strategy-select') as HTMLSelectElement
  const biasPlayersInput = document.getElementById('bias-players') as HTMLInputElement
  const biasMonstersInput = document.getElementById('bias-monsters') as HTMLInputElement
  const maxAttacksInput = document.getElementById('max-attacks') as HTMLInputElement
  const progressBar = document.getElementById('progress-bar') as HTMLProgressElement

  const tabLogBtn = document.getElementById('tab-log-btn') as HTMLButtonElement
  const tabConfigBtn = document.getElementById('tab-config-btn') as HTMLButtonElement
  const tabLog = document.getElementById('tab-log') as HTMLDivElement
  const tabConfig = document.getElementById('tab-config') as HTMLDivElement
  const configArea = document.getElementById('config-area') as HTMLTextAreaElement

  let controller = new AbortController()
  let { signal } = controller
  const logger = new Logger('result-log')

  const bindRowControls = (row: HTMLTableRowElement, defs: CharStats, body: HTMLTableSectionElement): void => {
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

      bindRowControls(clone, defs, body)
      reindexNames(body)
    })

    removeBtn.addEventListener('click', (e): void => {
      e.preventDefault()
      if (body.rows.length > 1) {
        row.remove()
        reindexNames(body)
      }
    })
  }

  const reindexNames = (body: HTMLTableSectionElement): void => {
    const nameIndices: Record<string, number> = {}

    Array.from(body.rows).forEach((row) => {
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

  const addRow = (body: HTMLTableSectionElement, defs: CharStats, template: HTMLTableRowElement): void => {
    const newRow = template.cloneNode(true) as HTMLTableRowElement
    newRow.dataset.prefix = defs.prefix
    newRow.querySelectorAll('input').forEach((inp) => (inp.value = ''))
    newRow.querySelectorAll('select').forEach((sel) => ((sel as HTMLSelectElement).selectedIndex = 0))
    body.appendChild(newRow)

    bindRowControls(newRow, defs, body)
    initRow(newRow, defs)
    reindexNames(body)
  }

  const initRow = (row: HTMLTableRowElement, defs: CharStats): void => {
    ;(row.querySelector('.name-input') as HTMLInputElement).value = defs.prefix
    ;(row.querySelector('.ac-input') as HTMLInputElement).value = defs.armorClass.toString()
    ;(row.querySelector('.tohit-input') as HTMLInputElement).value = defs.toHit.toString()
    ;(row.querySelector('.hd-count-input') as HTMLInputElement).value = defs.hdCount.toString()
    ;(row.querySelector('.hd-type-select') as HTMLSelectElement).value = defs.hdType.toString()
    ;(row.querySelector('.damage-input') as HTMLInputElement).value = defs.damage

    row.dataset.prefix = defs.prefix
  }

  const resetTable = (body: HTMLTableSectionElement): void => {
    Array.from(body.rows).forEach((r) => r.remove())
  }

  const initTable = (body: HTMLTableSectionElement, defs: CharStats[], template: HTMLTableRowElement): void => {
    resetTable(body)

    for (let i = 0; i < defs.length; i++) {
      addRow(body, defs[i], template)
    }
  }

  // initial setup
  initTable(playersBody, PlayerTemplates, playerTemplate)
  initTable(monstersBody, MonsterTemplates, monsterTemplate)

  addPlayerBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(playersBody, PlayerCharTemplate, playerTemplate)
  })
  addHenchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(playersBody, HenchmanCharTemplate, playerTemplate)
  })
  clearPlayersBtn.addEventListener('click', (e) => {
    e.preventDefault()
    initTable(playersBody, PlayerTemplates, playerTemplate)
  })

  addMonsterBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addRow(monstersBody, MonsterCharTemplate, monsterTemplate)
  })
  clearMonstersBtn.addEventListener('click', (e) => {
    e.preventDefault()
    initTable(monstersBody, MonsterTemplates, monsterTemplate)
  })

  clearLogBtn.addEventListener('click', (e) => {
    e.preventDefault()
    logger.clear()
  })

  // tab switching
  tabLogBtn.addEventListener('click', (): void => {
    tabLog.classList.remove('hidden')
    tabConfig.classList.add('hidden')
    tabLogBtn.classList.add('active')
    tabConfigBtn.classList.remove('active')
  })
  tabConfigBtn.addEventListener('click', (): void => {
    tabConfig.classList.remove('hidden')
    tabLog.classList.add('hidden')
    tabConfigBtn.classList.add('active')
    tabLogBtn.classList.remove('active')
  })

  exportCfgBtn.addEventListener('click', (): void => {
    const cfg: BattleSimulationConfig = {
      battleCount: parseInt(battleCount.value, 10),
      biasMonsters: parseInt(biasMonstersInput.value, 10),
      biasPlayers: parseInt(biasPlayersInput.value, 10),
      maxAttacks: parseInt(maxAttacksInput.value, 10),
      monsters: readConfig(monstersBody),
      players: readConfig(playersBody),
      strategy: strategySelect.value,
    }
    configArea.value = JSON.stringify(cfg, null, 2)
  })

  importCfgBtn.addEventListener('click', (): void => {
    try {
      const config = JSON.parse(configArea.value) as BattleSimulationConfig

      // Global settings
      if (config.battleCount) {
        battleCount.value = String(config.battleCount)
      }
      if (config.strategy) {
        strategySelect.value = config.strategy
      }
      if (config.biasPlayers) {
        biasPlayersInput.value = String(config.biasPlayers)
      }
      if (config.biasMonsters) {
        biasMonstersInput.value = String(config.biasMonsters)
      }
      if (config.maxAttacks) {
        maxAttacksInput.value = String(config.maxAttacks)
      }

      // Char Tables
      resetTable(playersBody)
      resetTable(monstersBody)

      config.players.forEach((char) => {
        addRow(playersBody, PlayerCharTemplate, playerTemplate)
        initRow(playersBody.lastElementChild as HTMLTableRowElement, {
          armorClass: char.armorClass,
          damage: char.damage.join(','),
          hdCount: char.hitDice[0],
          hdType: char.hitDice[1],
          prefix: char.name,
          toHit: char.toHit,
        })
      })

      config.monsters.forEach((char) => {
        addRow(monstersBody, MonsterCharTemplate, monsterTemplate)
        initRow(monstersBody.lastElementChild as HTMLTableRowElement, {
          armorClass: char.armorClass,
          damage: char.damage.join(','),
          hdCount: char.hitDice[0],
          hdType: char.hitDice[1],
          prefix: char.name,
          toHit: char.toHit,
        })
      })

      reindexNames(playersBody)
      reindexNames(monstersBody)
    } catch (err) {
      console.error(err)
      alert('Invalid JSON config')
    }
  })

  const getBattleSimulator = (): BattleSimulator => {
    const players = readConfig(playersBody)
    const monsters = readConfig(monstersBody)
    const strategy = Strategy[strategySelect.value as keyof typeof Strategy]
    const biasPlayers = parseInt(biasPlayersInput.value, 10)
    const biasMonsters = parseInt(biasMonstersInput.value, 10)
    const maxAttacksPerChar = parseInt(maxAttacksInput.value, 10)

    return new BattleSimulator(players, monsters, strategy, biasPlayers, biasMonsters, maxAttacksPerChar, logger)
  }

  const runBattles = async (
    runs: number,
    signal: AbortSignal,
    progressBar: HTMLProgressElement,
    logger: Logger,
    getBattleSimulator: () => BattleSimulator,
  ): Promise<{
    survP: number
    winsM: number
    winsP: number
  }> => {
    let winsP = 0,
      winsM = 0,
      survP = 0

    for (let i = 0; i < runs; i++) {
      // if controller.abort() called, stop immediately
      if (signal.aborted) {
        logger.log('⏹️ Simulation aborted')
        break
      }

      // allow UI to update
      await new Promise(requestAnimationFrame)

      progressBar.value = ((i + 1) / runs) * 100

      logger.log(`\n${'-'.repeat(80)}`)
      logger.log(`[Battle ${i + 1}]`)
      logger.log('-'.repeat(80))

      const sim = getBattleSimulator()
      sim.renderDetails()
      logger.log('\n')

      const res = sim.simulate()
      if (res.winner === Side.Players) {
        winsP++
        survP += res.survivors.filter((s) => s.side === Side.Players).length
      } else {
        winsM++
      }
    }

    return { survP, winsM, winsP }
  }

  runSimBtn.addEventListener('click', async (e): Promise<void> => {
    e.preventDefault()

    logger.clear()
    controller = new AbortController()
    signal = controller.signal
    document.body.style.cursor = 'wait'
    progressBar.value = 0
    stopSimBtn.removeAttribute('disabled')

    const runs = Math.max(1, parseInt(battleCount.value, 10) || 1)
    const initialP = playersBody.rows.length

    const startTime = performance.now()
    const { survP, winsM, winsP } = await runBattles(runs, signal, progressBar, logger, getBattleSimulator)
    const elapsedMs = performance.now() - startTime
    const elapsedSec = (elapsedMs / 1000).toFixed(1)

    logger.log('\n')
    logger.log(
      `Players win: ${((winsP / runs) * 100).toFixed(1)}%, Monsters win: ${((winsM / runs) * 100).toFixed(1)}%`,
    )

    if (winsP) {
      logger.log(`>> Avg Players survivors: ${((survP / (winsP * initialP)) * 100).toFixed(1)}%`)
    }
    logger.log(`>> Strategy ${strategySelect.value}, ${runs} battles`)
    logger.log(`>> Execution time: ${elapsedSec} s`)

    document.body.style.cursor = 'default'
  })

  stopSimBtn.addEventListener('click', () => {
    controller.abort()
    stopSimBtn.setAttribute('disabled', 'disabled')
  })
})
