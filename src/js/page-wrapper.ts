import { MonsterNamesChunks, PlayerNamesChunks } from './config/names'
import type { MonsterTrait } from './consts'
import {
  HenchmanCharTemplate,
  MonsterCharTemplate,
  MonsterTemplates,
  PlayerCharTemplate,
  PlayerTemplates,
} from './consts'
import { ConfigParser } from './services/config/ConfigParser'
import { LogLevel } from './services/logger/ILogger'
import { Logger } from './services/logger/Logger'
import { messages } from './services/messages/MessageService'
import { NameProvider } from './services/NameProvider'
import { getStrategy } from './services/strategies/getStrategy'
import { getCharacterValidator } from './services/validation/CharacterValidator'
import { SettingsValidator } from './services/validation/SettingsValidator'
import { SimulationRunner } from './simulation/SimulationRunner'
import { SummaryFormatter } from './simulation/SummaryFormatter'
import type { BattleSimulationConfig } from './types'
import { AttackWizard } from './ui/AttackWizard'
import { CharTable } from './ui/CharTable'
import { DamageField } from './ui/DamageField'
import { EmojiTicker } from './ui/EmojiTicker'
import { bindLogoSpin } from './ui/logo'
import { bindModal } from './ui/modal'
import { SettingsForm } from './ui/SettingsForm'
import { bindTabs } from './ui/tabs'
import { addTraitAttacks } from './utils/addTraitAttacks'
import { byId, onClick } from './utils/dom'
import { applyFeatureFlagClasses } from './utils/featureFlags'

