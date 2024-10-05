/* eslint-disable sort-keys-fix/sort-keys-fix */

import { CharacterClasses } from '../config/snw/CharacterClasses'
import { EquipItem } from '../domain/Equipment'
import { Character, Inventory, InventoryItem } from '../domain/Inventory'
import { CharacterClass, CharacterClassDef } from '../domain/snw/CharacterClass'
import { CharacterStats } from '../domain/snw/CharacterStats'
import { Spell } from '../domain/snw/Magic'
import { assert } from '../utils/assert'

export type CharacterOptions = {
  characterClass: CharacterClass
  stats: CharacterStats
  spells?: Record<string, Spell> | 'All'
}

export type UiState = {
  currentInventoryId: string
  isCompactMode: boolean
}

export const DEFAULT_INVENTORY_ID = 'MainCharacter'

export const DEFAULT_INVENTORY_ITEMS = Object.freeze({
  'Basic accessories': { cost: 0, name: 'Basic accessories', quantity: 1, weight: 8 },
}) as Record<string, InventoryItem>
export const LOCAL_STORAGE_KEY = 's&w-generator'
export const LOCAL_UI_STORAGE_KEY = 's&w-generator:ui'

export const DEFAULT_INVENTORY: Inventory = {
  id: DEFAULT_INVENTORY_ID,
  name: 'Main Character',
  items: { ...DEFAULT_INVENTORY_ITEMS },
  character: null,
}

export class State {
  static #instance: State | null = null

  #inventories: Record<string, Inventory> = {
    [DEFAULT_INVENTORY_ID]: DEFAULT_INVENTORY,
  }

  #uiState: UiState = {
    currentInventoryId: DEFAULT_INVENTORY_ID,
    isCompactMode: false,
  }

  constructor() {
    if (State.#instance) {
      throw new Error('Instance of State already created, use State.getInstance()')
    }

    const serializedInventories = this.deserializeInventories()
    if (serializedInventories && Object.keys(serializedInventories).length) {
      this.#inventories = serializedInventories
    }

    const uiState = this.deserializeUiState()
    if (uiState && Object.keys(uiState).length) {
      this.#uiState = uiState
    }
  }

  /**
   * NB This worth debouncing for cases when called in loops
   */
  serialize(): this {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#inventories))
    localStorage.setItem(LOCAL_UI_STORAGE_KEY, JSON.stringify(this.#uiState))

    return this
  }

  getSerializedInventories(): string {
    return JSON.stringify(this.#inventories, null, 2)
  }

  deserializeInventories(): Record<string, Inventory> | null {
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

  deserializeUiState(): UiState | null {
    try {
      const json = localStorage.getItem(LOCAL_UI_STORAGE_KEY)
      if (!json || typeof json !== 'string') {
        return null
      }

      return JSON.parse(json)
    } catch (err) {
      console.error('Cannot restore serialized UI State', err)
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
    return this.#uiState.currentInventoryId
  }

  setCurrentInventoryId(id: string): void {
    if (!this.#inventories[id]) {
      throw new Error(`Inventory does not exist: ${id}`)
    }

    this.#uiState.currentInventoryId = id
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

  setPreparedSpells(inventoryId: string, spells: string[]): void {
    const inventory = this.#inventories[inventoryId]
    assert<Inventory>(inventory, `setPreparedSpells: Cannot find inventory ${inventoryId}`)
    assert<Character>(inventory.character, `setPreparedSpells: Cannot find inventory ${inventoryId}`)

    const classDef = CharacterClasses[inventory.character.characterClass]
    assert<CharacterClassDef>(classDef, `setPreparedSpells: Cannot parse character class for ${inventoryId}`)
    assert<boolean>(classDef.$isCaster, `setPreparedSpells: Character class is not caster: ${inventoryId}`)

    if (!inventory.character.prepared) {
      inventory.character.prepared = []
    }
    inventory.character.prepared = spells

    this.serialize()
  }

  setInventoryCompactMode(inventoryId: string, isCompact: boolean): void {
    const inventory = this.#inventories[inventoryId]
    assert<Inventory>(inventory, `setInventoryCompactMode: Cannot find inventory ${inventoryId}`)

    inventory.isCompact = isCompact
    this.serialize()
  }

  setCompactMode(compact: boolean): this {
    this.#uiState.isCompactMode = compact

    return this.serialize()
  }

  isCompactMode(): boolean {
    return this.#uiState.isCompactMode
  }

  setGold(inventoryId: string, value: number): this {
    const inventory = this.#inventories[inventoryId]
    assert<Inventory>(inventory, `setGold: Cannot find inventory ${inventoryId}`)
    assert(
      typeof value === 'number' && !isNaN(value) && value !== null && typeof value !== 'undefined',
      `setGold: Invalid value ${value}`,
    )

    if (inventory.character?.stats) {
      inventory.character.stats.Gold = Number(value)
    }

    return this
  }

  setHitPoints(inventoryId: string, value: number): this {
    const inventory = this.#inventories[inventoryId]
    assert<Inventory>(inventory, `setGold: Cannot find inventory ${inventoryId}`)
    assert(
      value && typeof value === 'number' && !isNaN(value) && value !== null && typeof value !== 'undefined',
      `setHitPoints: Invalid value ${value}`,
    )

    if (inventory.character?.stats) {
      inventory.character.stats.HitPoints = Math.floor(value)
    }

    return this
  }

  setInventories(data: Record<string, Inventory>): void {
    this.#inventories = data
    this.serialize()
  }
}

export const getState = (): State => {
  return State.getInstance()
}

// TODO try annotations e.g. @serializable
