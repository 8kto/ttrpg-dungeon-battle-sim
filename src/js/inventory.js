import {AllEquipment, Armor, Equipment, Weapons} from './data/equipment.js';

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
const inventory = {
  'Basic accessories': { name: 'Basic accessories', cost: 0, quantity: 1, weightLbs: 5 }
};

function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function createTableHTML(categoryName) {
  return `
        <section id="${categoryName.toLowerCase().replace(/\s/g, '-')}-section" class="mb-8">
            <h2 class="text-xl font-bold mb-2">${categoryName}</h2>
            <table class="min-w-full bg-white shadow-md rounded">
                <thead class="bg-gray-200 text-left">
                    <tr>
                        <th class="px-4 py-2">Name</th>
                        <th class="px-4 py-2">Weight lbs.</th>
                        <th class="px-4 py-2">Cost</th>
                        <th class="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>`;
}

function addEquipmentToTable(tableBody, item) {
  const row = tableBody.insertRow();
  row.className = 'hover:bg-gray-100';  // Add hover style

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
    row.className = 'hover:bg-gray-100';  // Add hover style

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

    // Create and append the Remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'px-4 py-1 text-sm text-red-500 hover:text-red-700';
    removeButton.onclick = () => removeFromInventory(item.name);

    const actionCell = row.insertCell(4);
    actionCell.appendChild(removeButton);
    actionCell.className = cellClassnames;

    totalWeight += item.weightLbs * item.quantity;
    totalCost += item.cost * item.quantity;
  });

  // Assume a placeholder for a carry modifier, which should be part of character's stats
  const carryModifier = 0; // This value would typically come from character data
  const baseMovementRate = getBaseMovementRate(totalWeight, carryModifier);

  document.getElementById('total-weight').textContent = totalWeight.toFixed(2);
  document.getElementById('total-cost').textContent = totalCost.toFixed(2);
  document.getElementById('base-movement-rate').textContent = baseMovementRate;

  updateSpeedDisplay(baseMovementRate)
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
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `));
}

/**
 * Determines the base movement rate based on the total weight carried and a carry modifier.
 * @param {number} totalWeight The total weight of equipment being carried.
 * @param {number} carryModifier The carry modifier from character's strength or other attributes.
 * @returns {number} The base movement rate.
 */
function getBaseMovementRate(totalWeight, carryModifier) {
  // Adjust the total weight with the carry modifier.
  const adjustedWeight = totalWeight + carryModifier;

  // Determine the base movement rate based on the adjusted weight.
  if (adjustedWeight <= 75) {
    return 12;
  } else if (adjustedWeight <= 100) {
    return 9;
  } else if (adjustedWeight <= 150) {
    return 6;
  } else if (adjustedWeight <= 300) {
    return 3;
  } else {
    // If weight exceeds the maximum limit defined, consider movement severely restricted or zero.
    return 0; // Adjust accordingly if there's a different rule for weights above 300 pounds.
  }
}

/**
 * Calculates speeds for walking, running, and combat based on the base movement rate.
 * @param {number} baseMovementRate The base movement rate of a character.
 * @returns {Object} An object containing the speeds for walking, running, and combat.
 */
function getSpeed(baseMovementRate) {
  return {
    walking: baseMovementRate * 20,
    running: baseMovementRate * 40,
    combat: Math.floor(baseMovementRate / 3) * 10
  };
}

/**
 * Updates the HTML element with speeds for walking, running, and combat based on the base movement rate.
 * @param {number} baseMovementRate The base movement rate of a character.
 */
function updateSpeedDisplay(baseMovementRate) {
  const speeds = getSpeed(baseMovementRate);
  document.getElementById('speed-feet-per-turn').textContent = `Walking: ${speeds.walking} | Running: ${speeds.running} | Combat: ${speeds.combat}`;
}

/**
 * Decreases the quantity of an item in the inventory or removes it entirely if quantity reaches zero.
 * @param {string} itemName The name of the item to remove.
 */
function removeFromInventory(itemName) {
  if (inventory[itemName]) {
    inventory[itemName].quantity -= 1;
    if (inventory[itemName].quantity <= 0) {
      delete inventory[itemName];  // Remove the item entirely if quantity is zero
    }
    updateInventoryUI();  // Update the UI to reflect the change
  }
}

function bindConversionControls() {
  document.getElementById('convert-button').addEventListener('click', function() {
    const input = document.getElementById('equipment-input').value;
    const itemList = input.split('\n'); // Split input by new lines to get individual items
    const notFoundItems = []; // To store items not found in the lists

    itemList.forEach(itemName => {
      const cleanedItemName = itemName.trim().toLowerCase();

      const item = AllEquipment.find(i => i.name.toLowerCase() === cleanedItemName);
      if (item) {
        addToInventory({...item, quantity: 1}); // Assume adding one item at a time
      }
      else {
        notFoundItems.push(itemName);
      }
    });

    // Update the error output
    if (notFoundItems.length > 0) {
      document.getElementById('error-output').textContent = 'Items not found: ' + notFoundItems.join(', ');
    } else {
      document.getElementById('error-output').textContent = '';
    }

    updateInventoryUI(); // Update UI to reflect changes in inventory
  });
}

function main() {
  const equipmentContainer = document.getElementById('equipment-container');

  createCategorySection(equipmentContainer, 'Armor', Armor);
  createCategorySection(equipmentContainer, 'Weapons', Weapons);
  createCategorySection(equipmentContainer, 'Equipment', Equipment);

  setupInventoryTable()
  bindConversionControls()
  updateInventoryUI()
}

document.addEventListener('DOMContentLoaded', main);
