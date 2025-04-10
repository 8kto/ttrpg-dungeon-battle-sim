import { CharacterClasses } from '../../config/snw/CharacterClasses'
import type { EquipItem } from '../../domain/Equipment'
import type { Character } from '../../domain/snw/Character'
import { Alignment, CharacterRace } from '../../domain/snw/CharacterClass'
import { clericInventoryMock } from '../../mocks/snw/characterMocks'
import {
  DEFAULT_INVENTORY,
  DEFAULT_INVENTORY_ID,
  DEFAULT_INVENTORY_ITEMS,
  getState,
  LOCAL_STORAGE_KEY,
  LOCAL_UI_STORAGE_KEY,
  State,
} from '../State'

const getCharacterOptions = (): Character => {
  return {
    alignment: Alignment.Lawful,
    ancestry: CharacterRace.Human,
    armorClass: { aac: 10, armor: 'None', dac: 9 },
    classDef: CharacterClasses.MagicUser,
    damageMod: '0',
    experiencePoints: 0,
    experiencePointsBonus: 5,
    gold: 140,
    hitPoints: 1,
    level: 1,
    spells: {
      'Charm Person': {
        level: 1,
        name: 'Charm Person',
      },
      'Detect Magic': {
        level: 1,
        name: 'Detect Magic',
      },
      'Hold Portal': {
        level: 1,
        name: 'Hold Portal',
      },
      Light: {
        level: 1,
        name: 'Light',
      },
      'Protection from Evil': {
        level: 1,
        name: 'Protection from Evil',
      },
      'Read Languages': {
        level: 1,
        name: 'Read Languages',
      },
      Shield: {
        level: 1,
        name: 'Shield',
      },
      Sleep: {
        level: 1,
        name: 'Sleep',
      },
    },
    stats: {
      Charisma: {
        MaxNumberOfSpecialHirelings: 4,
        Score: 9,
      },
      Constitution: {
        HitPoints: -1,
        RaiseDeadSurvivalChance: '50%',
        Score: 5,
      },
      Dexterity: {
        ArmorClass: 1,
        MissilesToHit: 1,
        Score: 13,
      },
      Intelligence: {
        MaxAdditionalLanguages: 4,
        MaxSpellLevel: 8,
        NewSpellUnderstandingChance: 75,
        Score: 15,
        SpellsPerLevel: '6/10',
      },
      Strength: {
        Carry: 5,
        Damage: 0,
        Doors: '1-2',
        Score: 9,
        ToHit: 0,
      },
      Wisdom: {
        Score: 9,
      },
    },
    toHit: { melee: '0', missiles: '0' },
  }
}

