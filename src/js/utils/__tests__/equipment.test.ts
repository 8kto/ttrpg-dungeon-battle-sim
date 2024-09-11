import { EquipItem, EquipSet, InventoryItemFlag } from '../../domain/Equipment'
import { Inventory } from '../../domain/Inventory'
import { getEquipNameSuffix, importEquipSet } from '../equipment'

jest.mock('../../config/snw/Equip', () => ({
  AllEquipment: [
    { armorClass: 0, damage: '1d8', flags: 0, name: 'Sword' },
    { armorClass: 2, damage: '', flags: InventoryItemFlag.VAR_HANDED, name: 'Shield' },
    { armorClass: 0, damage: '1d6', flags: InventoryItemFlag.MELEE_AND_MISSILE, name: 'Bow' },
  ],
}))

describe('getEquipNameSuffix', () => {
  it('should return correct suffix for item with armor class', () => {
    const item: EquipItem = {
      ascArmorClass: 2,
      cost: 1,
      damage: '',
      flags: InventoryItemFlag.VAR_HANDED,
      name: 'Shield',
      weight: 1,
    }
    expect(getEquipNameSuffix(item)).toBe(
      `<div class="ml-2 text-xs inline-block"><span class="text-alt">AC 2</span><span class="mr-1"><span class="font-bold text-sub hover:cursor-help" title="Can be used as either a one-handed or two-handed weapon">†</span></span></div>`,
    )
  })

  it('should return correct suffix for item with damage', () => {
    const item: EquipItem = { ascArmorClass: 0, cost: 1, damage: '1d8', name: 'Sword', weight: 1 }
    expect(getEquipNameSuffix(item)).toBe(
      '<div class="ml-2 text-xs inline-block"><span class="text-alt hover:cursor-help" title="Weapon damage">1d8</span></div>',
    )
  })

  it('should return correct suffix for item with multiple flags', () => {
    const item: EquipItem = {
      ascArmorClass: 0,
      cost: 1,
      damage: '1d6',
      flags: InventoryItemFlag.MELEE_AND_MISSILE,
      name: 'Bow',
      weight: 1,
    }
    expect(getEquipNameSuffix(item)).toBe(
      `<div class="ml-2 text-xs inline-block"><span class="mr-1"><span class="font-bold text-sub hover:cursor-help" title="Can be used as either a melee or missile weapon">‡</span></span><span class="text-alt hover:cursor-help" title="Weapon damage">1d6</span></div>`,
    )
  })

  it('should return empty string if no suffix is applicable', () => {
    const item: EquipItem = { ascArmorClass: 0, cost: 1, damage: '', name: 'Sword', weight: 1 }
    expect(getEquipNameSuffix(item)).toBe('')
  })
})

describe('importEquipSet', () => {
  it('should import equipment set into inventory', () => {
    const inventory: Inventory = { character: null, id: 'test-11', items: {}, name: 'Test' }
    const equipSet: EquipSet = {
      items: [
        { name: 'Sword', quantity: 1 },
        { name: 'Shield', quantity: 2 },
      ],
      name: 'Test',
    }

    importEquipSet(inventory, equipSet)

    expect(inventory.items['Sword']).toEqual({ armorClass: 0, damage: '1d8', flags: 0, name: 'Sword', quantity: 1 })
    expect(inventory.items['Shield']).toEqual({
      armorClass: 2,
      damage: '',
      flags: InventoryItemFlag.VAR_HANDED,
      name: 'Shield',
      quantity: 2,
    })
  })

  it('should add quantities of items if they already exist in inventory', () => {
    const inventory: Inventory = {
      character: null,
      id: 'test-11',
      items: { Sword: { ascArmorClass: 0, cost: 1, damage: '1d8', name: 'Sword', quantity: 1, weight: 1 } },
      name: 'Test',
    }
    const equipSet: EquipSet = { items: [{ name: 'Sword', quantity: 2 }], name: 'Test' }

    importEquipSet(inventory, equipSet)

    expect(inventory.items['Sword']).toEqual({ armorClass: 0, damage: '1d8', flags: 0, name: 'Sword', quantity: 3 })
  })

  it('should throw an error if an item in equip set is not found in AllEquipment', () => {
    const inventory: Inventory = { character: null, id: 't-1', items: {}, name: 'X' }
    const equipSet: EquipSet = { items: [{ name: 'NonExistentItem', quantity: 1 }], name: 'Test' }

    expect(() => importEquipSet(inventory, equipSet)).toThrowError('Original equip item not found for NonExistentItem')
  })
})
