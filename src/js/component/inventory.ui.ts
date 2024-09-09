import { CharacterClasses } from '../config/snw/CharacterClasses'
import { CharacterClassDef } from '../domain/snw/CharacterClass'
import { BaseMovementRate } from '../domain/snw/Movement'
import { DEFAULT_INVENTORY_ID, getState, State } from '../state/State'
import { getEquipNameSuffix } from '../utils/equipment'
import { dispatchEvent } from '../utils/event'
import { getInventoryIdFromName } from '../utils/inventory'
import { createElementFromHtml, scrollToElement } from '../utils/layout'
import { getDamageModifier } from '../utils/snw/combat'
import { getBaseMovementRate, getUndergroundSpeed } from '../utils/snw/movement'
import { getCompactModeAffectedElements, getInventoryContainer, getInventoryTablesContainer } from './domSelectors'
import { showModal } from './modal'

const getInventoryTable = (inventoryId: string): string => {
  return `<table data-compact-hidden id="${inventoryId}-table-container" class="table table-zebra table-snw-gen border-neutral-content min-w-full bg-white rounded my-4 mb-6 mx-4">
            <thead class="bg-neutral-content text-left">
              <tr class="text-xs uppercase">
                <th class="font-normal pl-4 pr-1 py-3 min-w-[150px] w-6/12">Name</th>
                <th class="font-normal px-2 py-3 w-1/12">QTY</th>
                <th class="font-normal px-2 py-3 w-2/12">Total Weight</th>
                <th class="font-normal px-2 py-3 w-2/12">Total Cost</th>
                <th class="font-normal px-2 py-3 w-1/12">Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>`
}

const getInventoryControlsSection = (inventoryId: string): string => {
  return `<section class="inventory-controls">
            <div class="flex justify-end join relative items-stretch">
              <!-- Hamburger Button with Dropdown -->
              <div class="dropdown dropdown-end flex">
                <label tabindex="0" class="join-item inventory-controls-btn flex items-center cursor-pointer first">
                  <span role="img" aria-label="Menu" title="Menu">☰</span>
                </label>
                <ul role="menu" tabindex="0" class="dropdown-content menu p-2 bg-neutral-content rounded-box w-52 mt-6">
                  <li><a id="${inventoryId}-rename-inventory" class="inventory-controls-btn">Rename</a></li>
                  <li><a id="${inventoryId}-remove-char" class="inventory-controls-btn" title="Reset character, keep inventory">Remove character</a></li>
                  <li><a id="${inventoryId}-reset-inventory" class="inventory-controls-btn" title="Reset inventory items">Reset inventory</a></li>
                </ul>
              </div>

              <button id="${inventoryId}-minimise-inventory" class="join-item inventory-controls-btn">
                <span role="img" title="Minimise inventory" aria-label="Minimise inventory">➖</span>
              </button>
              <button id="${inventoryId}-remove-inventory" class="join-item inventory-controls-btn last">
                <span role="img" title="Remove inventory" aria-label="Remove inventory">❌</span>
              </button>
            </div>
          </section>`
}

const addInventory = (inventoryName: string): string => {
  const inventoryId = getInventoryIdFromName(inventoryName)
  const state = getState()

  if (!state.getInventory(inventoryId)) {
    state.setInventory(inventoryId, State.getNewInventory(inventoryId, inventoryName))
    dispatchEvent('RenderInventory', { inventoryId, inventoryName })

    scrollToElement(getInventoryContainer(inventoryId))
  }

  return inventoryId
}

/**
 * Run once per inventory
 */
