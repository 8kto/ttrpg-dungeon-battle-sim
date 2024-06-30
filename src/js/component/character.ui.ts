import { CharacterClassDef } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { BaseMovementRate } from '../domain/snw/Movement'
import { getUndergroundSpeed } from '../utils/snw/movement'

export const renderCasterDetails = (
  container: HTMLElement,
  classDef: CharacterClassDef,
  stats: CharacterStats,
): void => {
  const intelligenceAttr = stats.Intelligence
  const magicUserProps = ['NewSpellUnderstandingChance', 'SpellsPerLevel']
  const ignoredProps = ['MaxAdditionalLanguages', 'Score']

  const getDetailsItem = (key, value): HTMLElement => {
    const elem = document.createElement('p')
    const formatted = key.replace(/([A-Z])/g, ' $1').trim()

    elem.innerHTML = `${formatted}: <span class="text-alt">${value}</span>`

    return elem
  }

  Object.entries(intelligenceAttr).forEach(([key, value]) => {
    if (ignoredProps.includes(key)) {
      return false
    }
    if (classDef.name !== 'MagicUser' && magicUserProps.includes(key)) {
      return false
    }

    container.appendChild(getDetailsItem(key, value))
  })

  const spellsNum = classDef.name === 'Cleric' && stats.Wisdom.Score >= 15 ? 1 : classDef.$spellsAtTheFirstLevel
  container.appendChild(getDetailsItem('Spells at the 1st level', spellsNum))

  container.removeAttribute('hidden')
}

export const renderStatsContainer = (
  container: HTMLElement,
  stats: CharacterStats,
  classDef: CharacterClassDef,
): void => {
  const template = document.getElementById('template-stats') as HTMLTemplateElement
  const clone = document.importNode(template.content, true)

  const tableStats = clone.querySelector('table.table-stats')
  const tableBonuses = clone.querySelector('table.table-bonuses')

  Object.entries(stats).forEach(([statName, stat]) => {
    const { Score, ...bonuses } = stat

    // Attribute scores
    const statCell = tableStats.querySelector(`.col-stat-${statName} td:nth-child(2)`)
    if (statCell) {
      statCell.textContent = Score
    }

    // Attribute bonuses
    Object.entries(bonuses).forEach(([bonusName, bonus]) => {
      const bonusCell = tableBonuses.querySelector(`.col-bonus-${bonusName} td:nth-child(2)`)

      if (bonusCell) {
        bonusCell.textContent = bonus.toString()
      }
    })
  })

  if (classDef.$isCaster) {
    const casterDetailsContainer = clone.querySelector<HTMLElement>('.char-stats--caster-details')
    renderCasterDetails(casterDetailsContainer, classDef, stats)
  }

  // Other details
  clone.querySelector('.char-gold').textContent = stats.Gold.toString()
  clone.querySelector('.char-hp').textContent = stats.HitPoints.toString()
  clone.querySelector('.char-hd').textContent = classDef.HitDice.toString()
  clone.querySelector('.char-class').textContent = classDef.name

  container.appendChild(clone)
}

/**
 * Updates the HTML element with speeds for walking, running, and combat
 * based on the base movement rate.
 */
export const updateSpeedDisplay = (inventoryId: string, baseMovementRate: BaseMovementRate): void => {
  const speeds = getUndergroundSpeed(baseMovementRate)
  document.getElementById(`${inventoryId}-speed-feet-per-turn`).innerHTML =
    `Walking: <span class="text-alt">${speeds.walking}</span>` +
    ` • Running: <span class="text-alt">${speeds.running}</span>` +
    ` • Combat: <span class="text-alt">${speeds.combat}</span>`
}

export const renderCharacterSection = (
  inventoryId: string,
  charClass: CharacterClassDef,
  charStats: CharacterStats,
): void => {
  const container = document.querySelector<HTMLElement>(`#${inventoryId}-container .char-stats`)

  container.innerHTML = ''
  renderStatsContainer(container, charStats, charClass)
}
