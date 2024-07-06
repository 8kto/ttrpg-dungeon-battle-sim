import { EquipItem } from '../../domain/Equipment'
import { CharacterClass } from '../../domain/snw/CharacterClass'
import {
  CharacterOptions,
  DEFAULT_INVENTORY,
  DEFAULT_INVENTORY_ID,
  DEFAULT_INVENTORY_ITEMS,
  getState,
  State,
} from '../State'

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
      const serializedInventories = state.getSerializedInventories()

      expect(serializedInventories).toEqual({
        [DEFAULT_INVENTORY_ID]: DEFAULT_INVENTORY,
      })
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
      const characterOptions: CharacterOptions = {
        characterClass: CharacterClass.MagicUser,
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
          Gold: 140,
          HitPoints: 1,
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
      }
      state.setCharacter(DEFAULT_INVENTORY_ID, characterOptions)

      let inventory = state.getInventory(DEFAULT_INVENTORY_ID)
      expect(inventory.character).toMatchSnapshot()

      state.removeCharacter(DEFAULT_INVENTORY_ID)
      inventory = state.getInventory(DEFAULT_INVENTORY_ID)
      expect(inventory.character).toBeNull()
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
  })
})
