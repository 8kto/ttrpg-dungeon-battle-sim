/* eslint-disable sort-keys-fix/sort-keys-fix */
/**
 * @typedef {Object} EquipItem
 * @property {string} name - The name of the armor.
 * @property {number} weightLbs - The weight of the armor in pounds.
 * @property {number} cost - The cost in golden pieces
 * @property {InventoryItemFlag} [flags] - Optional binary flags to describe item capabilities.
 */

/**
 * @typedef {number} InventoryItemFlag
 * @description Flags for special properties of inventory items.
 */

/** @type {InventoryItemFlag} */
export const TWO_HANDED = 0b000001
/** @type {InventoryItemFlag} */
export const VAR_HANDED = 0b000010
/** @type {InventoryItemFlag} */
export const MELEE_AND_MISSILE = 0b000100

/**
 * @typedef {Array<EquipItem>} ArmorList
 */

/** @type {ArmorList} */
export const Armor = [
  { cost: 15, name: 'Shield', weightLbs: 10 },
  { cost: 5, name: 'Leather', weightLbs: 25 },
  { cost: 30, name: 'Ring', weightLbs: 40 },
  { cost: 75, name: 'Chain', weightLbs: 50 },
  { cost: 100, name: 'Plate', weightLbs: 70 },
]

/**
 * @typedef {Array<EquipItem>} ItemList
 */

/** @type {ItemList} */
export const Equipment = [
  { cost: 0, name: 'Basic accessories', weightLbs: 10 },
  { cost: 5, name: 'Backpack', weightLbs: 2 },
  { cost: 2, name: 'Barrel', weightLbs: 25 },
  { cost: 1, name: 'Bedroll', weightLbs: 5 },
  { cost: 1, name: 'Bell', weightLbs: 0 },
  { cost: 5, name: 'Block and tackle', weightLbs: 2 },
  { cost: 2, name: 'Bottle of wine, glass', weightLbs: 6 },
  { cost: 0.01, name: 'Candle', weightLbs: 0.5 },
  { cost: 0.1, name: 'Canvas (per square yard)', weightLbs: 0.5 },
  { cost: 1, name: 'Case (map or scroll)', weightLbs: 1 },
  { cost: 30, name: 'Chain (10 feet)', weightLbs: 50 },
  { cost: 0.05, name: 'Chalk, 1 piece', weightLbs: 0 },
  { cost: 2, name: 'Chest', weightLbs: 25 },
  { cost: 0.2, name: 'Crowbar', weightLbs: 10 },
  { cost: 4, name: 'Fishing net (25 square feet)', weightLbs: 5 },
  { cost: 0.03, name: 'Flask, leather', weightLbs: 0.5 },
  { cost: 1, name: 'Flint & steel', weightLbs: 1 },
  { cost: 10, name: 'Garlic, charmed', weightLbs: 0 },
  { cost: 1, name: 'Grappling Hook', weightLbs: 4 },
  { cost: 0.5, name: 'Hammer', weightLbs: 2 },
  { cost: 1, name: 'Holy symbol, wooden', weightLbs: 0 },
  { cost: 25, name: 'Holy symbol, silver', weightLbs: 0.5 },
  { cost: 25, name: 'Holy water (flask)', weightLbs: 1 },
  { cost: 1, name: 'Ink (1-ounce bottle)', weightLbs: 0.1 },
  { cost: 0.05, name: 'Ladder (10 foot)', weightLbs: 20 },
  { cost: 0.1, name: 'Lamp, bronze', weightLbs: 2 },
  { cost: 12, name: 'Lantern, bullseye', weightLbs: 3 },
  { cost: 7, name: 'Lantern, hooded', weightLbs: 2 },
  { cost: 20, name: 'Lock', weightLbs: 1 },
  { cost: 15, name: 'Manacles', weightLbs: 5 },
  { cost: 20, name: 'Mirror, small still', weightLbs: 0.5 },
  { cost: 5, name: 'Musical instrument', weightLbs: 3 },
  { cost: 0.1, name: 'Oil, lamp (1 pint)', weightLbs: 1 },
  { cost: 0.2, name: 'Parchment (sheet)', weightLbs: 0.5 },
  { cost: 0.2, name: 'Pole (10 foot)', weightLbs: 10 },
  { cost: 0.5, name: 'Pot, iron', weightLbs: 5 },
  { cost: 1, name: 'Rations, trail', weightLbs: 2 },
  { cost: 0.5, name: 'Rations, dried', weightLbs: 2 },
  { cost: 1, name: 'Rope, hemp (50 feet)', weightLbs: 5 },
  { cost: 10, name: 'Rope, silk (50 feet)', weightLbs: 2 },
  { cost: 1, name: 'Sack (15 pounds capacity)', weightLbs: 1 },
  { cost: 2, name: 'Sack, (30 pounds capacity)', weightLbs: 2 },
  { cost: 2, name: 'Shovel', weightLbs: 5 },
  { cost: 0.5, name: 'Signal whistle', weightLbs: 0 },
  { cost: 25, name: 'Spellbook, blank', weightLbs: 1 },
  { cost: 0.05, name: 'Spike, iron', weightLbs: 2 },
  { cost: 10, name: 'Tent', weightLbs: 20 },
  { cost: 0.01, name: 'Torch', weightLbs: 1 },
  { cost: 1, name: 'Waterskin', weightLbs: 2 },
  { cost: 0.1, name: 'Wolfsbane', weightLbs: 0.5 },
]

