import { CharacterClasses } from '../config/snw/CharacterClasses'
import { CasterSpells } from '../config/snw/Magic'
import { Inventory, InventoryItem } from '../domain/Inventory'
import { CharacterClass, CharacterClassDef } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { Spell } from '../domain/snw/Magic'
import { CharacterOptions, getState } from '../state/State'
import { assert } from '../utils/assert'
import { dispatchEvent } from '../utils/event'
import { createElementFromHtml } from '../utils/layout'
import { getCharArmorClass } from '../utils/snw/armorClass'
import {
  getBestClass,
  getCharacterHitPoints,
  getClassSuggestions,
  getRandomAttributes,
  getRandomClass,
} from '../utils/snw/character'
import { getExperienceBonus } from '../utils/snw/experience'
import { getMagicUserSpellsList } from '../utils/snw/magic'

const getRootContainer = (inventoryId: string): HTMLElement => {
  const elem = document.querySelector<HTMLElement>(`#${inventoryId}-container .char-stats`)
  assert(elem, 'Character root container not found')

  return elem
}

const renderSpellsList = (container: HTMLElement, spells: Record<string, Spell>): void => {
  const list = createElementFromHtml('<ul class="column-count-2" />')

  for (const s in spells) {
    list.appendChild(createElementFromHtml(`<li class="break-inside-avoid text-alt">${spells[s].name}</li>`))
  }

  container.appendChild(list)
}

export const renderCasterDetails = (
  container: HTMLElement,
  classDef: CharacterClassDef,
  inventory: Inventory,
): void => {
  const col1 = container.querySelector<HTMLElement>('.char-stats--caster-details-col-1')
  const col2 = container.querySelector<HTMLElement>('.char-stats--caster-details-col-2')
  const magicUserProps = ['NewSpellUnderstandingChance', 'SpellsPerLevel']
  const ignoredProps = ['MaxAdditionalLanguages', 'Score']
  const stats = inventory.character?.stats

  if (!stats) {
    throw new Error('renderCasterDetails: Invalid CharacterStats')
  }

  const getDetailsItem = (key, value): HTMLElement => {
    const elem = document.createElement('p')
    const formatted = key.replace(/([A-Z])/g, ' $1').trim()

    elem.innerHTML = `${formatted}: <span class="text-alt">${value}</span>`

    return elem
  }

  Object.entries(stats.Intelligence).forEach(([key, value]) => {
    if (ignoredProps.includes(key)) {
      return false
    }
    if (classDef.name !== 'MagicUser' && magicUserProps.includes(key)) {
      return false
    }

    col1.appendChild(getDetailsItem(key, value))
  })

  const spellsNum = classDef.name === 'Cleric' && stats.Wisdom.Score >= 15 ? 1 : classDef.$spellsAtTheFirstLevel
  col1.appendChild(getDetailsItem('Spells at the 1st level', spellsNum))

  if (inventory.character?.spells === 'All') {
    renderSpellsList(col2, CasterSpells[classDef.name])
  } else if (!!inventory.character?.spells && typeof inventory.character?.spells === 'object') {
    renderSpellsList(col2, inventory.character.spells)
  } else {
    col2.appendChild(getDetailsItem('Spells', 'Your character has an incomplete configuration. Try adding a new one.'))
  }

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

const renderArmorClassDetails = (
  container: HTMLElement,
  stats: CharacterStats,
  items: Record<string, InventoryItem>,
): void => {
  const armorClass = getCharArmorClass(stats, items)

  container.innerHTML = [
    armorClass.armor,
    '<span class="underline underline-offset-4 decoration-dashed decoration-gray-300 hover:cursor-help" title="Descending AC [Ascending AC]">',
    'AC',
    armorClass.dac,
    `[${armorClass.aac}]`,
    '</span>',
  ].join(' ')
}

const renderSavingThrowDetails = (container: HTMLElement, classDef: CharacterClassDef) => {
  const valueContainer = container.querySelector('.char-saving-throw--value')
  const detailsContainer = container.querySelector('.char-saving-throw--details')

  valueContainer.textContent = classDef.SavingThrow.swn.value.toString()
  detailsContainer.textContent = classDef.SavingThrow.swn.details ?? ''
}

/**
 * @notice No direct calls
 */
export const handleRenderNewCharControlsSection = (inventoryId: string): void => {
  const container = getRootContainer(inventoryId).querySelector('.char-stats--controls')
  container.innerHTML = ''

  const template = document.querySelector<HTMLTemplateElement>('#template-new-char-controls')
  const clone = document.importNode(template.content, true)

  container.appendChild(clone)
  container.querySelector(`.add-new-random-char-btn`).addEventListener('click', () => {
    dispatchEvent('RenderNewRandomCharacter', { inventoryId })
    dispatchEvent('SelectInventory', { inventoryId })
  })

  container.querySelector(`.save-char-btn`).addEventListener('click', () => {
    if (getState().getInventory(inventoryId).character?.stats) {
      container.setAttribute('hidden', 'hidden')
      dispatchEvent('SerializeState')
      dispatchEvent('SelectInventory', { inventoryId })
    }
  })
}

export const handleRenderCharacterSection = (inventoryId: string): void => {
  const inventory = getState().getInventory(inventoryId)
  const { classDef, stats } = inventory.character || {}
  assert(classDef && stats, `No character data found for inventory ${inventoryId}`)

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
    renderCasterDetails(casterDetailsContainer, classDef, inventory)
  }

  renderArmorDetails(container.querySelector<HTMLElement>('.char-stats--armor'), classDef)
  renderAlignmentDetails(container.querySelector<HTMLElement>('.char-stats--alignment'), classDef)
  renderRacesDetails(container.querySelector<HTMLElement>('.char-stats--races'), classDef)
  renderArmorClassDetails(container.querySelector('.char-ac'), stats, inventory.items)
  renderSavingThrowDetails(container.querySelector('.char-saving-throw'), classDef)

  // Other details
  container.querySelector('.char-gold').textContent = stats.Gold.toString()
  container.querySelector('.char-hp').textContent = stats.HitPoints.toString()
  container.querySelector('.char-hd').textContent = classDef.HitDice.toString()
  container.querySelector('.char-class').textContent = classDef.name
  container.querySelector('.char-exp-bonus').textContent = getExperienceBonus(classDef, stats).toString()
}

