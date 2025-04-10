import { CharacterClasses } from '../config/snw/CharacterClasses'
import type { CharacterClassDef } from '../domain/snw/CharacterClass'
import type { BaseMovementRate } from '../domain/snw/Movement'
import { DEFAULT_INVENTORY_ID, getState, State } from '../state/State'
import { getEquipNameSuffix } from '../utils/equipment'
import { dispatchEvent } from '../utils/event'
import { getInventoryIdFromName } from '../utils/inventory'
import { createElementFromHtml, getElementById, scrollToElement } from '../utils/layout'
import { getRandomClass } from '../utils/snw/character'
import { getDamageModifier } from '../utils/snw/combat'
import { getBaseMovementRate, getUndergroundSpeed } from '../utils/snw/movement'
import { getCompactModeAffectedElements, getInventoryContainer, getInventoryTablesContainer } from './domSelectors'
import { showModal } from './modal'

const getInventoryTable = (inventoryId: string): string => {
  return `<table data-compact-hidden id="${inventoryId}-table-container" class="table table-zebra table-snw-gen border-neutral-content min-w-full bg-white rounded my-4 mb-6">
            <thead class="bg-neutral-content text-left">
              <tr class="text-xs uppercase">
                <th class="font-normal pl-4 pr-1 py-3 min-w-[150px]">Name</th>
                <th class="font-normal px-2 py-3 w-1/12">QTY</th>
                <th class="font-normal px-2 py-3 w-2/12">Weight</th>
                <th class="font-normal px-2 py-3 w-2/12">Cost</th>
                <th class="font-normal px-2 py-3 w-1/12"></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>`
}

const getInventoryTableControls = (inventoryId: string): string => {
  return `
    <div data-compact-hidden class="flex justify-end join relative items-stretch">
      <button id="${inventoryId}-add-custom-item" class="btn btn-primary btn-xs">Add custom item</button>
    </div>
  `
}

const getInventoryDropdownMenuSection = (inventoryId: string): string => {
  return `<section class="inventory-controls">
            <div class="flex justify-end join relative items-stretch">
              <!-- Hamburger Button with Dropdown -->
              <div class="dropdown dropdown-end flex">
                <label tabindex="0" class="join-item inventory-controls-btn flex items-center cursor-pointer first">
                  <span role="img" aria-label="Menu" title="Menu">☰</span>
                </label>
                <ul role="menu" tabindex="0" class="dropdown-content menu p-2 bg-neutral-content rounded-box w-52 mt-6 z-50">
                  <li><a id="${inventoryId}-rename-inventory" class="inventory-controls-btn">Rename</a></li>
                  <li><a id="${inventoryId}-set-gold" class="inventory-controls-btn">Set gold</a></li>
                  <li><a id="${inventoryId}-set-hp" class="inventory-controls-btn">Set Hit Points</a></li>
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
  getElementById(`${inventoryId}-header`).addEventListener('click', () => {
    dispatchEvent('SelectInventory', { inventoryId })
  })

  getElementById(`${inventoryId}-remove-inventory`).addEventListener('click', async () => {
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

  getElementById(`${inventoryId}-reset-inventory`).addEventListener('click', async () => {
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

  getElementById(`${inventoryId}-rename-inventory`).addEventListener('click', async () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    const res = await showModal<Record<string, string>>({
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

    if (!res) {
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

  getElementById(`${inventoryId}-remove-char`).addEventListener('click', () => {
    dispatchEvent('RemoveCharacter', { inventoryId })
  })

  getElementById(`${inventoryId}-minimise-inventory`).addEventListener('click', () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)
    const compactMode = !inventory.isCompact

    dispatchEvent('SetCompactMode', { compactMode, inventoryId })
  })

  getElementById(`${inventoryId}-set-gold`).addEventListener('click', async () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    const res = await showModal<Record<string, string>>({
      fields: [
        {
          defaultValue: inventory.character?.gold || 0,
          float: true,
          name: 'gold',
          title: 'Gold, GP',
          valueType: 'number',
        },
      ],
      title: `Set gold for ${inventory.name}`,
      type: 'prompt',
    })

    if (!res) {
      return
    }

    const { gold } = res
    if (typeof gold === 'undefined') {
      console.error('No valid value provided for Gold')

      return
    }

    state.setGold(inventoryId, Number.parseInt(gold, 10))
    dispatchEvent('RenderInventories')
    dispatchEvent('SelectInventory', { inventoryId })
  })

  getElementById(`${inventoryId}-set-hp`).addEventListener('click', async () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    const res = await showModal<Record<string, string>>({
      fields: [
        {
          defaultValue: inventory.character?.hitPoints || 0,
          name: 'hp',
          title: 'Hit Points',
          valueType: 'number',
        },
      ],
      title: `Set Hit Points to ${inventory.name}`,
      type: 'prompt',
    })

    if (!res) {
      return
    }

    const { hp } = res
    if (typeof hp === 'undefined') {
      console.error('No valid value provided for Hit Points')

      return
    }

    state.setHitPoints(inventoryId, Number.parseInt(hp, 10))
    dispatchEvent('RenderInventories')
    dispatchEvent('SelectInventory', { inventoryId })
  })
}

export const bindInventoryTableControls = (inventoryId: string): void => {
  getElementById(`${inventoryId}-add-custom-item`).addEventListener('click', async () => {
    const state = getState()
    const inventory = state.getInventory(inventoryId)

    const res = await showModal<Record<string, string>>({
      fields: [
        { name: 'itemName', title: 'Item name' },
        { defaultValue: 0, name: 'itemWeight', title: 'Weight, lbs.', valueType: 'number' },
      ],
      title: `Add custom item to inventory: ${inventory.name}?`,
      type: 'prompt',
    })

    if (!res) {
      return
    }

    const { itemName, itemWeight } = res
    if (!itemName) {
      console.error('No item name provided')

      return
    }

    if (!inventory.items[itemName]) {
      inventory.items[itemName] = {
        cost: 0,
        name: itemName,
        quantity: 1,
        weight: Number(itemWeight),
      }
    } else {
      inventory.items[itemName].quantity++
      inventory.items[itemName].weight = Number(itemWeight)
    }

    state.serialize()
    dispatchEvent('RenderInventories')
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
            ${getInventoryDropdownMenuSection(inventoryId)}
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
          <div class="overflow-auto px-4">
            <h3 data-compact-hidden class="mt-4 mb-2 text-alt text-xl">Inventory</h3>
            ${getInventoryTableControls(inventoryId)}
            ${getInventoryTable(inventoryId)}
          </div>
          ${getInventoryDetails(inventoryId)}
        </section>
    `),
  )

  bindInventoryControls(inventoryId)
  bindInventoryTableControls(inventoryId)
}