describe('State', () => {
  let state: State
  // @ts-ignore
  jest.SpyInstance = jest.spyOn(console, 'error').mockImplementation(() => {
    void 0
  })

  beforeEach(() => {
    localStorage.clear()
    State.resetInstance()
    state = getState()
  })

  it('should throw if constructor called more than once', () => {
    expect(() => new State()).toThrow('Instance of State already created, use State.getInstance()')
  })

  describe('default state', () => {
    it('should initialize with default inventory', () => {
      const inventories = state.getInventories()
      expect(inventories).toMatchSnapshot()
    })

    it('should return current inventory ID', () => {
      expect(state.getCurrentInventoryId()).toEqual(DEFAULT_INVENTORY_ID)
    })

    it('should serialize and deserialize inventories', () => {
      state.serialize()
      const serializedInventories = state.deserializeInventories()

      expect(serializedInventories).toEqual({
        [DEFAULT_INVENTORY_ID]: DEFAULT_INVENTORY,
      })
    })
  })

  describe('serialization', () => {
    it('should call localStorage.getItem', () => {
      // @ts-ignore
      const localStorageGetItemSpy = jest.spyOn(Storage.prototype, 'getItem')

      State.resetInstance()
      getState()

      expect(localStorageGetItemSpy).toHaveBeenCalledTimes(2)
      expect(localStorageGetItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_KEY)
      expect(localStorageGetItemSpy).toHaveBeenCalledWith(LOCAL_UI_STORAGE_KEY)
    })

    it('should restore inventories from localStorage', () => {
      const inventoriesJson = JSON.stringify({ ClericInventory: clericInventoryMock }, null, 2)
      localStorage.setItem(LOCAL_STORAGE_KEY, inventoriesJson)

      State.resetInstance()
      const state = getState()

      expect(state.getInventories()).toEqual([clericInventoryMock])
      expect(state.getSerializedInventories()).toEqual(inventoriesJson)
      expect(state.deserializeInventories()).toEqual(JSON.parse(inventoriesJson))
    })

    it('should restore UI state from localStorage', () => {
      const uiStateJson = `{"currentInventoryId": "id-1", "isCompactMode": true}`
      localStorage.setItem(LOCAL_UI_STORAGE_KEY, uiStateJson)

      expect(getState().getCurrentInventoryId()).toEqual(DEFAULT_INVENTORY_ID)
      expect(getState().isCompactMode()).toEqual(false)

      State.resetInstance()
      const state = getState()

      expect(state.deserializeUiState()).toEqual(JSON.parse(uiStateJson))
      expect(state.getCurrentInventoryId()).toEqual('id-1')
      expect(state.isCompactMode()).toEqual(true)
    })

    it('should handle empty localStorage', () => {
      localStorage.clear()
      State.resetInstance()
      expect(() => getState()).not.toThrow()
      expect(getState()).toEqual({})
    })

    it.each([
      null,
      0,
      // @ts-ignore
      // eslint-disable-next-line no-undefined
      undefined,
      '',
      'null',
      'false',
      false,
      NaN,
      '{A:',
      'x:1',
      `\n`,
    ])('should handle corrupted serialized inventories [%j]', (input) => {
      localStorage.clear()
      // @ts-ignore
      localStorage.setItem(LOCAL_STORAGE_KEY, input)

      State.resetInstance()
      expect(() => getState()).not.toThrow()
      expect(getState()).toEqual({})
    })

    it.each([
      null,
      0,
      // @ts-ignore
      // eslint-disable-next-line no-undefined
      undefined,
      '',
      'null',
      'false',
      false,
      NaN,
      '{A:',
      'x:1',
      `\n`,
    ])('should handle corrupted serialized UI state [%j]', (input) => {
      localStorage.clear()
      // @ts-ignore
      localStorage.setItem(LOCAL_UI_STORAGE_KEY, input)

      State.resetInstance()
      expect(() => getState()).not.toThrow()
      expect(getState()).toEqual({})
    })
  })

  describe('inventory items', () => {
    it('should add inventory items', () => {
      state.addToInventory(DEFAULT_INVENTORY_ID, { cost: 10, name: 'Sword', weight: 5 })
      state.addToInventory(DEFAULT_INVENTORY_ID, { cost: 10, name: 'Sword', weight: 5 })
      state.addToInventory(DEFAULT_INVENTORY_ID, { cost: 70, name: 'Plate', weight: 100 })

      const inventory = state.getInventory(DEFAULT_INVENTORY_ID)
      expect(inventory.items).toEqual({
        'Basic accessories': {
          cost: 0,
          name: 'Basic accessories',
          quantity: 1,
          weight: 8,
        },
        Plate: {
          cost: 70,
          name: 'Plate',
          quantity: 1,
          weight: 100,
        },
        Sword: {
          cost: 10,
          name: 'Sword',
          quantity: 2,
          weight: 5,
        },
      })
    })

    it('should remove item from inventory', () => {
      const item: EquipItem = { cost: 10, name: 'Mace', weight: 5 }
      state.addToInventory(DEFAULT_INVENTORY_ID, item)
      state.removeFromInventory(DEFAULT_INVENTORY_ID, 'Mace')
      const inventory = state.getInventory(DEFAULT_INVENTORY_ID)

      expect(inventory.items['Mace']).toBeUndefined()
    })

    it('should set and get current inventory ID', () => {
      const newInventoryId = 'newId'
      state.setInventory(newInventoryId, DEFAULT_INVENTORY)
      state.setCurrentInventoryId(newInventoryId)
      expect(state.getCurrentInventoryId()).toBe(newInventoryId)
    })

    it('should throw for unknown inventory ID', () => {
      const newInventoryId = 'newId'

      expect(() => state.setCurrentInventoryId(newInventoryId)).toThrow(`Inventory does not exist: ${newInventoryId}`)
    })

    it('should reset inventory items', () => {
      state.addToInventory(DEFAULT_INVENTORY_ID, { cost: 10, name: 'Sword', weight: 5 })
      state.addToInventory(DEFAULT_INVENTORY_ID, { cost: 10, name: 'Sword', weight: 5 })
      state.addToInventory(DEFAULT_INVENTORY_ID, { cost: 70, name: 'Plate', weight: 100 })

      state.resetInventoryItems(DEFAULT_INVENTORY_ID)

      const inventory = state.getInventory(DEFAULT_INVENTORY_ID)
      expect(inventory.items).toEqual(DEFAULT_INVENTORY_ITEMS)
    })
  })

  describe('character', () => {
    it('should set and remove character in inventory', () => {
      state.setCharacter(DEFAULT_INVENTORY_ID, getCharacterOptions())

      let inventory = state.getInventory(DEFAULT_INVENTORY_ID)
      expect(inventory.character).toMatchSnapshot()

      state.removeCharacter(DEFAULT_INVENTORY_ID)
      inventory = state.getInventory(DEFAULT_INVENTORY_ID)
      expect(inventory.character).toBeNull()
    })

    it('should prepare spells', () => {
      const opts = getCharacterOptions()
      delete opts.spells

      state.setCharacter(DEFAULT_INVENTORY_ID, opts)
      const inventory = state.getInventory(DEFAULT_INVENTORY_ID)

      expect(inventory.character?.prepared).toBeUndefined()

      state.setPreparedSpells(inventory.id, ['Sleep', 'Protection from Evil'])
      expect(inventory.character?.prepared).toEqual(['Sleep', 'Protection from Evil'])
    })
  })

  describe('inventories', () => {
    it('should create a new inventory', () => {
      const newInventory = State.getNewInventory('newId', 'New Inventory')
      expect(newInventory).toEqual({
        character: null,
        id: 'newId',
        items: { ...DEFAULT_INVENTORY_ITEMS },
        name: 'New Inventory',
      })
    })

    it('should set and get inventory', () => {
      const newInventory = State.getNewInventory('newId', 'New Inventory')
      state.setInventory('newId', newInventory)
      const inventory = state.getInventory('newId')
      expect(inventory).toEqual(newInventory)
    })

    it('should remove inventory', () => {
      const newInventory = State.getNewInventory('newId', 'New Inventory')
      state.setInventory('newId', newInventory)
      state.removeInventory('newId')
      const inventory = state.getInventory('newId')
      expect(inventory).toBeUndefined()
    })

    it('should remove inventory', () => {
      const newInventory = State.getNewInventory('newId', 'New Inventory')
      state.setInventory('newId', newInventory)
      state.removeInventory('newId')
      const inventory = state.getInventory('newId')
      expect(inventory).toBeUndefined()
    })

    it('should allow removing default inventory', () => {
      state.removeInventory(DEFAULT_INVENTORY_ID)
      expect(state.getInventory(DEFAULT_INVENTORY_ID)).toBeUndefined()
      expect(state.getInventories()).toEqual([])
    })

    it('should set inventories', () => {
      const inventories = {
        'id-1': State.getNewInventory('id-1', 'New Inventory 1'),
        'id-2': State.getNewInventory('id-2', 'New Inventory 2'),
      }

      state.setInventories({ ...inventories })
      expect(state.getInventories()).toEqual(Object.values(inventories))
    })
  })

  describe('setGold', () => {
    beforeEach(() => {
      state.setCharacter(DEFAULT_INVENTORY_ID, getCharacterOptions())
    })

    it('should set value', () => {
      state.setGold(DEFAULT_INVENTORY_ID, 500)
      expect(state.getInventory(DEFAULT_INVENTORY_ID).character?.gold).toBe(500)
    })

    it('should support 0s', () => {
      state.setGold(DEFAULT_INVENTORY_ID, 0)
      expect(state.getInventory(DEFAULT_INVENTORY_ID).character?.gold).toBe(0)
    })

    it('should set float', () => {
      state.setGold(DEFAULT_INVENTORY_ID, 25.5)
      expect(state.getInventory(DEFAULT_INVENTORY_ID).character?.gold).toBe(25.5)
    })

    it.each([
      null,
      // eslint-disable-next-line no-undefined
      undefined,
      '',
      'string',
      false,
      -50,
      NaN,
    ])('should throw for invalid values %j', (input) => {
      // @ts-ignore
      expect(() => state.setGold(DEFAULT_INVENTORY_ID, input)).toThrow('setGold: Invalid value')
    })
  })

  describe('setHitPoints', () => {
    beforeEach(() => {
      state.setCharacter(DEFAULT_INVENTORY_ID, getCharacterOptions())
    })

    it('should set value', () => {
      state.setHitPoints(DEFAULT_INVENTORY_ID, 8)
      expect(state.getInventory(DEFAULT_INVENTORY_ID).character?.hitPoints).toBe(8)
    })

    it('should not set float', () => {
      state.setHitPoints(DEFAULT_INVENTORY_ID, 6.5)
      expect(state.getInventory(DEFAULT_INVENTORY_ID).character?.hitPoints).toBe(6)
    })

    it.each([
      null,
      0,
      -3,
      // eslint-disable-next-line no-undefined
      undefined,
      '',
      'string',
      false,
      NaN,
    ])('should throw for invalid values %j', (input) => {
      // @ts-ignore
      expect(() => state.setHitPoints(DEFAULT_INVENTORY_ID, input)).toThrow('setHitPoints: Invalid value')
    })
  })

  describe('UI state', () => {
    describe('compact mode', () => {
      it('should set global compact mode', () => {
        expect(state.isCompactMode()).toEqual(false)
        state.setCompactMode(true)
        expect(state.isCompactMode()).toEqual(true)
      })

      it('should restore global compact mode', () => {
        state.setCompactMode(true)
        state.serialize()

        const deserializeUiState = state.deserializeUiState()

        expect(deserializeUiState).toEqual({
          currentInventoryId: DEFAULT_INVENTORY_ID,
          isCompactMode: true,
        })
      })

      it('should set inventory compact mode', () => {
        const inventoriesJson = JSON.stringify({ ClericInventory: clericInventoryMock }, null, 2)
        localStorage.setItem(LOCAL_STORAGE_KEY, inventoriesJson)

        State.resetInstance()
        const state = getState()

        expect(state.getInventory(clericInventoryMock.id).isCompact).toEqual(false)
        state.setInventoryCompactMode(clericInventoryMock.id, true)
        expect(state.getInventory(clericInventoryMock.id).isCompact).toEqual(true)

        // Global compact mode is not affected
        const deserializeUiState = state.deserializeUiState()
        expect(deserializeUiState).toEqual({
          currentInventoryId: DEFAULT_INVENTORY_ID,
          isCompactMode: false,
        })

        // Inventory compact mode is set
        expect(state.getInventory(clericInventoryMock.id).isCompact).toEqual(true)
      })
    })
  })
})