/**
 * @notice No direct calls
 */
export const handleRemoveCharacter = (inventoryId: string): void => {
  const state = getState()
  const inventory = state.getInventory(inventoryId)

  if (confirm(`Remove character ${inventory.name}? The inventory will remain available.`)) {
    state.removeCharacter(inventoryId)

    dispatchEvent('RenderInventories')
    dispatchEvent('SelectInventory', { inventoryId: inventory.id })
  }
}

/**
 * @notice No direct calls
 */
export const handleRenderNewRandomCharacter = (inventoryId: string): void => {
  const state = getState()
  const stats = getRandomAttributes()
  const suggestions = getClassSuggestions(stats, 'PrimeAttr')

  let classDef
  try {
    const matched = getBestClass(suggestions)

    // Debug
    // const matched = getBestClass([['Cleric', [['Wisdom', 13]], { Constitution: 14, Wisdom: 16 }]])

    if (matched) {
      classDef = CharacterClasses[matched]
    } else {
      throw new Error('Character class not found')
    }
  } catch (err) {
    console.info('No matching classes. Choosing random', err.message)
    classDef = getRandomClass()
  }

  stats.HitPoints = getCharacterHitPoints(classDef, stats.Constitution.HitPoints)
  const charOptions: CharacterOptions = { classDef, stats }
  if (classDef.$isCaster) {
    if (classDef.name === CharacterClass.Druid || classDef.name === CharacterClass.Cleric) {
      charOptions.spells = 'All'
    } else if (classDef.name === CharacterClass.MagicUser) {
      charOptions.spells = getMagicUserSpellsList(stats)
    } else {
      throw new Error('Unknown type of caster')
    }
  }

  state.setCharacter(inventoryId, charOptions)

  dispatchEvent('RenderCharacterSection', { inventoryId })
}

/**
 * Run once
 */
export const initCharacterSectionUi = (): void => {
  void 0
}
