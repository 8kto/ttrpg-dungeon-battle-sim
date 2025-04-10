import { CharacterClasses } from '../config/snw/CharacterClasses'
import { CasterSpells } from '../config/snw/Magic'
import type { Inventory, InventoryItem } from '../domain/Inventory'
import type { Attributes } from '../domain/snw/Attributes'
import type { Character } from '../domain/snw/Character'
import type { CharacterClassDef } from '../domain/snw/CharacterClass'
import type { Spell } from '../domain/snw/Magic'
import { getState } from '../state/State'
import { assert } from '../utils/assert'
import { dispatchEvent } from '../utils/event'
import { createElementFromHtml, getElementById, getTitleFromId } from '../utils/layout'
import { getCharArmorClass } from '../utils/snw/armorClass'
import {
  getBestClass,
  getClassSuggestions,
  getNewCharacter,
  getRandomAttributes,
  getRandomClass,
} from '../utils/snw/character'
import { getToHitMelee, getToHitMissiles } from '../utils/snw/combat'
import { getExperienceBonus } from '../utils/snw/experience'
import { getCompactModeAffectedElements } from './domSelectors'
import { showModal } from './modal'

const getRootContainer = (inventoryId: string): HTMLElement => {
  const elem = document.querySelector<HTMLElement>(`#${inventoryId}-container .char-stats`)
  assert(elem, 'Character root container not found')

  return elem
}

const bindSpellsControls = (inventoryId: string, container: HTMLElement): void => {
  const items = container.querySelectorAll<HTMLInputElement>('.char-spells-list--item')

  const getCheckedValues = (): string[] =>
    Array.from(container.querySelectorAll('input:checked')).map((checkbox) => (checkbox as HTMLInputElement).value)

  items.forEach((elem) => {
    elem.addEventListener('click', () => {
      const spells = getCheckedValues()

      if (spells.length) {
        getState().setPreparedSpells(inventoryId, spells)
      }
    })
  })
}

const renderSpellsList = (container: HTMLElement, inventory: Inventory): void => {
  let spells: Record<string, Spell> | null = null
  const prepared = inventory.character?.prepared

  if (inventory.character?.spells === 'All') {
    const className = inventory.character.classDef.name as keyof typeof CasterSpells
    spells = CasterSpells[className] ?? null
  } else if (!!inventory.character?.spells && typeof inventory.character?.spells === 'object') {
    spells = inventory.character.spells
  } else {
    container.appendChild(
      createElementFromHtml('<p>Your character has an incomplete configuration. Try adding a new one.</p>'),
    )

    return
  }

  assert(spells, 'Cannot get character spells')

  const inventoryId = inventory.id
  const list = createElementFromHtml('<ul class="char-spells-list column-count-2" />')

  for (const s in spells) {
    const spellName = spells[s].name
    list.appendChild(
      createElementFromHtml(
        [
          `<li class="break-inside-avoid text-details flex items-stretch mb-1">`,
          `<label for="${inventoryId}-${spellName}" class="flex items-center">`,
          `<input class="char-spells-list--item mr-2 flex-shrink-0 checkbox border-4" type="checkbox" name=""`,
          `id="${inventoryId}-${spellName}" `,
          `value="${spellName}"`,
          `title="Check to prepare a spell"`,
          prepared?.includes(spellName) ? 'checked' : '',
          `><span class="label-text">${spellName}</span></label>`,
          `</li>`,
        ].join(' '),
      ),
    )
  }

  bindSpellsControls(inventoryId, list)
  container.appendChild(list)
}

