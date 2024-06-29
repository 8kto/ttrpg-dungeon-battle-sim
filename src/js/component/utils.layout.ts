import { CharacterClassDef } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { BaseMovementRate } from '../domain/snw/Movement'
import { getState } from '../state/State'
import { dispatchEvent } from '../utils/event'
import { getInventoryIdFromName } from '../utils/inventory'
import { getUndergroundSpeed } from '../utils/movement'

/**
 * @param {string} htmlString Should enclose the layout with one element (div, span etc.)
 * @returns {ChildNode}
 */
export const createElementFromHtml = <T = HTMLElement>(htmlString: string): T => {
  const div = document.createElement('div') as T
  div.innerHTML = htmlString.trim()

  return div.firstChild
}

const getInventoryTable = (inventoryId: string): string => {
  return `<table id="${inventoryId}-table-container" class="min-w-full bg-white shadow-md rounded my-4">
              <thead class="bg-gen-100 text-left">
                  <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/2">Name</th>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Quantity</th>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Total Weight</th>
                      <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Total Cost</th>
                      <th class="px-2 py-3 text-center text-xs font-medium uppercase w-1/6">Actions</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>`
}

export const getEquipTableSection = (categoryName: string): string => `
        <section id="${getInventoryIdFromName(categoryName)}-section" class="mb-8">
            <h2 class="text-2xl text-gen-700 font-bold mb-4">${categoryName}</h2>
            <table class="min-w-full bg-white shadow-md rounded">
                <thead class="bg-gen-100 text-left">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/2">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Weight</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase w-1/6">Cost, gp</th>
                        <th class="px-2 py-3 text-center text-xs font-medium uppercase w-1/6">Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>`

const getInventoryControlsTopSection = (inventoryId: string): string => {
  return `<section id="${inventoryId}-inventory-controls-top-section" class="inventory-controls-top-section mt-4 text-gen-800 text-sm flex gap-x-1">
            <button id="${inventoryId}-add-new-random-char" class="text-xs border rounded bg-white text-black-400 hover:text-white rounded-l hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 flex items-center">
              <span class="block px-2 py-1">♻ Generate random character</span>
            </button>
            <button
              id="${inventoryId}-save-char"
              class="text-xs border rounded bg-white text-alt hover:text-white rounded-l hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 flex items-center hidden"
            >
              <span class="block px-2 py-1">Save</span>
            </button>
          </section>`
}

const getInventoryControlsBottomSection = (inventoryId: string): string => {
  return `<section class="mt-4 text-gen-800 text-sm">
            <div class="mb-4">
              <p>Total Weight: <span id="${inventoryId}-total-weight" class="font-semibold">0</span> pounds</p>
              <p>Total Cost: <span id="${inventoryId}-total-cost" class="font-semibold">0</span> gold pieces</p>
              <p>Base movement rate: <span id="${inventoryId}-base-movement-rate" class="font-semibold">0</span></p>
              <p>
                <span class="">Speed</span>, feet per turn: <span id="${inventoryId}-speed-feet-per-turn" class="text-gen-800">...</span>
              </p>
            </div>
            <div class="flex justify-end">
              <button id="${inventoryId}-rename-inventory" class="text-xs bg-gen-100 text-gen-400 hover:text-white rounded-l hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Rename inventory" aria-label="Rename inventory" class="block px-2 py-1">Rename</span>
              </button>
              <button id="${inventoryId}-reset-inventory" class="text-xs bg-gen-100 text-gen-400 hover:text-white hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Reset inventory items" aria-label="Reset inventory items" class="block px-2 py-1">Reset</span>
              </button>
              <button id="${inventoryId}-remove-inventory" class="text-xs bg-gen-100 text-gen-400 hover:text-white rounded-r hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Remove inventory" aria-label="Remove inventory" class="block px-3 py-1.5">❌</span>
              </button>
            </div>
          </section>`
}