document.addEventListener('DOMContentLoaded', (): void => {
  applyFeatureFlagClasses(window.location.search, document.body)
  byId('app-version').textContent = `v${import.meta.env.WMR_APP_VERSION}`

  const runSimBtn = byId<HTMLButtonElement>('run-sim')
  const stopSimBtn = byId<HTMLButtonElement>('stop-sim')
  const progressBar = byId<HTMLProgressElement>('progress-bar')
  const logBackdrop = byId('tab-log')
  const configArea = byId<HTMLTextAreaElement>('config-area')

  const settings = new SettingsForm()
  const damageField = new DamageField(new AttackWizard(byId('attack-wizard')))
  const playersTable = new CharTable(byId('players-table'), damageField)
  const monstersTable = new CharTable(byId('monsters-table'), damageField)
  const playersNameProvider = new NameProvider(PlayerNamesChunks)
  const monsterNameProvider = new NameProvider(MonsterNamesChunks)

  const logger = new Logger('result-log')
  const runner = new SimulationRunner()
  const summaryFormatter = new SummaryFormatter()
  const settingsValidator = new SettingsValidator()
  const configParser = new ConfigParser()
  const runSimTicker = new EmojiTicker(runSimBtn)

  // initial setup
  playersTable.init(PlayerTemplates)
  monstersTable.init(MonsterTemplates)

  onClick(byId('add-player'), () =>
    playersTable.addRow({ ...PlayerCharTemplate, prefix: playersNameProvider.getName() }),
  )
  onClick(byId('add-henchman'), () =>
    playersTable.addRow({ ...HenchmanCharTemplate, prefix: playersNameProvider.getName('(H)') }),
  )
  onClick(byId('clear-players'), () => playersTable.init(PlayerTemplates))
  const readMonsterTraits = (): MonsterTrait[] =>
    Array.from(document.querySelectorAll<HTMLInputElement>('.monster-trait:checked')).map(
      (cb) => cb.dataset.trait as MonsterTrait,
    )

  onClick(byId('add-monster'), () => {
    const traits = readMonsterTraits()

    monstersTable.addRow({
      ...MonsterCharTemplate,
      damage: addTraitAttacks(traits, traits.length ? '' : 'd6<Claws>'),
      prefix: monsterNameProvider.getName('(M)'),
    })
  })
  onClick(byId('clear-monsters'), () => monstersTable.init(MonsterTemplates))

  onClick(byId('clear-log'), () => {
    logger.clear()
    progressBar.value = 0
    // the pulse froze on some frame when the last simulation ended: rewind it, to show the backdrop as on page load
    logBackdrop.getAnimations({ subtree: true }).forEach((animation) => (animation.currentTime = 0))
    logBackdrop.classList.add('log-backdrop--visible')
  })

  bindTabs([
    { button: byId('tab-log-btn'), panel: byId('tab-log') },
    { button: byId('tab-config-btn'), panel: byId('tab-config') },
  ])

  bindModal(byId('damage-help'), document.querySelectorAll<HTMLElement>('.damage-help-btn, [data-open-damage-help]'))
  bindModal(byId('app-help'), document.querySelectorAll<HTMLElement>('[data-open-app-help]'))
  // opened by the wizard buttons of every character, through DamageField
  bindModal(byId('attack-wizard'), [])
  bindLogoSpin(document.querySelector<HTMLElement>('.logo-img')!)

  // Import/Export
  onClick(byId('export-config'), () => {
    const cfg: BattleSimulationConfig = {
      ...settings.toConfig(),
      monsters: monstersTable.read(),
      players: playersTable.read(),
    }
    configArea.value = JSON.stringify(cfg, null, 2)
  })

  onClick(byId('import-config'), () => {
    const result = configParser.parse(configArea.value)
    if (!result.ok) {
      alert(messages.t('config.importFailed', { errors: result.errors.join('\n') }))

      return
    }

    settings.applyConfig(result.config)
    playersTable.load(result.config.players)
    monstersTable.load(result.config.monsters)
  })

  const startProgressDisplay = (logsEnabled: boolean): void => {
    document.body.style.cursor = 'wait'
    progressBar.value = 0
    logBackdrop.classList.add('log-backdrop--visible', 'log-backdrop--pulsing')

    if (!logsEnabled) {
      logger.getContainer().classList.add('bg-muted')
    }
  }

  const stopProgressDisplay = (): void => {
    logger.getContainer().classList.remove('bg-muted')
    logBackdrop.classList.remove('log-backdrop--visible', 'log-backdrop--pulsing')
    document.body.style.cursor = 'default'
  }

  const validateInput = (): string[] => {
    const current = settings.read()
    const validator = getCharacterValidator(getStrategy(current.strategy, current.rounding))

    return [
      ...settingsValidator.validate(current),
      ...validator.validate(playersTable.read(), messages.t('sides.players')),
      ...validator.validate(monstersTable.read(), messages.t('sides.monsters')),
    ]
  }

  const lockUiForSimulation = (): void => {
    runSimBtn.setAttribute('disabled', 'disabled')
    stopSimBtn.removeAttribute('disabled')
    runSimTicker.start()
  }
  const releaseUiAfterSimulation = (): void => {
    runSimTicker.stop()
    runSimBtn.removeAttribute('disabled')
    stopSimBtn.setAttribute('disabled', 'disabled')
  }

  onClick(byId('run-sim'), async (): Promise<void> => {
    logger.clear()

    const errors = validateInput()
    if (errors.length > 0) {
      logger.warn(messages.t('simulation.invalidInput'))
      errors.forEach((error) => logger.warn(messages.t('simulation.invalidInputItem', { error })))

      return
    }

    // the configuration is read once and sent to the worker as plain data
    const request = { monsters: monstersTable.read(), players: playersTable.read(), settings: settings.read() }
    const runs = request.settings.battleCount

    startProgressDisplay(request.settings.logsEnabled)
    lockUiForSimulation()

    try {
      logger.warn(messages.t('simulation.starting'))
      const startTime = performance.now()
      const { aborted, stats } = await runner.run(request, (current, lines) => {
        logger.write(lines)
        progressBar.value = (current.completed / runs) * 100
      })

      if (aborted) {
        logger.warn(messages.t('simulation.aborted'))
      }
      logger.lineBreak(LogLevel.NO_SKIP)
      summaryFormatter
        .format(stats, {
          elapsedMs: performance.now() - startTime,
          playersCount: request.players.length,
          runs,
          strategyLabel: settings.strategyLabel,
        })
        .forEach((line) => logger.warn(line))
    } catch (err) {
      console.error(err)
      logger.warn(messages.t('simulation.failed', { error: err instanceof Error ? err.message : String(err) }))
    } finally {
      stopProgressDisplay()
      releaseUiAfterSimulation()
    }
  })

  // stops the worker immediately; the run handler then reports stats of the finished battles
  onClick(byId('stop-sim'), () => runner.stop())
})
