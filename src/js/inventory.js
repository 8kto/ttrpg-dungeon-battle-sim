import {Armor, Equipment} from './data/equipment.js';

/**
 * @typedef {Object} InventoryItem
 * @property {string} name - The name of the item.
 * @property {number} weightLbs - The weight of the item in pounds.
 * @property {number} cost - The cost of the item in gold pieces.
 * @property {number} quantity - The quantity of the item in the inventory.
 */

/**
 * @type {Object.<string, InventoryItem>}
 */
const inventory = {};

function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function createTableHTML(categoryName) {
  return `
        <section id="${categoryName.toLowerCase().replace(/\s/g, '-')}-section" class="mb-4">
            <h2 class="text-xl font-bold mb-2">${categoryName}</h2>
            <table class="min-w-full bg-white shadow-md rounded">
                <thead class="bg-gray-200 text-left">
                    <tr>
                        <th class="px-4 py-2">Name</th>
                        <th class="px-4 py-2">Weight Lbs</th>
                        <th class="px-4 py-2">Cost</th>
                        <th class="px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>`;
}

function addEquipmentToTable(tableBody, item) {
  const row = tableBody.insertRow();
  const cellClassnames = 'px-4 py-1'

  // Create and set properties for the name cell
  const nameCell = row.insertCell(0);
  nameCell.textContent = item.name;
  nameCell.className = cellClassnames

  // Create and set properties for the weight cell
  const weightCell = row.insertCell(1);
  weightCell.textContent = item.weightLbs;
  weightCell.className = cellClassnames

  // Create and set properties for the cost cell
  const costCell = row.insertCell(2);
  costCell.textContent = item.cost;
  costCell.className = cellClassnames

  // Create and set properties for the button cell
  const addButton = document.createElement('button');
  addButton.textContent = 'Add';
  addButton.className = 'px-4 text-sm text-left font-medium text-blue-900 hover:text-red-800';
  addButton.onclick = () => addToInventory(item);

  const addCell = row.insertCell(3);
  addCell.appendChild(addButton);
  addCell.className = cellClassnames
}

function createCategorySection(container, categoryName, items) {
  const sectionHTML = createTableHTML(categoryName);
  const section = createElementFromHTML(sectionHTML);
  container.appendChild(section);

  const tableBody = section.querySelector('tbody');
  items.forEach(item => addEquipmentToTable(tableBody, item));
}

function addToInventory(item) {
  if (!inventory[item.name]) {
    inventory[item.name] = {...item, quantity: 0};
  }
  inventory[item.name].quantity++;
  updateInventoryUI();
}

function updateInventoryUI() {
  const cellClassnames = 'px-4 py-1'
  const inventoryTableBody = document.querySelector('#inventory-table-container table tbody');
  inventoryTableBody.innerHTML = '';

  let totalWeight = 0, totalCost = 0;
  Object.values(inventory).forEach(item => {
    const row = inventoryTableBody.insertRow();
    const cell1 = row.insertCell(0);
    cell1.textContent = item.name;
    cell1.className = cellClassnames

    const cell2 = row.insertCell(1);
    cell2.textContent = item.quantity;
    cell2.className = cellClassnames

    const cell3 = row.insertCell(2);
    cell3.textContent = item.weightLbs * item.quantity;
    cell3.className = cellClassnames

    const cell4 = row.insertCell(3);
    cell4.textContent = item.cost * item.quantity;
    cell4.className = cellClassnames

    totalWeight += item.weightLbs * item.quantity;
    totalCost += item.cost * item.quantity;
  });

  document.getElementById('total-weight').textContent = totalWeight.toFixed(2);
  document.getElementById('total-cost').textContent = totalCost.toFixed(2);
}

function setupInventoryTable() {
  const inventoryTableContainer = document.getElementById('inventory-table-container');
  inventoryTableContainer.appendChild(createElementFromHTML(`
        <table class="min-w-full bg-white shadow-md rounded">
            <thead class="bg-gray-200 text-left">
                <tr>
                    <th class="px-4 py-2">Name</th>
                    <th class="px-4 py-2">Quantity</th>
                    <th class="px-4 py-2">Total Weight</th>
                    <th class="px-4 py-2">Total Cost</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `));
}

function main() {
  const equipmentContainer = document.getElementById('equipment-container');
  setupInventoryTable();

  createCategorySection(equipmentContainer, 'Armor', Armor);
  createCategorySection(equipmentContainer, 'Equipment', Equipment);
}

document.addEventListener('DOMContentLoaded', main);