/**
 * @typedef {Array<EquipItem>} WeaponList
 */

/** @type {WeaponList} */
export const Weapons = [
  { cost: 2, name: 'Arrows (20)', weightLbs: 1 },
  { cost: 5, name: 'Axe, Battle', weightLbs: 15, flags: VAR_HANDED | TWO_HANDED },
  { cost: 1, name: 'Axe, Hand', weightLbs: 5, flags: MELEE_AND_MISSILE },
  { cost: 60, name: 'Bow, Long', weightLbs: 5 },
  { cost: 15, name: 'Bow, Short', weightLbs: 5 },
  { cost: 0, name: 'Club', weightLbs: 10 },
  { cost: 20, name: 'Crossbow, Heavy', weightLbs: 5 },
  { cost: 12, name: 'Crossbow, Light', weightLbs: 5 },
  { cost: 2, name: 'Dagger', weightLbs: 2, flags: MELEE_AND_MISSILE },
  { cost: 0.5, name: 'Javelin', weightLbs: 5 },
  { cost: 10, name: 'Mace', weightLbs: 10 },
  { cost: 1, name: 'Sling', weightLbs: 0 },
  { cost: 0, name: 'Sling Stones (20)', weightLbs: 5 },
  { cost: 1, name: 'Spear', weightLbs: 10, flags: VAR_HANDED | MELEE_AND_MISSILE | TWO_HANDED },
  { cost: 0, name: 'Staff', weightLbs: 10 },
  { cost: 20, name: 'Sword, Bastard', weightLbs: 10, flags: VAR_HANDED | TWO_HANDED },
  { cost: 8, name: 'Sword, Short', weightLbs: 5 },
  { cost: 15, name: 'Sword, Long', weightLbs: 10 },
  { cost: 30, name: 'Sword, Two-Handed', weightLbs: 15 },
  { cost: 1, name: 'Hammer, war', weightLbs: 10 },
]

/** @type {Array<EquipItem>} */
export const AllEquipment = [...Armor, ...Weapons, ...Equipment]

/**
 * @typedef {Object} EquipSet
 * @property {string} name
 * @property {Array<{ name: string; quantity: number }>} items
 */

/**
 * @type {EquipSet}
 */
export const AssassinEquipmentSet = {
  name: 'Assassin',
  items: [
    {
      name: 'Basic accessories',
      quantity: 1,
    },
    {
      name: 'Leather',
      quantity: 1,
    },
    {
      name: 'Shield',
      quantity: 1,
    },
    {
      name: 'Sword, Long',
      quantity: 1,
    },
    {
      name: 'Sling Stones (20)',
      quantity: 1,
    },
    {
      name: 'Backpack',
      quantity: 1,
    },
    {
      name: 'Bedroll',
      quantity: 1,
    },
    {
      name: 'Candle',
      quantity: 10,
    },
    {
      name: 'Flask, leather',
      quantity: 1,
    },
    {
      name: 'Flint & steel',
      quantity: 1,
    },
    {
      name: 'Grappling Hook',
      quantity: 1,
    },
    {
      name: 'Lantern, hooded',
      quantity: 1,
    },
    {
      name: 'Manacles',
      quantity: 1,
    },
    {
      name: 'Oil, lamp (1 pint)',
      quantity: 2,
    },
    {
      name: 'Rations, dried',
      quantity: 7,
    },
    {
      name: 'Rope, silk (50 feet)',
      quantity: 1,
    },
    {
      name: 'Shovel',
      quantity: 1,
    },
    {
      name: 'Waterskin',
      quantity: 1,
    },
  ],
}

const ClericEquipSet = {
  name: 'Cleric',
  items: [
    {
      name: 'Basic accessories',
      quantity: 1,
    },
    {
      name: 'Ring',
      quantity: 1,
    },
    {
      name: 'Mace',
      quantity: 1,
    },
    {
      name: 'Sling',
      quantity: 1,
    },
    {
      name: 'Sling Stones (20)',
      quantity: 1,
    },
    {
      name: 'Backpack',
      quantity: 1,
    },
    {
      name: 'Bedroll',
      quantity: 1,
    },
    {
      name: 'Bell',
      quantity: 1,
    },
    {
      name: 'Flask, leather',
      quantity: 1,
    },
    {
      name: 'Flint & steel',
      quantity: 1,
    },
    {
      name: 'Holy symbol, wooden',
      quantity: 1,
    },
    {
      name: 'Lantern, hooded',
      quantity: 1,
    },
    {
      name: 'Waterskin',
      quantity: 1,
    },
    {
      name: 'Candle',
      quantity: 10,
    },
    {
      name: 'Holy water (flask)',
      quantity: 1,
    },
    {
      name: 'Oil, lamp (1 pint)',
      quantity: 3,
    },
    {
      name: 'Pole (10 foot)',
      quantity: 1,
    },
    {
      name: 'Rations, trail',
      quantity: 7,
    },
    {
      name: 'Rope, hemp (50 feet)',
      quantity: 1,
    },
    {
      name: 'Spike, iron',
      quantity: 6,
    },
  ],
}

export const EquipSets = {
  AssassinEquipmentSet,
  ClericEquipSet,
}
