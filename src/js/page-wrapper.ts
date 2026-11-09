import { MonsterNamesChunks, PlayerNamesChunks } from './config/names'
import {
  HenchmanCharTemplate,
  MonsterCharTemplate,
  MonsterTemplates,
  PlayerCharTemplate,
  PlayerTemplates,
} from './consts'
import { BattleSimulator } from './services/BattleSimulator'
import { LogLevel } from './services/ILogger'
import { Logger } from './services/Logger'
import { NameProvider } from './services/NameProvider'
import { getStrategy } from './services/strategies/getStrategy'
import { validateCharacters } from './services/validateCharacters'
import type { BattleSimulationConfig } from './types'
import { Side } from './types'
import { CharTable } from './ui/CharTable'
import { SettingsForm } from './ui/SettingsForm'
import { bindTabs } from './ui/tabs'

const waitUiUpdate = async (): Promise<void> => {
  // allow UI to update
  await new Promise(requestAnimationFrame)
}

const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T

const onClick = (id: string, handler: () => void): void => {
  byId(id).addEventListener('click', (e): void => {
    e.preventDefault()
    handler()
  })
}

document.addEventListener('DOMContentLoaded', (): void => {
  const runSimBtn = byId<HTMLButtonElement>('run-sim')
  const stopSimBtn = byId<HTMLButtonElement>('stop-sim')
  const progressBar = byId<HTMLProgressElement>('progress-bar')
  const configArea = byId<HTMLTextAreaElement>('config-area')

  const settings = new SettingsForm()
  const playersTable = new CharTable(byId('players-table'))
  const monstersTable = new CharTable(byId('monsters-table'))
  const playersNameProvider = new NameProvider(PlayerNamesChunks)
  const monsterNameProvider = new NameProvider(MonsterNamesChunks)

  let controller = new AbortController()
  let { signal } = controller
  const logger = new Logger('result-log')

  // initial setup
  playersTable.init(PlayerTemplates)
  monstersTable.init(MonsterTemplates)

  onClick('add-player', () => playersTable.addRow({ ...PlayerCharTemplate, prefix: playersNameProvider.getName() }))
  onClick('add-henchman', () =>
    playersTable.addRow({ ...HenchmanCharTemplate, prefix: playersNameProvider.getName('(H)') }),
  )
  onClick('clear-players', () => playersTable.init(PlayerTemplates))
  onClick('add-monster', () =>
    monstersTable.addRow({ ...MonsterCharTemplate, prefix: monsterNameProvider.getName('(M)') }),
  )
  onClick('clear-monsters', () => monstersTable.init(MonsterTemplates))

  onClick('clear-log', () => {
    logger.clear()
    progressBar.value = 0
  })

  bindTabs([
    { button: byId('tab-log-btn'), panel: byId('tab-log') },
    { button: byId('tab-config-btn'), panel: byId('tab-config') },
  ])

  // Import/Export
  onClick('export-config', () => {
    const cfg: BattleSimulationConfig = {
      ...settings.toConfig(),
      monsters: monstersTable.read(),
      players: playersTable.read(),
    }
    configArea.value = JSON.stringify(cfg, null, 2)
  })

  onClick('import-config', () => {
    try {
      const config = JSON.parse(configArea.value) as BattleSimulationConfig

      settings.applyConfig(config)
      playersTable.load(config.players)
      monstersTable.load(config.monsters)
    } catch (err) {
      console.error(err)
      alert('Invalid JSON config')
    }
  })

  const initProgressDisplay = (logsEnabled: boolean): void => {
    document.body.style.cursor = 'wait'

    if (logsEnabled) {
      progressBar.value = 0
    } else {
      runSimBtn.classList.add('inline-loading-indicator')
      logger.getContainer().classList.add('bg-muted')
    }
  }

  const stopProgressDisplay = (logsEnabled: boolean): void => {
    if (logsEnabled) {
      progressBar.value = 100
    } else {
      runSimBtn.classList.remove('inline-loading-indicator')
      logger.getContainer().classList.remove('bg-muted')
    }

    document.body.style.cursor = 'default'
  }

  const getBattleSimulator = (): BattleSimulator => {
    const { biasMonsters, biasPlayers, maxAttacksPerTarget, rounding, strategy } = settings.read()

    return new BattleSimulator(
      playersTable.read(),
      monstersTable.read(),
      strategy,
      rounding,
      biasPlayers,
      biasMonsters,
      maxAttacksPerTarget,
      logger,
    )
  }

  const runBattles = async (
    runs: number,
    signal: AbortSignal,
    progressBar: HTMLProgressElement,
    logger: Logger,
    getBattleSimulator: () => BattleSimulator,
    isLogEnabled: boolean,
  ): Promise<{
    completed: number
    draws: number
    survP: number
    winsM: number
    winsP: number
    roundsTotal: number
    roundsAvg: number
  }> => {
    let winsP = 0,
      winsM = 0,
      draws = 0,
      survP = 0,
      roundsTotal = 0,
      completed = 0

    for (let i = 0; i < runs; i++) {
      // if controller.abort() called, stop immediately
      if (signal.aborted) {
        logger.warn('⏹️ Simulation aborted')
        break
      }

      if (isLogEnabled && i % 50 === 0) {
        await waitUiUpdate()
        progressBar.value = ((i + 1) / runs) * 100
      }
      if (!isLogEnabled && i % 500 === 0) {
        await waitUiUpdate()
      }

      logger.delimiter()
      logger.log(`[Battle ${i + 1}]`)
      logger.delimiter()

      const sim = getBattleSimulator()
      sim.renderDetails()
      logger.lineBreak()

      const res = sim.simulate()
      if (res.winner === Side.Players) {
        winsP++
        survP += res.survivors.filter((s) => s.side === Side.Players).length
      } else if (res.winner === Side.Monsters) {
        winsM++
      } else {
        draws++
      }
      roundsTotal += res.rounds
      completed++

      logger.log(`>>> total rounds: ${res.rounds}`)
    }

    // the run may be aborted, so average over completed battles only
    const roundsAvg = completed > 0 ? parseFloat((roundsTotal / completed).toFixed(1)) : 0

    return { completed, draws, roundsAvg, roundsTotal, survP, winsM, winsP }
  }

  const validateInput = (): string[] => {
    const { rounding, strategy } = settings.read()
    const combatStrategy = getStrategy(strategy, rounding)

    return [
      ...settings.validate(),
      ...validateCharacters(playersTable.read(), combatStrategy, 'Players'),
      ...validateCharacters(monstersTable.read(), combatStrategy, 'Monsters'),
    ]
  }

  const prepareUiForSimulation = (logsEnabled: boolean): void => {
    logger.clear().setLevel(logsEnabled ? LogLevel.CAN_SKIP : LogLevel.NO_SKIP)
    runSimBtn.setAttribute('disabled', 'disabled')
    stopSimBtn.removeAttribute('disabled')
  }
  const releaseUiAfterSimulation = (): void => {
    runSimBtn.removeAttribute('disabled')
    stopSimBtn.setAttribute('disabled', 'disabled')
  }

  const percent = (value: number, total: number): string => ((value / total) * 100).toFixed(1)

  onClick('run-sim', async (): Promise<void> => {
    const errors = validateInput()
    if (errors.length > 0) {
      logger.clear()
      logger.warn('Invalid configuration:')
      errors.forEach((err) => logger.warn(`>> ${err}`))

      return
    }

    const { battleCount: runs, logsEnabled } = settings.read()
    initProgressDisplay(logsEnabled)
    prepareUiForSimulation(logsEnabled)

    controller = new AbortController()
    signal = controller.signal

    const initialP = playersTable.size

    try {
      logger.warn('Starting simulation...')
      const startTime = performance.now()
      const { completed, draws, roundsAvg, survP, winsM, winsP } = await runBattles(
        runs,
        signal,
        progressBar,
        logger,
        getBattleSimulator,
        logsEnabled,
      )
      const elapsedMs = performance.now() - startTime
      const elapsedSec = (elapsedMs / 1000).toFixed(1)

      logger.lineBreak(LogLevel.NO_SKIP)
      if (completed === 0) {
        logger.warn('No battles completed')

        return
      }

      logger.warn(`Players win: ${percent(winsP, completed)}%, Monsters win: ${percent(winsM, completed)}%`)
      if (draws > 0) {
        logger.warn(`>> Draws (round limit reached): ${percent(draws, completed)}%`)
      }
      if (winsP > 0) {
        logger.warn(`>> Avg Players survivors: ${percent(survP, winsP * initialP)}%`)
      }
      logger.warn(`>> Strategy ${settings.strategyLabel}, ${completed} of ${runs} battles`)
      logger.warn(`>> Avg Rounds: ${roundsAvg}`)
      logger.warn(`>> Execution time: ${elapsedSec} s`)
    } catch (err) {
      console.error(err)
      logger.warn(`Simulation failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      stopProgressDisplay(logsEnabled)
      releaseUiAfterSimulation()
    }
  })

  // UI is released by the run handler once the battle loop actually stops
  onClick('stop-sim', () => {
    controller.abort()
    stopSimBtn.setAttribute('disabled', 'disabled')
  })
})
