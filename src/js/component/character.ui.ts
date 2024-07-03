import { CharacterClasses } from '../config/snw/CharacterClasses'
import { CharacterClassDef } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { getState } from '../state/State'
import { assert } from '../utils/assert'
import { dispatchEvent } from '../utils/event'
import { createElementFromHtml } from '../utils/layout'
import {
  getBestClass,
  getCharacterHitPoints,
  getClassSuggestions,
  getRandomAttributes,
  getRandomClass,
} from '../utils/snw/character'

const getRootContainer = (inventoryId: string): HTMLElement => {
  const elem = document.querySelector<HTMLElement>(`#${inventoryId}-container .char-stats`)
  assert(elem, 'Character root container not found')

  return elem
}

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
  container.appendChild(
    createElementFromHtml(`<p><span class="font-bold text-gen-800">Armor</span>: ${classDef.ArmorPermitted}</p>`),
  )
  container.appendChild(
    createElementFromHtml(`<p><span class="font-bold text-gen-800">Weapons</span>: ${classDef.WeaponsPermitted}</p>`),
  )
  container.removeAttribute('hidden')
}

const renderAlignmentDetails = (container: HTMLElement, classDef: CharacterClassDef): void => {
  const alignment = classDef.Alignment.length === 3 ? 'Any' : classDef.Alignment.join(', ')
  container.appendChild(
    createElementFromHtml(`<p><span class="font-bold text-gen-800">Suggested alignment</span>: ${alignment}</p>`),
  )
  container.removeAttribute('hidden')
}

const renderRacesDetails = (container: HTMLElement, classDef: CharacterClassDef): void => {
  const races = classDef.Race.length === 3 ? 'Any' : classDef.Race.join(', ')
  container.appendChild(
    createElementFromHtml(`<p><span class="font-bold text-gen-800">Suggested races</span>: ${races}</p>`),
  )
  container.removeAttribute('hidden')
}

export const renderNewCharControlsSection = (inventoryId: string): void => {
  const container = getRootContainer(inventoryId).querySelector('.char-stats--controls')
  container.innerHTML = ''

  const template = document.querySelector<HTMLTemplateElement>('#template-new-char-controls')
  const clone = document.importNode(template.content, true)

  container.appendChild(clone)
  container.querySelector(`.add-new-random-char-btn`).addEventListener('click', () => {
    dispatchEvent('RenderNewRandomCharacter', { inventoryId })
    dispatchEvent('SelectInventory', { id: inventoryId })
  })

  container.querySelector(`.save-char-btn`).addEventListener('click', () => {
    if (getState().getInventory(inventoryId).character?.stats) {
      container.setAttribute('hidden', 'hidden')
      dispatchEvent('SerializeState')
      dispatchEvent('SelectInventory', { id: inventoryId })
    }
  })
}

export const renderCharacterSection = (
  inventoryId: string,
  classDef: CharacterClassDef,
  stats: CharacterStats,
): void => {
  const container = getRootContainer(inventoryId).querySelector('.char-stats--container')
  container.innerHTML = ''

  const template = document.getElementById('template-char-stats') as HTMLTemplateElement
  const clone = document.importNode(template.content, true)
  container.appendChild(clone)

  const tableStats = container.querySelector('table.table-stats')
  const tableBonuses = container.querySelector('table.table-bonuses')

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
    const casterDetailsContainer = container.querySelector<HTMLElement>('.char-stats--caster-details')
    renderCasterDetails(casterDetailsContainer, classDef, stats)
  }

  renderArmorDetails(container.querySelector<HTMLElement>('.char-stats--armor'), classDef)
  renderAlignmentDetails(container.querySelector<HTMLElement>('.char-stats--alignment'), classDef)
  renderRacesDetails(container.querySelector<HTMLElement>('.char-stats--races'), classDef)

  // Other details
  container.querySelector('.char-gold').textContent = stats.Gold.toString()
  container.querySelector('.char-hp').textContent = stats.HitPoints.toString()
  container.querySelector('.char-hd').textContent = classDef.HitDice.toString()
  container.querySelector('.char-class').textContent = classDef.name
}

export const handleCharacterRemoval = (inventoryId: string): void => {
  const state = getState()
  const inventory = state.getInventory(inventoryId)

  if (confirm(`Remove character ${inventory.name}? The inventory will remain available.`)) {
    state.removeCharacter(inventoryId)
    state.setCurrentInventoryId(inventory.id)

    dispatchEvent('RenderInventories')
    dispatchEvent('SelectInventory', { id: inventory.id })
  }
}

export const handleNewRandomCharacterInit = (inventoryId: string): void => {
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

  charStats.HitPoints = getCharacterHitPoints(charClass, charStats.Constitution.HitPoints)
  state.setCharacter(inventoryId, charClass, charStats)

  renderCharacterSection(inventoryId, charClass, charStats)
}

/**
 * Run once
 */
export const initCharacterSectionUi = (): void => {
  void 0
}
