/* eslint-disable sort-keys-fix/sort-keys-fix */
/**
 * @typedef {Object} EquipItem
 * @property {string} name - The name of the armor.
 * @property {number} weight - The weight of the armor in pounds.
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
  { cost: 15, name: 'Shield', weight: 10 },
  { cost: 5, name: 'Leather', weight: 25 },
  { cost: 30, name: 'Ring', weight: 40 },
  { cost: 75, name: 'Chain', weight: 50 },
  { cost: 100, name: 'Plate', weight: 70 },
]

/**
 * @typedef {Array<EquipItem>} ItemList
 */

/** @type {ItemList} */
export const Equipment = [
  { cost: 0, name: 'Basic accessories', weight: 10 },
  { cost: 5, name: 'Backpack', weight: 2 },
  { cost: 2, name: 'Barrel', weight: 25 },
  { cost: 1, name: 'Bedroll', weight: 5 },
  { cost: 1, name: 'Bell', weight: 0 },
  { cost: 5, name: 'Block and tackle', weight: 2 },
  { cost: 2, name: 'Bottle of wine, glass', weight: 6 },
  { cost: 0.01, name: 'Candle', weight: 0.5 },
  { cost: 0.1, name: 'Canvas (per square yard)', weight: 0.5 },
  { cost: 1, name: 'Case (map or scroll)', weight: 1 },
  { cost: 30, name: 'Chain (10 feet)', weight: 50 },
  { cost: 0.05, name: 'Chalk, 1 piece', weight: 0 },
  { cost: 2, name: 'Chest', weight: 25 },
  { cost: 0.2, name: 'Crowbar', weight: 10 },
  { cost: 4, name: 'Fishing net (25 square feet)', weight: 5 },
  { cost: 0.03, name: 'Flask, leather', weight: 0.5 },
  { cost: 1, name: 'Flint & steel', weight: 1 },
  { cost: 10, name: 'Garlic, charmed', weight: 0 },
  { cost: 1, name: 'Grappling Hook', weight: 4 },
  { cost: 0.5, name: 'Hammer', weight: 2 },
  { cost: 1, name: 'Holy symbol, wooden', weight: 0 },
  { cost: 25, name: 'Holy symbol, silver', weight: 0.5 },
  { cost: 25, name: 'Holy water (flask)', weight: 1 },
  { cost: 1, name: 'Ink (1-ounce bottle)', weight: 0.1 },
  { cost: 0.05, name: 'Ladder (10 foot)', weight: 20 },
  { cost: 0.1, name: 'Lamp, bronze', weight: 2 },
  { cost: 12, name: 'Lantern, bullseye', weight: 3 },
  { cost: 7, name: 'Lantern, hooded', weight: 2 },
  { cost: 20, name: 'Lock', weight: 1 },
  { cost: 15, name: 'Manacles', weight: 5 },
  { cost: 20, name: 'Mirror', weight: 0.5 },
  { cost: 5, name: 'Musical instrument', weight: 3 },
  { cost: 0.1, name: 'Oil, lamp (1 pint)', weight: 1 },
  { cost: 0.2, name: 'Parchment (sheet)', weight: 0.5 },
  { cost: 0.2, name: 'Pole (10 foot)', weight: 10 },
  { cost: 0.5, name: 'Pot, iron', weight: 5 },
  { cost: 1, name: 'Rations, trail', weight: 2 },
  { cost: 0.5, name: 'Rations, dried', weight: 2 },
  { cost: 1, name: 'Rope, hemp (50 feet)', weight: 5 },
  { cost: 10, name: 'Rope, silk (50 feet)', weight: 2 },
  { cost: 1, name: 'Sack (15 pounds capacity)', weight: 1 },
  { cost: 2, name: 'Sack, (30 pounds capacity)', weight: 2 },
  { cost: 2, name: 'Shovel', weight: 5 },
  { cost: 0.5, name: 'Signal whistle', weight: 0 },
  { cost: 25, name: 'Spellbook, blank', weight: 1 },
  { cost: 0.05, name: 'Spike, iron', weight: 2 },
  { cost: 10, name: 'Tent', weight: 20 },
  { cost: 0.01, name: 'Torch', weight: 1 },
  { cost: 1, name: 'Waterskin', weight: 2 },
  { cost: 0.1, name: 'Wolfsbane', weight: 0.5 },
]

/**
 * @typedef {Array<EquipItem>} WeaponList
 */

