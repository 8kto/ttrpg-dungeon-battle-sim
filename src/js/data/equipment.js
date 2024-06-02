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
  {"name": "Plate Mail", "weightCoins": 700, "weightLbs": 70, cost: 0},
  {"name": "Chain Mail", "weightCoins": 500, "weightLbs": 50, cost: 0},
  {"name": "Ring Mail", "weightCoins": 400, "weightLbs": 40, cost: 0},
  {"name": "Leather Armor", "weightCoins": 250, "weightLbs": 25, cost: 0},
  {"name": "Clothes", "weightCoins": 30, "weightLbs": 3, cost: 0},
  {"name": "Robe or Cloak", "weightCoins": 25, "weightLbs": 2.5, cost: 0},
  {"name": "Large Shield", "weightCoins": 100, "weightLbs": 10, cost: 0},
  {"name": "Small Shield", "weightCoins": 50, "weightLbs": 5, cost: 0},
  {"name": "Helm", "weightCoins": 45, "weightLbs": 4.5, cost: 0},
  {"name": "Boots, Hard", "weightCoins": 60, "weightLbs": 6, cost: 0},
  {"name": "Boots, Soft", "weightCoins": 30, "weightLbs": 3, cost: 0}
]


/**
 * @typedef {Array<EquipItem>} ItemList
 */

/** @type {ItemList} */
export const Equipment = [
  {"name": "Backpack", "weightCoins": 20, "weightLbs": 2, cost: 0},
  {"name": "Bedroll", "weightCoins": 30, "weightLbs": 3, cost: 0},
  {"name": "Bottle or Flagon", "weightCoins": 60, "weightLbs": 6, cost: 0},
  {"name": "Candle", "weightCoins": 5, "weightLbs": 0.5, cost: 0},
  {"name": "Flask, Empty", "weightCoins": 5, "weightLbs": 0.5, cost: 0},
  {"name": "Flask, Full", "weightCoins": 20, "weightLbs": 2, cost: 0},
  {"name": "Grappling Hook", "weightCoins": 100, "weightLbs": 10, cost: 0},
  {"name": "Hand Tool", "weightCoins": 10, "weightLbs": 1, cost: 0},
  {"name": "Lantern", "weightCoins": 60, "weightLbs": 6, cost: 0},
  {"name": "Mirror", "weightCoins": 5, "weightLbs": 0.5, cost: 0},
  {"name": "Potion", "weightCoins": 25, "weightLbs": 2.5, cost: 0},
  {"name": "Rations, Iron", "weightCoins": 75, "weightLbs": 7.5, cost: 0},
  {"name": "Rations, Standard", "weightCoins": 200, "weightLbs": 20, cost: 0},
  {"name": "Rod", "weightCoins": 60, "weightLbs": 6, cost: 0},
  {"name": "Rope, 50 feet", "weightCoins": 75, "weightLbs": 7.5, cost: 0},
  {"name": "Sack, Large", "weightCoins": 20, "weightLbs": 2, cost: 0},
  {"name": "Sack, Small", "weightCoins": 5, "weightLbs": 0.5, cost: 0},
  {"name": "Scroll Case", "weightCoins": 10, "weightLbs": 1, cost: 0},
  {"name": "Spike or Piton", "weightCoins": 10, "weightLbs": 1, cost: 0},
  {"name": "Tinderbox (Flint & Steel)", "weightCoins": 2, "weightLbs": 0.2, cost: 0},
  {"name": "Torch", "weightCoins": 25, "weightLbs": 2.5, cost: 0},
  {"name": "Waterskin, Empty", "weightCoins": 5, "weightLbs": 0.5, cost: 0},
  {"name": "Waterskin, Full", "weightCoins": 50, "weightLbs": 5, cost: 0}
]

/** @type {Array<EquipItem>} */
export const AllEquipment = [
  ...Armor,
  ...Equipment
]