export const bindInventoryControls = (inventoryId: string): void => {
  document.getElementById(`${inventoryId}-header`).addEventListener('click', () => {
    dispatchEvent('SelectInventory', { inventoryId })
  })

  document.getElementById(`${inventoryId}-remove-inventory`).addEventListener('click', async () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    const isConfirmed = await showModal({
      message: 'Both inventory and character will be removed',
      title: `Remove ${inventory.name}?`,
      type: 'confirm',
    })

    if (isConfirmed) {
      state.removeInventory(inventoryId)

      const selected = state.getInventories()[0]
      if (selected) {
        state.setCurrentInventoryId(selected.id)

        dispatchEvent('RenderInventories')
        dispatchEvent('SelectInventory', { inventoryId: selected.id })
      } else {
        dispatchEvent('RenderInventories')
      }
    }
  })

  document.getElementById(`${inventoryId}-reset-inventory`).addEventListener('click', async () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    const isConfirmed = await showModal({
      message: `Reset inventory items for ${inventory.name}?`,
      title: 'Reset',
      type: 'confirm',
    })

    if (isConfirmed) {
      state.resetInventoryItems(inventoryId)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { inventoryId })
    }
  })

  document.getElementById(`${inventoryId}-rename-inventory`).addEventListener('click', async () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    const res = await showModal({
      fields: [
        {
          defaultValue: inventory.name,
          name: 'name',
          title: 'New name',
        },
      ],
      title: `Enter new name for ${inventory.name}`,
      type: 'prompt',
    })

    if (res === false) {
      return
    }

    const { name } = res
    if (name && typeof name === 'string') {
      inventory.name = name
      state.setInventory(inventoryId, inventory)
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { inventoryId })
    }
  })

  document.getElementById(`${inventoryId}-remove-char`).addEventListener('click', () => {
    dispatchEvent('RemoveCharacter', { inventoryId })
  })

  document.getElementById(`${inventoryId}-minimise-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)
    const compactMode = !inventory.isCompact

    dispatchEvent('SetCompactMode', { compactMode, inventoryId })
  })
}

export const handleSetInventoryCompactMode = (inventoryId: string, isCompact: boolean): void => {
  getCompactModeAffectedElements(inventoryId).forEach((elem) => {
    if (isCompact) {
      elem.classList.add('hidden')
    } else {
      elem.classList.remove('hidden')
    }
  })

  getState().setInventoryCompactMode(inventoryId, isCompact)
}

export const toggleGlobalCompactMode = (): void => {
  const state = getState()
  const isCompactMode = state.isCompactMode()
  state.setCompactMode(!isCompactMode)

  state.getInventories().forEach(({ id }) => {
    handleSetInventoryCompactMode(id, !isCompactMode)
    state.setInventoryCompactMode(id, !isCompactMode)
  })
}

const getInventoryDetails = (inventoryId: string): string => {
  const inventory = getState().getInventory(inventoryId)
  const carryModifier = inventory.character?.stats?.Strength?.Carry || 0
  const carryFragment = !carryModifier
    ? ''
    : `&nbsp;<span>(Carry modifier: <span class="text-details">${carryModifier < 0 ? carryModifier : `+${carryModifier}`}</span> pounds)</span>`

  return `<div class="char-stats-row movement-details">
            <p data-compact-hidden>Total Weight: <span id="${inventoryId}-total-weight" class="text-details">0</span> pounds${carryFragment}</p>
            <p data-compact-hidden  class="mb-4">Total Cost: <span id="${inventoryId}-total-cost" class="text-details">0</span> gold pieces</p>
            <p class="base-movement-rate-container">Base movement rate: <span id="${inventoryId}-base-movement-rate" class="text-details">0</span></p>
            <p>
              <span class="">Underground speed</span>, feet/turn: <span id="${inventoryId}-speed-feet-per-turn" class="movement-details-wrapper">...</span>
            </p>
          </div>`
}

export const renderInitialInventory = (inventoryId: string, name?: string): void => {
  getInventoryTablesContainer().appendChild(
    createElementFromHtml(`
        <section id="${inventoryId}-container" class="inventory-container">
          <header>
            ${getInventoryControlsSection(inventoryId)}
            <h2
              id="${inventoryId}-header"
              class="inventory-header"
              title="Click to select"
            >${name ?? inventoryId}</h2>
            <div class="char-stats my-2">
              <div class="char-stats--controls mb-2"></div>
              <div class="char-stats--container mb-2"></div>
            </div>
          </header>
          <div class="overflow-auto">
            <h3 data-compact-hidden class="mt-4 mb-2 mx-4 text-alt text-xl">Inventory</h3>
            ${getInventoryTable(inventoryId)}
          </div>
          ${getInventoryDetails(inventoryId)}
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
        `<span class="text-alt selected text-sm ml-2 emoji-icon emoji-icon--header" title="Selected character">🛡️</span>`,
      ),
    )
  }

  const inventoryContainer = getInventoryContainer(inventoryId)
  if (inventoryContainer) {
    inventoryContainer.classList.add('selected')
  }
}

/**
 * @notice No direct calls
 */
