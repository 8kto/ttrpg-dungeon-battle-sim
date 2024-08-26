import { Armor, Equip, Weapons } from '../config/snw/Equip'
import { EquipItem } from '../domain/Equipment'
import { getState } from '../state/State'
import { getEquipNameSuffix } from '../utils/equipment'
import { dispatchEvent } from '../utils/event'
import { getInventoryIdFromName } from '../utils/inventory'
import { createElementFromHtml } from '../utils/layout'

export const getEquipTableSection = (categoryName: string): string => `
        <section id="${getInventoryIdFromName(categoryName)}-section" class="mb-8">
            <h2 class="text-2xl text-alt font-bold mb-4">${categoryName}</h2>
            <div class="overflow-auto">
              <table class="table table-zebra min-w-full bg-white table-snw-gen">
                  <thead class="bg-neutral-content text-left">
                      <tr>
                          <th class="uppercase w-1/2">Name</th>
                          <th class="uppercase w-1/6">Weight</th>
                          <th class="uppercase w-1/6">Cost, gp</th>
                          <th class="text-center uppercase w-1/6">Actions</th>
                      </tr>
                  </thead>
                  <tbody></tbody>
              </table>
            </div>
        </section>`

const addEquipRow = (tableBody: HTMLTableSectionElement, item: EquipItem): void => {
  const row = tableBody.insertRow()

  const cellClassnames = 'table-snw-gen-cell'

  // Create and set properties for the name cell
  const nameCell = row.insertCell(0)

  nameCell.innerHTML = item.name + getEquipNameSuffix(item)
  nameCell.className = cellClassnames

  // Create and set properties for the weight cell
  const weightCell = row.insertCell(1)
  weightCell.textContent = item.weight.toString()
  weightCell.className = cellClassnames

  // Create and set properties for the cost cell
  const costCell = row.insertCell(2)
  costCell.textContent = item.cost.toString()
  costCell.className = cellClassnames

  // Create and set properties for the button cell
  const addButton = document.createElement('button')
  addButton.textContent = 'Add'
  addButton.className = 'text-sm font-medium text-sub hover:text-alt uppercase'
  addButton.onclick = (): void => {
    const state = getState()
    const inventoryId = state.getCurrentInventoryId()
    state.addToInventory(inventoryId, item)
    dispatchEvent('RenderInventory', { inventoryId })
    dispatchEvent('RenderCharacterSection', { inventoryId })
  }

  const actionsCell = row.insertCell(3)
  actionsCell.appendChild(addButton)
  actionsCell.className = `${cellClassnames} text-center w-16`
}

export const renderEquipCategorySection = (container: HTMLElement, categoryName: string, items: EquipItem[]): void => {
  const sectionHtml = getEquipTableSection(categoryName)
  const section = createElementFromHtml(sectionHtml)
  container.appendChild(section)

  const tableBody = section.querySelector('tbody')
  items.forEach((item) => addEquipRow(tableBody, item))
}

/**
 * Run once
 */
export const initEquipUi = (): void => {
  const equipmentContainer = document.getElementById('equipment-container')

  renderEquipCategorySection(equipmentContainer, 'Armor', Armor)
  renderEquipCategorySection(equipmentContainer, 'Weapons', Weapons)
  renderEquipCategorySection(equipmentContainer, 'Equipment', Equip)
}

// FIXME inventory table
// TODO weapons help block
// TODO add item to menu
