import { CharacterClasses } from '../config/snw/CharacterClasses'
import { CharacterClassDef } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { getState } from '../state/State'
import { createElementFromHtml } from '../utils/layout'
import {
  getBestClass,
  getCharHitPoints,
  getClassSuggestions,
  getRandomAttributes,
  getRandomClass,
} from '../utils/snw/character'

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

const renderArmorDetails = (container: HTMLElement, classDef: CharacterClassDef): void => {
  const armorDetails = createElementFromHtml('<p>')
  const weaponsDetails = createElementFromHtml('<p>')

  armorDetails.innerHTML = `<span class="font-bold">Armor</span>: ${classDef.ArmorPermitted}`
  weaponsDetails.innerHTML = `<span class="font-bold">Weapons</span>: ${classDef.WeaponsPermitted}`

  container.appendChild(armorDetails)
  container.appendChild(weaponsDetails)
  container.removeAttribute('hidden')
}

export const renderStatsContainer = (
  container: HTMLElement,
  stats: CharacterStats,
  classDef: CharacterClassDef,
): void => {
  const template = document.getElementById('template-char-stats') as HTMLTemplateElement
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

  renderArmorDetails(clone.querySelector<HTMLElement>('.char-stats--armor'), classDef)

  // Other details
  clone.querySelector('.char-gold').textContent = stats.Gold.toString()
  clone.querySelector('.char-hp').textContent = stats.HitPoints.toString()
  clone.querySelector('.char-hd').textContent = classDef.HitDice.toString()
  clone.querySelector('.char-class').textContent = classDef.name

  container.appendChild(clone)
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

export const handleNewRandomCharInit = (): void => {
  const state = getState()
  const charStats = getRandomAttributes()
  const suggestions = getClassSuggestions(charStats, 'PrimeAttr')

  let charClass
  try {
    const matched = getBestClass(suggestions)

    // FIXME debug
    // const matched = getBestClass([['Cleric', [['Wisdom', 13]], { Constitution: 14, Wisdom: 16 }]])

    if (matched) {
      charClass = CharacterClasses[matched]
    } else {
      throw new Error('Character class not found')
    }
  } catch (err) {
    console.info('No matching classes. Choosing random', err.message)
    charClass = getRandomClass()
  }

  charStats.HitPoints = getCharHitPoints(charClass, charStats.Constitution.HitPoints)
  const currentInventoryId = state.getCurrentInventoryId()
  state.setCharacter(currentInventoryId, charClass, charStats)
  renderCharacterSection(currentInventoryId, charClass, charStats)
}

export const initCharacterSectionUi = (): void => {
  void 0
}
