/* eslint-disable sort-keys-fix/sort-keys-fix */
// import { serializeProxy } from './serialize.js'

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

export class State {
  /** @type {Record<string, Inventory>} */
  #inventories = {
    [DEFAULT_INVENTORY_ID]: {
      id: DEFAULT_INVENTORY_ID,
      name: 'Main Character',
      items: { ...DEFAULT_INVENTORY_ITEMS },
    },
  }

  #currentInventoryId = DEFAULT_INVENTORY_ID
  static #instance = null

  constructor() {
    if (State.#instance) {
      throw new Error('Instance of State already created, use State.getInstance()')
    }
  }

  static getInstance() {
    if (State.#instance === null) {
      State.#instance = new State()
    }

    return State.#instance
  }

  getCurrentInventoryId() {
    return this.#currentInventoryId
  }

  setCurrentInventoryId(id) {
    this.#currentInventoryId = id
  }

  /**
   * Adds an item to a specified inventory.
   * @param {string} inventoryId
   * @param {EquipItem} item - The item to add.
   */
  addToInventory(inventoryId, item) {
    const inventoryItems = this.#inventories[inventoryId].items

    if (!inventoryItems[item.name]) {
      inventoryItems[item.name] = { ...item, quantity: 0 }
    }
    inventoryItems[item.name].quantity++
    // serializeProxy(inventories)
  }

  /**
   * Removes an item from a specified inventory or decreases its quantity.
   * @param {string} inventoryId - The ID of the inventory to remove from.
   * @param {string} itemName - The name of the item to remove.
   */
  removeFromInventory(inventoryId, itemName) {
    const inventoryItems = this.#inventories[inventoryId].items

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
  getInventories() {
    return Object.values(this.#inventories).filter(Boolean)
  }

  /**
   * @param {string} inventoryId
   * @returns {Inventory}
   */
  getInventory(inventoryId) {
    return this.#inventories[inventoryId]
  }

  /**
   * @param {string} id
   * @param {Inventory} inventory
   */
  setInventory(id, inventory) {
    this.#inventories[id] = inventory
  }

  /**
   * @param {string} id
   */
  removeInventory(id) {
    delete this.#inventories[id]
  }

  /**
   * @param {string} id
   */
  resetInventoryItems(id) {
    this.#inventories[id].items = { ...DEFAULT_INVENTORY_ITEMS }
    // serializeProxy(inventories)
  }

  /**
   * @param {string} id
   * @param {string} name
   * @returns {Inventory}
   */
  static getNewInventory(id, name) {
    return {
      id: id,
      name,
      items: { ...DEFAULT_INVENTORY_ITEMS },
    }
  }
}

/**
 * @returns {State}
 */
export const getState = () => {
  return State.getInstance()
}

// TODO rename inventory
