/* eslint-disable sort-keys-fix/sort-keys-fix */

/**
 * @typedef {Object} Inventory
 * @property {string} id
 * @property {string} name
 * @property {Record<string, InventoryItem>} items
 * @property {{ stats: CharacterStats; classDef: CharacterClass }} [character]
 */

export const DEFAULT_INVENTORY_ID = 'MainCharacter'
export const DEFAULT_INVENTORY_ITEMS = Object.freeze({
  'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weight: 8 },
})
const LOCAL_STORAGE_KEY = 's&w-generator'

export class State {
  /** @type {Record<string, Inventory>} */
  #inventories = {
    [DEFAULT_INVENTORY_ID]: {
      id: DEFAULT_INVENTORY_ID,
      name: 'Main Character',
      items: { ...DEFAULT_INVENTORY_ITEMS },
      character: null,
    },
  }

  #currentInventoryId = DEFAULT_INVENTORY_ID
  static #instance = null

  constructor() {
    if (State.#instance) {
      throw new Error('Instance of State already created, use State.getInstance()')
    }

    const serializedInventories = this.getSerializedInventories()
    if (Object.keys(serializedInventories).length) {
      this.#inventories = serializedInventories
      this.#currentInventoryId = Object.values(serializedInventories)[0].id
    }
  }

  // TODO rename
  serializeInventories() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#inventories))
  }

  getSerializeInventories() {
    return JSON.stringify(this.#inventories, null, 2)
  }

  /**
   * @returns {Record<string, Inventory>|null}
   */
  getSerializedInventories() {
    try {
      const json = localStorage.getItem(LOCAL_STORAGE_KEY)

      return JSON.parse(json)
    } catch (err) {
      console.error('Cannot restore serialized inventories', err)
    }

    return null
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
    this.serializeInventories()
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
    this.serializeInventories()
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

      this.serializeInventories()
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
    this.serializeInventories()
  }

  /**
   * @param {string} id
   */
  removeInventory(id) {
    delete this.#inventories[id]
    this.serializeInventories()
  }

  /**
   * @param {string} id
   */
  resetInventoryItems(id) {
    this.#inventories[id].items = { ...DEFAULT_INVENTORY_ITEMS }
    this.serializeInventories()
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

  /**
   * @param {string} id
   * @param {CharacterStats} stats
   * @param {CharacterClass} classDef
   */
  setCharacter(id, stats, classDef) {
    this.#inventories[id].character = { stats: { ...stats }, classDef: { ...classDef } }
  }
}

/**
 * @returns {State}
 */
export const getState = () => {
  return State.getInstance()
}