/** @type {WeaponList} */
export const Weapons = [
  { cost: 2, name: 'Arrows (20)', weight: 1 },
  { cost: 5, name: 'Axe, Battle', weight: 15, flags: VAR_HANDED | TWO_HANDED },
  { cost: 1, name: 'Axe, Hand', weight: 5, flags: MELEE_AND_MISSILE },
  { cost: 60, name: 'Bow, Long', weight: 5 },
  { cost: 15, name: 'Bow, Short', weight: 5 },
  { cost: 0, name: 'Club', weight: 10 },
  { cost: 20, name: 'Crossbow, Heavy', weight: 5 },
  { cost: 12, name: 'Crossbow, Light', weight: 5 },
  { cost: 2, name: 'Dagger', weight: 2, flags: MELEE_AND_MISSILE },
  { cost: 0.5, name: 'Javelin', weight: 5 },
  { cost: 10, name: 'Mace', weight: 10 },
  { cost: 1, name: 'Sling', weight: 0 },
  { cost: 0, name: 'Sling Stones (20)', weight: 5 },
  { cost: 1, name: 'Spear', weight: 10, flags: VAR_HANDED | MELEE_AND_MISSILE | TWO_HANDED },
  { cost: 0, name: 'Staff', weight: 10 },
  { cost: 20, name: 'Sword, Bastard', weight: 10, flags: VAR_HANDED | TWO_HANDED },
  { cost: 8, name: 'Sword, Short', weight: 5 },
  { cost: 15, name: 'Sword, Long', weight: 10 },
  { cost: 30, name: 'Sword, Two-Handed', weight: 15 },
  { cost: 1, name: 'Hammer, war', weight: 10 },
]

/** @type {Array<EquipItem>} */
export const AllEquipment = [...Armor, ...Weapons, ...Equipment]

/**
 * @typedef {Object} EquipSet
 * @property {string} name
 * @property {Array<{ name: string; quantity: number }>} items
 */

const BaseAdventurerEquipSet = {
  name: 'Base Adventurer',
  items: [
    { name: 'Basic accessories', quantity: 1 },
    { name: 'Arrows (20)', quantity: 1 },
    { name: 'Bow, Short', quantity: 1 },
    { name: 'Dagger', quantity: 1 },
    { name: 'Sword, Long', quantity: 1 },
    { name: 'Backpack', quantity: 1 },
    { name: 'Bedroll', quantity: 1 },
    { name: 'Block and tackle', quantity: 1 },
    { name: 'Case (map or scroll)', quantity: 1 },
    { name: 'Chalk, 1 piece', quantity: 1 },
    { name: 'Crowbar', quantity: 1 },
    { name: 'Fishing net (25 square feet)', quantity: 1 },
    { name: 'Flint & steel', quantity: 1 },
    { name: 'Grappling Hook', quantity: 1 },
    { name: 'Ink (1-ounce bottle)', quantity: 1 },
    { name: 'Ladder (10 foot)', quantity: 1 },
    { name: 'Lantern, bullseye', quantity: 1 },
    { name: 'Leather', quantity: 1 },
    { name: 'Mirror', quantity: 1 },
    { name: 'Oil, lamp (1 pint)', quantity: 3 },
    { name: 'Parchment (sheet)', quantity: 1 },
    { name: 'Pole (10 foot)', quantity: 1 },
    { name: 'Rations, trail', quantity: 5 },
    { name: 'Rope, hemp (50 feet)', quantity: 1 },
    { name: 'Sack (15 pounds capacity)', quantity: 1 },
    { name: 'Waterskin', quantity: 1 },
  ],
}

/** @type {EquipSet} */
const AssassinEquipSet = {
  name: 'Assassin',
  items: [
    { name: 'Basic accessories', quantity: 1 },
    { name: 'Leather', quantity: 1 },
    { name: 'Shield', quantity: 1 },
    { name: 'Sword, Long', quantity: 1 },
    { name: 'Sling Stones (20)', quantity: 1 },
    { name: 'Backpack', quantity: 1 },
    { name: 'Bedroll', quantity: 1 },
    { name: 'Candle', quantity: 10 },
    { name: 'Flask, leather', quantity: 1 },
    { name: 'Flint & steel', quantity: 1 },
    { name: 'Grappling Hook', quantity: 1 },
    { name: 'Lantern, hooded', quantity: 1 },
    { name: 'Manacles', quantity: 1 },
    { name: 'Oil, lamp (1 pint)', quantity: 2 },
    { name: 'Rations, dried', quantity: 7 },
    { name: 'Rope, silk (50 feet)', quantity: 1 },
    { name: 'Shovel', quantity: 1 },
    { name: 'Waterskin', quantity: 1 },
  ],
}

/** @type {EquipSet} */
const ClericEquipSet = {
  name: 'Cleric',
  items: [
    { name: 'Basic accessories', quantity: 1 },
    { name: 'Ring', quantity: 1 },
    { name: 'Mace', quantity: 1 },
    { name: 'Sling', quantity: 1 },
    { name: 'Sling Stones (20)', quantity: 1 },
    { name: 'Backpack', quantity: 1 },
    { name: 'Bedroll', quantity: 1 },
    { name: 'Bell', quantity: 1 },
    { name: 'Flask, leather', quantity: 1 },
    { name: 'Flint & steel', quantity: 1 },
    { name: 'Holy symbol, wooden', quantity: 1 },
    { name: 'Lantern, hooded', quantity: 1 },
    { name: 'Waterskin', quantity: 1 },
    { name: 'Candle', quantity: 10 },
    { name: 'Holy water (flask)', quantity: 1 },
    { name: 'Oil, lamp (1 pint)', quantity: 3 },
    { name: 'Rations, trail', quantity: 7 },
    { name: 'Rope, hemp (50 feet)', quantity: 1 },
    { name: 'Spike, iron', quantity: 6 },
  ],
}

