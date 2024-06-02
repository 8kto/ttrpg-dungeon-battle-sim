/**
 * @typedef {Object} EquipItem
 * @property {string} name - The name of the armor.
 * @property {number} weightCoins - The weight of the armor in coins.
 * @property {number} weightLbs - The weight of the armor in pounds.
 * @property {number} cost - The cost in golden pieces
 */

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
  { cost: 5, name: 'Backpack', weightLbs: 2 },
  { cost: 2, name: 'Barrel', weightLbs: 25 },
  { cost: 1, name: 'Bedroll', weightLbs: 3 },
  { cost: 1, name: 'Bell', weightLbs: 1 },
  { cost: 5, name: 'Block and tackle', weightLbs: 5 },
  { cost: 2, name: 'Bottle or Flagon', weightLbs: 6 },
  { cost: 0.01, name: 'Candle', weightLbs: 0.5 },
  { cost: 0.1, name: 'Canvas (per square yard)', weightLbs: 0.5 },
  { cost: 1, name: 'Case (map or scroll)', weightLbs: 1 },
  { cost: 30, name: 'Chain (10 feet)', weightLbs: 20 },
  { cost: 0.05, name: 'Chalk, 1 piece', weightLbs: 0.1 },
  { cost: 2, name: 'Chest', weightLbs: 25 },
  { cost: 4, name: 'Fishing net (25 square feet)', weightLbs: 5 },
  { cost: 0.03, name: 'Flask, Empty', weightLbs: 0.5 },
  { cost: 0.1, name: 'Flask, Full', weightLbs: 2 },
  { cost: 10, name: 'Garlic, charmed', weightLbs: 0.1 },
  { cost: 1, name: 'Grappling Hook', weightLbs: 10 },
  { cost: 0.5, name: 'Hammer', weightLbs: 3 },
  { cost: 1, name: 'Holy symbol, wooden', weightLbs: 0.2 },
  { cost: 25, name: 'Holy symbol, silver', weightLbs: 0.5 },
  { cost: 25, name: 'Holy water (flask)', weightLbs: 1 },
  { cost: 1, name: 'Ink (1-ounce bottle)', weightLbs: 0.1 },
  { cost: 0.05, name: 'Ladder (10 foot)', weightLbs: 20 },
  { cost: 0.1, name: 'Lamp, bronze', weightLbs: 2 },
  { cost: 12, name: 'Lantern, bullseye', weightLbs: 5 },
  { cost: 7, name: 'Lantern, hooded', weightLbs: 5 },
  { cost: 20, name: 'Lock', weightLbs: 1 },
  { cost: 15, name: 'Manacles', weightLbs: 2 },
  { cost: 20, name: 'Mirror', weightLbs: 0.5 },
  { cost: 5, name: 'Musical instrument', weightLbs: 3 },
  { cost: 0.1, name: 'Oil, lamp (1 pint)', weightLbs: 1 },
  { cost: 0.2, name: 'Parchment (sheet)', weightLbs: 0.5 },
  { cost: 0.2, name: 'Pole (10 foot)', weightLbs: 10 },
  { cost: 0.5, name: 'Pot, iron', weightLbs: 5 },
  { cost: 1, name: 'Rations, Iron', weightLbs: 1 },
  { cost: 0.5, name: 'Rations, Standard', weightLbs: 1 },
  { cost: 1, name: 'Rod', weightLbs: 6 },
  { cost: 1, name: 'Rope, hemp (50 feet)', weightLbs: 10 },
  { cost: 10, name: 'Rope, silk (50 feet)', weightLbs: 5 },
  { cost: 0.1, name: 'Sack, Large', weightLbs: 2 },
  { cost: 0.05, name: 'Sack, Small', weightLbs: 0.5 },
  { cost: 1, name: 'Scroll Case', weightLbs: 1 },
  { cost: 2, name: 'Shovel', weightLbs: 5 },
  { cost: 0.5, name: 'Signal whistle', weightLbs: 0.1 },
  { cost: 0.05, name: 'Spike, iron', weightLbs: 2 },
  { cost: 25, name: 'Spellbook, blank', weightLbs: 5 },
  { cost: 10, name: 'Tent', weightLbs: 20 },
  { cost: 0.25, name: 'Tinderbox (Flint & Steel)', weightLbs: 0.2 },
  { cost: 0.01, name: 'Torch', weightLbs: 2.5 },
  { cost: 0.2, name: 'Waterskin, Empty', weightLbs: 0.5 },
  { cost: 0.5, name: 'Waterskin, Full', weightLbs: 5 },
  { cost: 0.1, name: 'Wolfsbane', weightLbs: 0.5 },
]

/**
 * @typedef {Array<EquipItem>} WeaponList
 */

/** @type {WeaponList} */
export const Weapons = [
  { cost: 2, name: 'Arrows (20)', weightLbs: 1 },
  { cost: 0.1, name: 'Arrow or Quarrel', weightLbs: 0.5 },
  { cost: 5, name: 'Axe, Battle', weightLbs: 15 },
  { cost: 1, name: 'Axe, Hand', weightLbs: 5 },
  { cost: 60, name: 'Bow, Long', weightLbs: 5 },
  { cost: 15, name: 'Bow, Short', weightLbs: 5 },
  { cost: 0, name: 'Club', weightLbs: 10 },
  { cost: 20, name: 'Crossbow, Heavy', weightLbs: 5 },
  { cost: 12, name: 'Crossbow, Light', weightLbs: 5 },
  { cost: 2, name: 'Dagger', weightLbs: 2 },
  { cost: 0.5, name: 'Javelin', weightLbs: 5 },
  { cost: 10, name: 'Mace', weightLbs: 10 },
  { cost: 0, name: 'Sling Stone', weightLbs: 0.4 },
  { cost: 0, name: 'Sling Stones (20)', weightLbs: 5 },
  { cost: 1, name: 'Spear', weightLbs: 10 },
  { cost: 0, name: 'Staff', weightLbs: 10 },
  { cost: 20, name: 'Sword, Bastard', weightLbs: 10 },
  { cost: 8, name: 'Sword, Short', weightLbs: 5 },
  { cost: 15, name: 'Sword, Long', weightLbs: 10 },
  { cost: 30, name: 'Sword, Two-Handed', weightLbs: 15 },
  { cost: 1, name: 'Hammer, war', weightLbs: 10 },
]

/** @type {Array<EquipItem>} */
export const AllEquipment = [...Armor, ...Weapons, ...Equipment]
