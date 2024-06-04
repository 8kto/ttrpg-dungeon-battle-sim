/* eslint-disable sort-keys-fix/sort-keys-fix */
/**
 * @typedef {Object} Inventory
 * @property {string} id - The ID of the inventory.
 * @property {string} name - The name of the inventory.
 * @property {Record<string, InventoryItem>} items - The items in this inventory.
 */

export const DEFAULT_INVENTORY_ID = 'MainCharacter'
export const DEFAULT_INVENTORY_ITEMS = Object.freeze({
  'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weightLbs: 10 },
})

/** @type {Record<string, Inventory>} */
const inventories = {
  [DEFAULT_INVENTORY_ID]: {
    id: DEFAULT_INVENTORY_ID,
    name: 'Main Character',
    items: { ...DEFAULT_INVENTORY_ITEMS },
  },
}

let currentInventoryId = DEFAULT_INVENTORY_ID

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
  const inventoryItems = inventories[inventoryId].items

  if (!inventoryItems[item.name]) {
    inventoryItems[item.name] = { ...item, quantity: 0 }
  }
  inventoryItems[item.name].quantity++
}

/**
 * Removes an item from a specified inventory or decreases its quantity.
 * @param {string} inventoryId - The ID of the inventory to remove from.
 * @param {string} itemName - The name of the item to remove.
 */
export const removeFromInventory = (inventoryId, itemName) => {
  const inventoryItems = inventories[inventoryId].items

  if (inventoryItems[itemName]) {
    inventoryItems[itemName].quantity -= 1

    if (inventoryItems[itemName].quantity <= 0) {
      delete inventoryItems[itemName]
    }
  }
}

/**
 * @returns {Array<Inventory>}
 */
export const getInventories = () => {
  return Object.values(inventories)
}

/**
 * @param {string} inventoryId
 * @returns {Inventory}
 */
export const getInventory = (inventoryId) => {
  return inventories[inventoryId]
}

/**
 * @param {string} id
 * @param {Inventory} inventory
 */
export const setInventory = (id, inventory) => {
  inventories[id] = inventory
}

// TODO rename inventory
// TODO remove inventory