/** @type {EquipSet} */
const FighterArcherEquipSet = {
  name: 'Fighter / Archer',
  items: [
    { name: 'Basic accessories', quantity: 1 },
    { name: 'Ring', quantity: 1 },
    { name: 'Spear', quantity: 1 },
    { name: 'Sword, Long', quantity: 1 },
    { name: 'Bow, Short', quantity: 1 },
    { name: 'Arrows (20)', quantity: 1 },
    { name: 'Backpack', quantity: 1 },
    { name: 'Bedroll', quantity: 1 },
    { name: 'Flask, leather', quantity: 1 },
    { name: 'Flint & steel', quantity: 1 },
    { name: 'Lantern, bullseye', quantity: 1 },
    { name: 'Waterskin', quantity: 1 },
    { name: 'Chalk, 1 piece', quantity: 1 },
    { name: 'Oil, lamp (1 pint)', quantity: 3 },
    { name: 'Rations, trail', quantity: 7 },
    { name: 'Rope, hemp (50 feet)', quantity: 1 },
    { name: 'Sack (15 pounds capacity)', quantity: 1 },
  ],
}

/** @type {EquipSet} */
const FighterHeavyEquipSet = {
  name: 'Fighter / Heavy',
  items: [
    { name: 'Basic accessories', quantity: 1 },
    { name: 'Chain', quantity: 1 },
    { name: 'Sling', quantity: 1 },
    { name: 'Sling Stones (20)', quantity: 1 },
    { name: 'Spear', quantity: 1 },
    { name: 'Sword, Long', quantity: 1 },
    { name: 'Dagger', quantity: 1 },
    { name: 'Bedroll', quantity: 1 },
    { name: 'Flint & steel', quantity: 1 },
    { name: 'Rations, trail', quantity: 7 },
    { name: 'Sack (15 pounds capacity)', quantity: 1 },
    { name: 'Torch', quantity: 5 },
    { name: 'Waterskin', quantity: 1 },
  ],
}

const MagicUserEquipSet = {
  name: 'Magic User',
  items: [
    { name: 'Basic accessories', quantity: 1 },
    { name: 'Dagger', quantity: 1 },
    { name: 'Staff', quantity: 1 },
    { name: 'Spellbook, blank', quantity: 1 },
    { name: 'Backpack', quantity: 1 },
    { name: 'Bedroll', quantity: 1 },
    { name: 'Candle', quantity: 5 },
    { name: 'Case (map or scroll)', quantity: 1 },
    { name: 'Flask, leather', quantity: 1 },
    { name: 'Flint & steel', quantity: 1 },
    { name: 'Ink (1-ounce bottle)', quantity: 1 },
    { name: 'Lantern, bullseye', quantity: 1 },
    { name: 'Mirror', quantity: 1 },
    { name: 'Oil, lamp (1 pint)', quantity: 1 },
    { name: 'Parchment (sheet)', quantity: 5 },
    { name: 'Rations, trail', quantity: 7 },
    { name: 'Waterskin', quantity: 1 },
  ],
}

const ThiefEquipSet = {
  name: 'Thief',
  items: [
    { name: 'Basic accessories', quantity: 1 },
    { name: 'Leather', quantity: 1 },
    { name: 'Arrows (20)', quantity: 1 },
    { name: 'Bow, Short', quantity: 1 },
    { name: 'Dagger', quantity: 1 },
    { name: 'Sword, Long', quantity: 1 },
    { name: 'Backpack', quantity: 1 },
    { name: 'Bedroll', quantity: 1 },
    { name: 'Block and tackle', quantity: 1 },
    { name: 'Crowbar', quantity: 1 },
    { name: 'Case (map or scroll)', quantity: 1 },
    { name: 'Chalk, 1 piece', quantity: 1 },
    { name: 'Fishing net (25 square feet)', quantity: 1 },
    { name: 'Flint & steel', quantity: 1 },
    { name: 'Grappling Hook', quantity: 1 },
    { name: 'Ink (1-ounce bottle)', quantity: 1 },
    { name: 'Ladder (10 foot)', quantity: 1 },
    { name: 'Lantern, bullseye', quantity: 1 },
    { name: 'Mirror', quantity: 1 },
    { name: 'Oil, lamp (1 pint)', quantity: 3 },
    { name: 'Parchment (sheet)', quantity: 1 },
    { name: 'Pole (10 foot)', quantity: 1 },
    { name: 'Waterskin', quantity: 1 },
    { name: 'Rations, trail', quantity: 5 },
    { name: 'Rope, hemp (50 feet)', quantity: 1 },
    { name: 'Sack (15 pounds capacity)', quantity: 1 },
  ],
}

export const EquipSets = {
  BaseAdventurerEquipSet,
  AssassinEquipSet,
  ClericEquipSet,
  FighterArcherEquipSet,
  FighterHeavyEquipSet,
  MagicUserEquipSet,
  ThiefEquipSet,
}
