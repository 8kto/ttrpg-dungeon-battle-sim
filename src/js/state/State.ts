/* eslint-disable sort-keys-fix/sort-keys-fix */

import { EquipItem } from '../domain/Equipment'
import { Inventory, InventoryItem } from '../domain/Inventory'
import { CharacterClass } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { Spell } from '../domain/snw/Magic'

export type CharacterOptions = {
  characterClass: CharacterClass
  stats: CharacterStats
  spells?: Record<string, Spell> | 'All'
}

export const DEFAULT_INVENTORY_ID = 'MainCharacter'

export const DEFAULT_INVENTORY_ITEMS = Object.freeze({
  'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weight: 8 },
}) as Record<string, InventoryItem>
const LOCAL_STORAGE_KEY = 's&w-generator'

export const DEFAULT_INVENTORY: Inventory = {
  id: DEFAULT_INVENTORY_ID,
  name: 'Main Character',
  items: { ...DEFAULT_INVENTORY_ITEMS },
  character: null,
}

export class State {
  #inventories: Record<string, Inventory> = {
    [DEFAULT_INVENTORY_ID]: DEFAULT_INVENTORY,
  }

  #currentInventoryId: string = DEFAULT_INVENTORY_ID
  static #instance: State | null = null

  constructor() {
    if (State.#instance) {
      throw new Error('Instance of State already created, use State.getInstance()')
    }

    const serializedInventories = this.getSerializedInventories()
    if (serializedInventories && Object.keys(serializedInventories).length) {
      this.#inventories = serializedInventories
      this.#currentInventoryId = Object.values(serializedInventories)[0].id
    }
  }

  serialize(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#inventories))
  }

  getSerializeInventories(): string {
    return JSON.stringify(this.#inventories, null, 2)
  }

  getSerializedInventories(): Record<string, Inventory> | null {
    try {
      const json = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!json || typeof json !== 'string') {
        return null
      }

      return JSON.parse(json)
    } catch (err) {
      console.error('Cannot restore serialized inventories', err)
    }

    return null
  }

  static getInstance(): State {
    if (!State.#instance) {
      State.#instance = new State()
    }

    return State.#instance!
  }

  static resetInstance(): void {
    State.#instance = null
  }

  getCurrentInventoryId(): string {
    return this.#currentInventoryId
  }

  setCurrentInventoryId(id: string): void {
    if (!this.#inventories[id]) {
      throw new Error(`Inventory does not exist: ${id}`)
    }

    this.#currentInventoryId = id
    this.serialize()
  }

  /**
   * Adds an item to a specified inventory.
   */
  addToInventory(inventoryId: string, item: EquipItem): void {
    const inventoryItems = this.#inventories[inventoryId].items

    if (!inventoryItems[item.name]) {
      inventoryItems[item.name] = { ...item, quantity: 0 }
    }
    inventoryItems[item.name].quantity++
    this.serialize()
  }

  /**
   * Removes an item from a specified inventory or decreases its quantity.
   */
  removeFromInventory(inventoryId: string, itemName: string): void {
    const inventoryItems = this.#inventories[inventoryId].items

    if (inventoryItems[itemName]) {
      inventoryItems[itemName].quantity -= 1

      if (inventoryItems[itemName].quantity <= 0) {
        delete inventoryItems[itemName]
      }

      this.serialize()
    }
  }

  getInventories(): Array<Inventory> {
    return Object.values(this.#inventories).filter(Boolean)
  }

  getInventory(inventoryId: string): Inventory {
    return this.#inventories[inventoryId]
  }

  setInventory(id: string, inventory: Inventory): void {
    this.#inventories[id] = inventory
    this.serialize()
  }

  removeInventory(id: string): void {
    delete this.#inventories[id]
    this.serialize()
  }

  removeCharacter(id: string): void {
    if (this.#inventories[id].character) {
      this.#inventories[id].character = null
    }
    this.serialize()
  }

  resetInventoryItems(id: string): void {
    this.#inventories[id].items = { ...DEFAULT_INVENTORY_ITEMS }
    this.serialize()
  }

  static getNewInventory(id: string, name: string): Inventory {
    return {
      id: id,
      name,
      items: { ...DEFAULT_INVENTORY_ITEMS },
      character: null,
    }
  }

  setCharacter(inventoryId: string, { characterClass, spells, stats }: CharacterOptions): void {
    this.#inventories[inventoryId].character = {
      stats: { ...stats },
      characterClass,
      spells,
    }
  }
}

export const getState = (): State => {
  return State.getInstance()
}