export const markSelectedInventory = (inventoryId: string): void => {
  const state = getState()
  const inventory = state.getInventory(inventoryId)

  // Handle the corrupted UI state
  if (!inventory) {
    console.info('Inventory is not found', inventoryId)
    const firstInventory = state.getInventories()[0]

    state.setCurrentInventoryId(firstInventory.id)
    markSelectedInventory(firstInventory.id)

    return
  }

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
    console.error('Inventory is not valid or not found:', inventoryId)

    return
  }

  const cellClassnames = 'table-snw-gen-cell--inventory'
  let inventoryTableContainer = document.querySelector(`#${inventoryId}-table-container`)
  if (!inventoryTableContainer) {
    renderInitialInventory(inventoryId, inventoryName)
    inventoryTableContainer = getElementById(`${inventoryId}-table-container`)!
  }

  const inventoryTableBody = inventoryTableContainer.querySelector<HTMLTableSectionElement>('table tbody')!
  inventoryTableBody.innerHTML = ''

  const classDef = inventory.character?.classDef.name
    ? (CharacterClasses[inventory.character.classDef.name] as CharacterClassDef)
    : getRandomClass()
  const charStats = inventory.character?.stats
  const damageMod = charStats ? getDamageModifier(classDef, charStats) : '0'
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

    const removeButton = document.createElement('button')
    removeButton.textContent = '-'
    removeButton.className = 'btn-action-square'
    removeButton.onclick = (): void => {
      getState().removeFromInventory(inventoryId, item.name)
      dispatchEvent('RenderInventory', { inventoryId, inventoryName })
      dispatchEvent('RenderCharacterSection', { inventoryId })
    }

    const addButton = document.createElement('button')
    addButton.textContent = '+'
    addButton.className = 'btn-action-square'
    addButton.onclick = (): void => {
      getState().addToInventory(inventoryId, item)
      dispatchEvent('RenderInventory', { inventoryId, inventoryName })
      dispatchEvent('RenderCharacterSection', { inventoryId })
    }

    const actionsCell = row.insertCell(4)
    const btnContainer = document.createElement('div')
    btnContainer.className = 'flex'
    btnContainer.appendChild(removeButton)
    btnContainer.appendChild(addButton)
    actionsCell.appendChild(btnContainer)
    actionsCell.className = `${cellClassnames} text-center w-16`

    totalWeight += item.weight * item.quantity
    totalCost += item.cost * item.quantity
  })

  const carryModifier = charStats?.Strength.Carry || 0
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier)

  if (!charStats) {
    dispatchEvent('RenderNewCharacterControlsSection', { inventoryId })
  }

  getElementById(`${inventoryId}-total-weight`).textContent = totalWeight.toFixed(1)
  getElementById(`${inventoryId}-total-cost`).textContent = totalCost.toFixed(2)
  getElementById(`${inventoryId}-base-movement-rate`).textContent = baseMovementRate.toString()

  // FIXME to char stats section
  updateSpeedDisplay(inventoryId, baseMovementRate)

  if (inventory.isCompact) {
    getCompactModeAffectedElements(inventoryId).forEach((elem) => elem.classList.add('hidden'))
  }
}

export const updateSpeedDisplay = (inventoryId: string, baseMovementRate: BaseMovementRate): void => {
  const speeds = getUndergroundSpeed(baseMovementRate)
  getElementById(`${inventoryId}-speed-feet-per-turn`).innerHTML = [
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
  getElementById('add-inventory-button').addEventListener('click', () => {
    const newNameInputElement = getElementById('new-inventory-name') as HTMLInputElement
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
