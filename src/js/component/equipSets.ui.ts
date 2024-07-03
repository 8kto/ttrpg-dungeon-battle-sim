import { EquipSets } from '../config/snw/EquipSets'
import { getState } from '../state/State'
import { importEquipSet } from '../utils/equipment'
import { dispatchEvent } from '../utils/event'

export const renderEquipSets = (): void => {
  const dropdown = document.getElementById('equip-set-dropdown') as HTMLSelectElement

  for (const key in EquipSets) {
    const option = document.createElement('option')
    option.value = key
    option.textContent = EquipSets[key].name
    option.classList.add('text-base')
    dropdown.appendChild(option)
  }

  bindEquipSetImportControls()
}

const renderEquipSetTable = (container: HTMLElement, selectedKey: string): void => {
  const selectedSet = EquipSets[selectedKey]
  const itemList = document.createElement('ul')
  itemList.className = 'list-disc list-inside two-columns'

  selectedSet.items.forEach((item) => {
    const listItem = document.createElement('li')
    listItem.textContent = item.quantity > 1 ? `${item.name} (${item.quantity})` : item.name
    itemList.appendChild(listItem)
  })

  container.appendChild(itemList)
}

const bindEquipSetImportControls = (): void => {
  const dropdown = document.getElementById('equip-set-dropdown') as HTMLSelectElement
  const state = getState()

  document.getElementById('import-equip-set-button').addEventListener('click', () => {
    const equipSet = dropdown.value
    if (equipSet in EquipSets) {
      importEquipSet(state.getInventory(state.getCurrentInventoryId()), EquipSets[equipSet])
      state.serialize()
      dispatchEvent('RenderInventories')
    }

    dropdown.value = ''
    dropdown.dispatchEvent(new Event('change'))
  })

  dropdown.addEventListener('change', function () {
    const equipSetsContainer = document.getElementById('equip-sets-container')
    const selectedSetKey = this.value
    equipSetsContainer.innerHTML = ''

    if (selectedSetKey) {
      renderEquipSetTable(equipSetsContainer, selectedSetKey)
    }
  })
}

/**
 * Run once
 */
export const initEquipSetsUi = (): void => {
  renderEquipSets()
}