export const handleRenderInventory = (inventoryId: string, inventoryName?: string): void => {
  const inventory = getState().getInventory(inventoryId)
  if (!inventory) {
    console.error('Inventory not found:', inventoryId)

    return
  }

  const cellClassnames = 'table-snw-gen-cell--inventory'
  let inventoryTableContainer = document.querySelector(`#${inventoryId}-table-container`)
  if (!inventoryTableContainer) {
    renderInitialInventory(inventoryId, inventoryName)
    inventoryTableContainer = document.querySelector(`#${inventoryId}-table-container`)
  }

  const inventoryTableBody = inventoryTableContainer.querySelector<HTMLTableSectionElement>('table tbody')
  inventoryTableBody.innerHTML = ''

  const classDef = CharacterClasses[inventory.character?.characterClass] as CharacterClassDef
  const charStats = inventory.character?.stats
  const damageMod = charStats ? getDamageModifier(classDef, charStats) : 0
  let totalWeight = 0
  let totalCost = 0

  Object.values(inventory.items).forEach((item) => {
    const row = inventoryTableBody.insertRow()

    const nameCell = row.insertCell(0)
    nameCell.innerHTML = item.name + getEquipNameSuffix(item, damageMod)
    nameCell.className = cellClassnames

    const qtyCell = row.insertCell(1)
    qtyCell.textContent = item.quantity.toString()
    qtyCell.className = cellClassnames

    const weightCell = row.insertCell(2)
    weightCell.textContent = (item.weight * item.quantity).toFixed(2).replace(/\.0+$/g, '')
    weightCell.className = cellClassnames

    const costCell = row.insertCell(3)
    costCell.textContent = (item.cost * item.quantity).toFixed(2).replace(/\.0+$/g, '')
    costCell.className = cellClassnames

    // Create and append the Remove button
    const removeButton = document.createElement('button')
    removeButton.textContent = 'DEL'
    removeButton.className = 'px-4 py-1 text-sm text-sub hover:text-alt'
    removeButton.onclick = (): void => {
      getState().removeFromInventory(inventoryId, item.name)
      dispatchEvent('RenderInventory', { inventoryId, inventoryName })
      dispatchEvent('RenderCharacterSection', { inventoryId })
    }

    const actionsCell = row.insertCell(4)
    actionsCell.appendChild(removeButton)
    actionsCell.className = `${cellClassnames} text-center w-16`

    totalWeight += item.weight * item.quantity
    totalCost += item.cost * item.quantity
  })

  const carryModifier = charStats?.Strength.Carry || 0
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier)

  if (!charStats) {
    dispatchEvent('RenderNewCharacterControlsSection', { inventoryId })
  }

  document.getElementById(`${inventoryId}-total-weight`).textContent = totalWeight.toFixed(1)
  document.getElementById(`${inventoryId}-total-cost`).textContent = totalCost.toFixed(2)
  document.getElementById(`${inventoryId}-base-movement-rate`).textContent = baseMovementRate.toString()

  // FIXME to char stats section
  updateSpeedDisplay(inventoryId, baseMovementRate)

  if (inventory.isCompact) {
    getCompactModeAffectedElements(inventoryId).forEach((elem) => elem.classList.add('hidden'))
  }
}

export const updateSpeedDisplay = (inventoryId: string, baseMovementRate: BaseMovementRate): void => {
  const speeds = getUndergroundSpeed(baseMovementRate)
  document.getElementById(`${inventoryId}-speed-feet-per-turn`).innerHTML = [
    `<span class="movement-details-item text-details--alt">Walking: <span class="movement-details-item__number">${speeds.walking}</span></span>`,
    `<span class="movement-details-item text-details--alt">Running: <span class="movement-details-item__number">${speeds.running}</span></span>`,
    `<span class="movement-details-item text-details--alt">Combat: <span class="movement-details-item__number">${speeds.combat}</span></span>`,
  ].join(' • ')
}

/**
 * @notice No direct calls
 */
export const handleRenderInventories = (): void => {
  const inventoryTableContainer = getInventoryTablesContainer()
  inventoryTableContainer.innerHTML = ''

  getState()
    .getInventories()
    .forEach((inventory) => {
      dispatchEvent('RenderInventory', { inventoryId: inventory.id, inventoryName: inventory.name })

      if (inventory.character?.stats) {
        dispatchEvent('RenderCharacterSection', { inventoryId: inventory.id })
      } else {
        dispatchEvent('RenderNewCharacterControlsSection', { inventoryId: inventory.id })
      }
    })
}

/**
 * Run once
 */
const bindInventoryCommonControls = (): void => {
  document.getElementById('add-new-item-button').addEventListener('click', () => {
    const inputNameElement = document.getElementById('new-item-name') as HTMLInputElement
    const inputWeightElement = document.getElementById('new-item-weight') as HTMLInputElement

    const itemName = inputNameElement.value.trim()
    const itemWeight = Math.max(parseInt(inputWeightElement.value) || 0, 0)

    if (!itemName) {
      console.error('No item name provided')

      return
    }

    const state = getState()
    const inventory = state.getInventory(state.getCurrentInventoryId())

    if (!inventory.items[itemName]) {
      inventory.items[itemName] = {
        cost: 0,
        name: itemName,
        quantity: 1,
        weight: itemWeight,
      }
    } else {
      inventory.items[itemName].quantity++
      inventory.items[itemName].weight = itemWeight
    }

    state.serialize()
    dispatchEvent('RenderInventories')
  })

  document.getElementById('add-inventory-button').addEventListener('click', () => {
    const newNameInputElement = document.getElementById('new-inventory-name') as HTMLInputElement
    const inventoryName = newNameInputElement?.value.trim() || DEFAULT_INVENTORY_ID
    const inventoryId = addInventory(inventoryName)

    getState().setCurrentInventoryId(inventoryId)
    dispatchEvent('RenderNewRandomCharacter', { inventoryId })
    markSelectedInventory(inventoryId)
  })

  document.querySelector('.minimise-inventories-btn')?.addEventListener('click', () => {
    toggleGlobalCompactMode()
  })
}

/**
 * @notice No direct calls
 */
export const handleSelectInventory = (inventoryId: string): void => {
  const state = getState()
  state.setCurrentInventoryId(inventoryId)
  markSelectedInventory(inventoryId)
  state.serialize()
}

/**
 * Run once
 */
export const initInventoryUi = (): void => {
  const currentInventoryId = getState().getCurrentInventoryId()

  dispatchEvent('RenderInventories')
  markSelectedInventory(currentInventoryId)

  bindInventoryCommonControls()
}

// TODO e2e with mobiles -- click on Inventory first
