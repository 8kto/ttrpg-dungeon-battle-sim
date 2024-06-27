import { getState } from './State'
import { dispatchEvent, getIdFromName } from './utils'

/**
 * @param {string} htmlString Should enclose the layout with one element (div, span etc.)
 * @returns {ChildNode}
 */
export const createElementFromHtml = (htmlString) => {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()

  return div.firstChild
}

/**
 * @param {string} id
 * @returns {string}
 */
const getInventoryTable = (id) => {
  return `<table id="${id}-table-container" class="min-w-full bg-white shadow-md rounded my-4">
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

/**
 * @param {string} categoryName
 * @returns {string}
 */
export const getEquipTableSection = (categoryName) => `
        <section id="${getIdFromName(categoryName)}-section" class="mb-8">
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

/**
 * @param {string} id
 * @returns {string}
 */
const getInventoryControlsTopSection = (id) => {
  return `<section id="${id}-inventory-controls-top-section" class="inventory-controls-top-section mt-4 text-gen-800 text-sm flex gap-x-1">
            <button id="${id}-add-new-random-char" class="text-xs border rounded bg-white text-black-400 hover:text-white rounded-l hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 flex items-center">
              <span class="block px-2 py-1">♻ Generate random character</span>
            </button>
            <button
              id="${id}-save-char"
              class="text-xs border rounded bg-white text-alt hover:text-white rounded-l hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 flex items-center hidden"
            >
              <span class="block px-2 py-1">Save</span>
            </button>
          </section>`
}

/**
 * @param {string} id
 * @returns {string}
 */
const getInventoryControlsBottomSection = (id) => {
  return `<section class="mt-4 text-gen-800 text-sm">
            <div class="mb-4">
              <p>Total Weight: <span id="${id}-total-weight" class="font-semibold">0</span> pounds</p>
              <p>Total Cost: <span id="${id}-total-cost" class="font-semibold">0</span> gold pieces</p>
              <p>Base movement rate: <span id="${id}-base-movement-rate" class="font-semibold">0</span></p>
              <p>
                <span class="">Speed</span>, feet per turn: <span id="${id}-speed-feet-per-turn" class="text-gen-800">...</span>
              </p>
            </div>
            <div class="flex justify-end">
              <button id="${id}-rename-inventory" class="text-xs bg-gen-100 text-gen-400 hover:text-white rounded-l hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Rename inventory" aria-label="Rename inventory" class="block px-2 py-1">Rename</span>
              </button>
              <button id="${id}-reset-inventory" class="text-xs bg-gen-100 text-gen-400 hover:text-white hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Reset inventory items" aria-label="Reset inventory items" class="block px-2 py-1">Reset</span>
              </button>
              <button id="${id}-remove-inventory" class="text-xs bg-gen-100 text-gen-400 hover:text-white rounded-r hover:bg-gen-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-0">
                <span role="img" title="Remove inventory" aria-label="Remove inventory" class="block px-3 py-1.5">❌</span>
              </button>
            </div>
          </section>`
}

/**
 * @param {string} id
 */
export const bindInventoryControls = (id) => {
  document.getElementById(`${id}-header`).addEventListener('click', () => {
    dispatchEvent('SelectInventory', { id })
  })

  document.getElementById(`${id}-remove-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(id)

    if (confirm(`Remove inventory for ${inventory.name}?`)) {
      state.removeInventory(id)

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

  document.getElementById(`${id}-reset-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(id)

    if (confirm(`Reset inventory items for ${inventory.name}?`)) {
      state.resetInventoryItems(id)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { id })
    }
  })

  document.getElementById(`${id}-rename-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(id)
    const name = prompt(`Enter new name`, inventory.name)

    if (name) {
      inventory.name = name
      state.setInventory(id, inventory)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { id })
    }
  })

  document.getElementById(`${id}-add-new-random-char`).addEventListener('click', () => {
    dispatchEvent('RenderNewRandomCharacter')
    document.getElementById(`${id}-save-char`).classList.remove('hidden')
    dispatchEvent('SelectInventory', { id })
  })

  document.getElementById(`${id}-save-char`).addEventListener('click', (event) => {
    dispatchEvent('SerializeState')
    event.target.closest('.inventory-controls-top-section').classList.add('hidden')
    dispatchEvent('SelectInventory', { id })
  })
}

/**
 * @param {string} id
 * @param {string} name
 */
export const renderInitialInventory = (id, name) => {
  const inventoryTableContainer = document.getElementById('inventories-container')

  inventoryTableContainer.appendChild(
    createElementFromHtml(`
        <section id="${id}-container" class="inventory-container px-4 py-2 border shadow-lg">
          <h3
            id="${id}-header"
            class="inventory-header text-lg text-alt mb-4 hover:text-red-700 hover:cursor-pointer"
            title="Click to select"
          >${name ?? id}</h3>
          ${getInventoryControlsTopSection(id)}
          <div class="char-stats my-2"></div>
          ${getInventoryTable(id)}
          ${getInventoryControlsBottomSection(id)}
        </section>
    `),
  )

  bindInventoryControls(id)
}

/**
 * Marks the selected inventory by updating the inventory headers.
 * @param {string} inventoryId - The ID of the inventory to mark as selected.
 */
export const markSelectedInventory = (inventoryId) => {
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

/**
 * Scrolls the window to the passed HTML element.
 * @param {HTMLElement} element - The element to scroll to.
 */
export const scrollToElement = (element) => {
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

/**
 * @param {HTMLElement} container
 * @param {CharacterClassDef} classDef
 * @param {CharacterStats} stats
 */
export const renderCasterDetails = (container, classDef, stats) => {
  const intelligenceAttr = stats.Intelligence
  const magicUserProps = ['NewSpellUnderstandingChance', 'SpellsPerLevel']
  const ignoredProps = ['MaxAdditionalLanguages', 'Score']

  const getDetailsItem = (key, value) => {
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

/**
 * @param {HTMLElement} container
 * @param {CharacterStats} stats
 * @param {CharacterClassDef} charClass
 */
export const renderStatsContainer = (container, stats, charClass) => {
  const template = document.getElementById('template-stats')
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

  if (charClass.$isCaster) {
    const casterDetailsContainer = clone.querySelector('.char-stats--caster-details')
    renderCasterDetails(casterDetailsContainer, charClass, stats)
  }

  // Other details
  clone.querySelector('.char-gold').textContent = stats.Gold.toString()
  clone.querySelector('.char-hp').textContent = stats.HitPoints.toString()
  clone.querySelector('.char-hd').textContent = charClass.HitDice
  clone.querySelector('.char-class').textContent = charClass.name

  container.appendChild(clone)
}