export const renderCasterDetails = (
  container: HTMLElement,
  classDef: CharacterClassDef,
  inventory: Inventory,
): void => {
  const col1 = container.querySelector<HTMLElement>('.char-stats--caster-details-col-1')!
  const col2 = container.querySelector<HTMLElement>('.char-stats--caster-details-col-2')!
  const magicUserProps = ['NewSpellUnderstandingChance', 'SpellsPerLevel']
  const ignoredProps = ['MaxAdditionalLanguages', 'Score']
  const stats = inventory.character?.stats

  if (!stats) {
    throw new Error('renderCasterDetails: Invalid CharacterStats')
  }

  const getDetailsItem = (key: string, value: string | number): HTMLElement => {
    const elem = document.createElement('p')
    const formatted = getTitleFromId(key)

    elem.innerHTML = `${formatted}: <span class="text-details">${value}</span>`

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
  col1.appendChild(getDetailsItem('Spells at the 1st level', spellsNum ?? 'NA'))

  renderSpellsList(col2, inventory)

  container.removeAttribute('hidden')
}

const renderArmorDetails = (container: HTMLElement, classDef: CharacterClassDef): void => {
  container.appendChild(
    createElementFromHtml(`<p>Armor: <span class="text-details">${classDef.ArmorPermitted}</span></p>`),
  )
  container.appendChild(
    createElementFromHtml(`<p>Weapons: <span class="text-details">${classDef.WeaponsPermitted}</span></p>`),
  )
  container.removeAttribute('hidden')
}

const renderAlignmentDetails = (container: HTMLElement, classDef: CharacterClassDef): void => {
  const alignment = classDef.Alignment.length === 3 ? 'Any' : classDef.Alignment.join(', ')
  container.appendChild(
    createElementFromHtml(`<p>Suggested alignment: <span class="text-details">${alignment}</span></p>`),
  )
  container.removeAttribute('hidden')
}

const renderRacesDetails = (container: HTMLElement, classDef: CharacterClassDef): void => {
  const races = classDef.Race.length === 3 ? 'Any' : classDef.Race.join(', ')
  container.appendChild(createElementFromHtml(`<p>Suggested ancestry: <span class="text-details">${races}</span></p>`))
  container.removeAttribute('hidden')
}

const renderArmorClassDetails = (
  container: HTMLElement,
  stats: Attributes,
  items: Record<string, InventoryItem>,
): void => {
  const armorClass = getCharArmorClass(stats, items)

  container.innerHTML = [
    '<span class="underline underline-offset-4 decoration-dashed decoration-gray-300 hover:cursor-help" title="Descending AC [Ascending AC]">',
    '<span class="text-details">',
    armorClass.dac,
    `[${armorClass.aac}]`,
    '</span>',
    '</span>',
    '<span class="text-details--alt">',
    armorClass.armor,
    '</span>',
  ].join(' ')
}

const renderSavingThrowDetails = (container: HTMLElement, classDef: CharacterClassDef): void => {
  const valueContainer = container.querySelector('.char-saving-throw--value')!
  const detailsContainer = container.querySelector('.char-saving-throw--details')!
  const altDetailsContainer = container.querySelector('.char-saving-throw--alt-details')!
  const toggleButton = container.querySelector('.char-saving-throw--toggle')!

  valueContainer.textContent = classDef.SavingThrow.snw.value.toString()
  detailsContainer.textContent = classDef.SavingThrow.snw.details ?? ''

  const altList = Object.entries(classDef.SavingThrow.alternative)
    .map(([key, def]) => {
      return `<li class="">${getTitleFromId(key)}: <span class="text-details">${def}</span></li>`
    })
    .join('')
  altDetailsContainer.innerHTML = `<ul class="list-square list-inside ml-2 text-details--alt">${altList}</ul>`

  let toggled = false
  toggleButton.addEventListener('click', () => {
    if (!toggled) {
      valueContainer.setAttribute('hidden', 'hidden')
      detailsContainer.setAttribute('hidden', 'hidden')
      altDetailsContainer.removeAttribute('hidden')
    } else {
      valueContainer.removeAttribute('hidden')
      detailsContainer.removeAttribute('hidden')
      altDetailsContainer.setAttribute('hidden', 'hidden')
    }
    toggled = !toggled
  })
}

/**
 * @notice No direct calls
 */
export const handleRenderNewCharControlsSection = (inventoryId: string): void => {
  const container = getRootContainer(inventoryId).querySelector('.char-stats--controls')!
  container.innerHTML = ''

  const template = getElementById<HTMLTemplateElement>('template-new-char-controls')!
  const clone = document.importNode(template.content, true)

  container.appendChild(clone)
  container.querySelector(`.add-new-random-char-btn`)!.addEventListener('click', () => {
    dispatchEvent('RenderNewRandomCharacter', { inventoryId })
    dispatchEvent('SelectInventory', { inventoryId })
  })

  container.querySelector(`.save-char-btn`)!.addEventListener('click', () => {
    if (getState().getInventory(inventoryId).character?.stats) {
      container.setAttribute('hidden', 'hidden')
      dispatchEvent('SerializeState')
      dispatchEvent('SelectInventory', { inventoryId })
    }
  })
}

export const handleRenderCharacterSection = (inventoryId: string): void => {
  const inventory = getState().getInventory(inventoryId)
  if (!inventory.character) {
    return
  }

  const { classDef, gold, hitPoints, stats } = inventory.character
  const characterClass = classDef.name
  assert(characterClass && stats, `No character data found for inventory ${inventoryId}`)

  const container = getRootContainer(inventoryId).querySelector('.char-stats--container')!
  container.innerHTML = ''

  const template = getElementById<HTMLTemplateElement>('template-char-stats')
  const clone = document.importNode(template.content, true)
  container.appendChild(clone)

  const tableStats = container.querySelector('table.table-stats')!
  const tableBonuses = container.querySelector('table.table-bonuses')!

  Object.entries(stats).forEach(([statName, stat]) => {
    const { Score, ...bonuses } = stat

    // Attribute scores
    const statCell = tableStats.querySelector(`.col-stat-${statName} td:nth-child(2)`)
    if (statCell) {
      statCell.textContent = Score.toString()
    }

    // Attribute bonuses
    Object.entries(bonuses).forEach(([bonusName, bonus]) => {
      const bonusCell = tableBonuses.querySelector(`.col-bonus-${bonusName} td:nth-child(2)`)

      if (bonusCell) {
        bonusCell.textContent = bonus.toString()
      }
    })
  })

  assert(classDef, `Unknown character class: ${characterClass}`)

  if (classDef.$isCaster) {
    const casterDetailsContainer = container.querySelector<HTMLElement>('.char-stats--caster-details')!
    renderCasterDetails(casterDetailsContainer, classDef, inventory)
  }

  renderArmorDetails(container.querySelector<HTMLElement>('.char-stats--armor')!, classDef)
  renderAlignmentDetails(container.querySelector<HTMLElement>('.char-stats--alignment')!, classDef)
  renderRacesDetails(container.querySelector<HTMLElement>('.char-stats--races')!, classDef)
  renderArmorClassDetails(container.querySelector('.char-ac')!, stats, inventory.items)
  renderSavingThrowDetails(container.querySelector('.char-saving-throw')!, classDef)

  // Other details
  container.querySelector('.char-gold')!.textContent = gold.toString()
  container.querySelector('.char-hp')!.textContent = hitPoints.toString()
  container.querySelector('.char-hd')!.textContent = classDef.HitDice.toString()
  container.querySelector('.char-class')!.textContent = classDef.name
  container.querySelector('.char-exp-bonus')!.textContent = getExperienceBonus(classDef, stats).toString()
  container.querySelector('.char-to-hit--melee')!.textContent = getToHitMelee(classDef, stats).toString()
  container.querySelector('.char-to-hit--missiles')!.textContent = getToHitMissiles(classDef, stats).toString()

  if (inventory.isCompact) {
    getCompactModeAffectedElements(inventoryId).forEach((elem) => elem.classList.add('hidden'))
  }
}

/**
 * @notice No direct calls
 */
export const handleRemoveCharacter = async (inventoryId: string): Promise<void> => {
  const state = getState()
  const inventory = state.getInventory(inventoryId)

  const isConfirmed = await showModal({
    message: `The inventory will remain available.`,
    title: `Remove character ${inventory.name}?`,
    type: 'confirm',
  })

  if (isConfirmed) {
    state.removeCharacter(inventoryId)

    dispatchEvent('RenderInventories')
    dispatchEvent('SelectInventory', { inventoryId: inventory.id })
    dispatchEvent('RenderNewCharacterControlsSection', { inventoryId: inventory.id })
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
    console.info('No matching classes. Choosing random', (err as Error).message)
    classDef = getRandomClass()
  }

  const char: Character = getNewCharacter(classDef, stats)
  state.setCharacter(inventoryId, char)

  dispatchEvent('RenderCharacterSection', { inventoryId })
}

/**
 * Run once
 */
export const initCharacterSectionUi = (): void => {
  void 0
}