export const bindInventoryControls = (inventoryId: string): void => {
  document.getElementById(`${inventoryId}-header`).addEventListener('click', () => {
    dispatchEvent('SelectInventory', { id: inventoryId })
  })

  document.getElementById(`${inventoryId}-remove-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    if (confirm(`Remove inventory for ${inventory.name}?`)) {
      state.removeInventory(inventoryId)

      const selected = state.getInventories()[0]
      if (selected) {
        state.setCurrentInventoryId(selected.id)

        dispatchEvent('RenderInventories')
        dispatchEvent('SelectInventory', { id: selected.id })
      } else {
        dispatchEvent('RenderInventories')
      }
    }
  })

  document.getElementById(`${inventoryId}-reset-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    if (confirm(`Reset inventory items for ${inventory.name}?`)) {
      state.resetInventoryItems(inventoryId)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { id: inventoryId })
    }
  })

  document.getElementById(`${inventoryId}-rename-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)
    const name = prompt(`Enter new name`, inventory.name)

    if (name) {
      inventory.name = name
      state.setInventory(inventoryId, inventory)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { id: inventoryId })
    }
  })

  document.getElementById(`${inventoryId}-add-new-random-char`).addEventListener('click', () => {
    dispatchEvent('RenderNewRandomCharacter')
    document.getElementById(`${inventoryId}-save-char`).classList.remove('hidden')
    dispatchEvent('SelectInventory', { id: inventoryId })
  })

  document.getElementById(`${inventoryId}-save-char`).addEventListener('click', (event) => {
    dispatchEvent('SerializeState')
    const target = event.target as HTMLElement
    target.closest('.inventory-controls-top-section').classList.add('hidden')
    dispatchEvent('SelectInventory', { id: inventoryId })
  })
}

export const renderInitialInventory = (inventoryId: string, name?: string): void => {
  const inventoryTableContainer = document.getElementById('inventories-container')

  inventoryTableContainer.appendChild(
    createElementFromHtml(`
        <section id="${inventoryId}-container" class="inventory-container px-4 py-2 border shadow-lg">
          <h3
            id="${inventoryId}-header"
            class="inventory-header text-lg text-alt mb-4 hover:text-red-700 hover:cursor-pointer"
            title="Click to select"
          >${name ?? inventoryId}</h3>
          ${getInventoryControlsTopSection(inventoryId)}
          <div class="char-stats my-2"></div>
          ${getInventoryTable(inventoryId)}
          ${getInventoryControlsBottomSection(inventoryId)}
        </section>
    `),
  )

  bindInventoryControls(inventoryId)
}

export const markSelectedInventory = (inventoryId: string): void => {
  document.querySelectorAll('.inventory-header .selected').forEach((element) => element.remove())
  document.querySelectorAll('.inventory-container.selected').forEach((element) => element.classList.remove('selected'))

  // Get the header element of the currently selected inventory
  const headerElement = document.getElementById(`${inventoryId}-header`)
  if (headerElement) {
    headerElement.appendChild(
      createElementFromHtml(
        `<span class="text-alt selected text-sm ml-2" title="Currently selected inventory">🎒</span>`,
      ),
    )
  }

  const sectionElement = document.getElementById(`${inventoryId}-container`)
  sectionElement.classList.add('selected')

  const containerTitle = document.getElementById('inventory-container-title')
  containerTitle.textContent = getState().getInventory(inventoryId).name
}

export const scrollToElement = (element: HTMLElement): void => {
  if (element instanceof HTMLElement) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  } else {
    console.error('Invalid element passed to scrollToElement function.')
  }
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

/** FIXME check stats/class order
 */
export const renderStatsContainer = (
  container: HTMLElement,
  classDef: CharacterClassDef,
  stats: CharacterStats,
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

export const renderErrorMessage = (errorMessage: string): void => {
  const pageContentElement = document.querySelector('.page-content')
  const errorMsgElement = document.createElement('div')

  errorMsgElement.className = 'border rounded px-4 py-2 border-red-400 bg-red-100 m-auto my-10'
  errorMsgElement.textContent = errorMessage
  pageContentElement.classList.add('text-center')
  pageContentElement.innerHTML = ''
  pageContentElement.appendChild(errorMsgElement)
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
