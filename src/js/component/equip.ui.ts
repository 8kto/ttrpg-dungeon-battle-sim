import { Armor, Equip, Weapons } from '../config/snw/Equip'
import { EquipItem } from '../domain/Equipment'
import { getState } from '../state/State'
import { getEquipNameSuffix } from '../utils/equipment'
import { getInventoryIdFromName } from '../utils/inventory'
import { createElementFromHtml } from '../utils/layout'
import { renderInventory } from './inventory.ui'

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

const addEquipRow = (tableBody: HTMLTableSectionElement, item: EquipItem): void => {
  const row = tableBody.insertRow()
  row.className = 'even:bg-gray-50 hover:bg-gen-50'

  const cellClassnames = 'px-4 py-1'

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
  addButton.className = 'px-4 text-sm text-left font-medium text-sub hover:text-red-800'
  addButton.onclick = (): void => {
    const state = getState()
    const inventoryId = state.getCurrentInventoryId()
    state.addToInventory(inventoryId, item)
    renderInventory(inventoryId, inventoryId)
  }

  const actionsCell = row.insertCell(3)
  actionsCell.appendChild(addButton)
  actionsCell.className = `${cellClassnames} text-center px-2 w-16`
}

export const renderEquipCategorySection = (container: HTMLElement, categoryName: string, items: EquipItem[]): void => {
  const sectionHtml = getEquipTableSection(categoryName)
  const section = createElementFromHtml(sectionHtml)
  container.appendChild(section)

  const tableBody = section.querySelector('tbody')
  items.forEach((item) => addEquipRow(tableBody, item))
}

export const initEquipUi = (): void => {
  const equipmentContainer = document.getElementById('equipment-container')

  renderEquipCategorySection(equipmentContainer, 'Armor', Armor)
  renderEquipCategorySection(equipmentContainer, 'Weapons', Weapons)
  renderEquipCategorySection(equipmentContainer, 'Equipment', Equip)
}
