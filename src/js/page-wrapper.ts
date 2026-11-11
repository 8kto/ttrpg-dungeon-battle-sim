import { MonsterNamesChunks, PlayerNamesChunks } from './config/names'
import {
  HenchmanCharTemplate,
  MonsterCharTemplate,
  MonsterTemplates,
  PlayerCharTemplate,
  PlayerTemplates,
} from './consts'
import { LogLevel } from './services/logger/ILogger'
import { Logger } from './services/logger/Logger'
import { NameProvider } from './services/NameProvider'
import { getStrategy } from './services/strategies/getStrategy'
import { validateCharacters } from './services/validateCharacters'
import { SimulationRunner } from './simulation/SimulationRunner'
import { formatSummary } from './simulation/stats'
import type { BattleSimulationConfig } from './types'
import { CharTable } from './ui/CharTable'
import { SettingsForm } from './ui/SettingsForm'
import { bindTabs } from './ui/tabs'

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

  const logger = new Logger('result-log')
  const runner = new SimulationRunner()

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

  const startProgressDisplay = (logsEnabled: boolean): void => {
    document.body.style.cursor = 'wait'
    progressBar.value = 0

    if (!logsEnabled) {
      runSimBtn.classList.add('inline-loading-indicator')
      logger.getContainer().classList.add('bg-muted')
    }
  }

  const stopProgressDisplay = (): void => {
    runSimBtn.classList.remove('inline-loading-indicator')
    logger.getContainer().classList.remove('bg-muted')
    document.body.style.cursor = 'default'
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

  const lockUiForSimulation = (): void => {
    runSimBtn.setAttribute('disabled', 'disabled')
    stopSimBtn.removeAttribute('disabled')
  }
  const releaseUiAfterSimulation = (): void => {
    runSimBtn.removeAttribute('disabled')
    stopSimBtn.setAttribute('disabled', 'disabled')
  }

  onClick('run-sim', async (): Promise<void> => {
    logger.clear()

    const errors = validateInput()
    if (errors.length > 0) {
      logger.warn('Invalid configuration:')
      errors.forEach((err) => logger.warn(`>> ${err}`))

      return
    }

    // the configuration is read once and sent to the worker as plain data
    const request = { monsters: monstersTable.read(), players: playersTable.read(), settings: settings.read() }
    const runs = request.settings.battleCount

    startProgressDisplay(request.settings.logsEnabled)
    lockUiForSimulation()

    try {
      logger.warn('Starting simulation...')
      const startTime = performance.now()
      const { aborted, stats } = await runner.run(request, (current, lines) => {
        logger.write(lines)
        progressBar.value = (current.completed / runs) * 100
      })

      if (aborted) {
        logger.warn('⏹️ Simulation aborted')
      }
      logger.lineBreak(LogLevel.NO_SKIP)
      formatSummary(stats, {
        elapsedMs: performance.now() - startTime,
        playersCount: request.players.length,
        runs,
        strategyLabel: settings.strategyLabel,
      }).forEach((line) => logger.warn(line))
    } catch (err) {
      console.error(err)
      logger.warn(`Simulation failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      stopProgressDisplay()
      releaseUiAfterSimulation()
    }
  })

  // stops the worker immediately; the run handler then reports stats of the finished battles
  onClick('stop-sim', () => runner.stop())
})
