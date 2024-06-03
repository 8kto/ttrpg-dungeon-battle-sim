/* eslint-disable sort-keys-fix/sort-keys-fix */
/**
 * @typedef {Object} Inventory
 * @property {string} name - The name of the inventory.
 * @property {Object.<string, InventoryItem>} items - The items in this inventory.
 */

/** @type {Object.<string, Inventory>} */
const inventories = {
  default: {
    name: 'Default',
    items: {
      'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weightLbs: 10 },
    },
  },
}

let currentInventoryId = 'default'

export const getCurrentInventoryId = () => {
  return currentInventoryId
}

export const setCurrentInventoryId = (id) => {
  currentInventoryId = id
}

/**
 * Adds an item to a specified inventory.
 * @param {string} inventoryId
 * @param {EquipItem} item - The item to add.
 */
export const addToInventory = (inventoryId, item) => {
  const inventory = inventories[inventoryId].items

  if (!inventory[item.name]) {
    inventory[item.name] = { ...item, quantity: 0 }
  }
  inventory[item.name].quantity++
}

/**
 * Removes an item from a specified inventory or decreases its quantity.
 * @param {string} inventoryId - The ID of the inventory to remove from.
 * @param {string} itemName - The name of the item to remove.
 */
export const removeFromInventory = (inventoryId, itemName) => {
  const inventory = inventories[inventoryId].items
  if (inventory[itemName]) {
    inventory[itemName].quantity -= 1
    if (inventory[itemName].quantity <= 0) {
      delete inventory[itemName]
    }
  }
}

export const getInventories = () => {
  return inventories
}

export const getInventory = (inventoryId) => {
  return inventories[inventoryId]
}
