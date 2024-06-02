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
  {"name": "Quarrel", "weightCoins": 0, "weightLbs": 0, "cost": 0.2}, // estimated weight in pounds: 0.1
  {"name": "Backpack", "weightCoins": 20, "weightLbs": 2, "cost": 5},
  {"name": "Barrel", "weightCoins": 0, "weightLbs": 0, "cost": 2}, // estimated weight in pounds: 25
  {"name": "Bedroll", "weightCoins": 30, "weightLbs": 3, "cost": 1},
  {"name": "Bell", "weightCoins": 0, "weightLbs": 0, "cost": 1}, // estimated weight in pounds: 1
  {"name": "Block and tackle", "weightCoins": 0, "weightLbs": 0, "cost": 5}, // estimated weight in pounds: 5
  {"name": "Bottle or Flagon", "weightCoins": 60, "weightLbs": 6, "cost": 2},
  {"name": "Candle", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.01},
  {"name": "Canvas (per square yard)", "weightCoins": 0, "weightLbs": 0, "cost": 0.1}, // estimated weight in pounds: 0.5
  {"name": "Case (map or scroll)", "weightCoins": 10, "weightLbs": 1, "cost": 1},
  {"name": "Chain (10 feet)", "weightCoins": 0, "weightLbs": 0, "cost": 30}, // estimated weight in pounds: 10
  {"name": "Chalk, 1 piece", "weightCoins": 0, "weightLbs": 0, "cost": 0.05}, // estimated weight in pounds: 0.1
  {"name": "Chest", "weightCoins": 0, "weightLbs": 0, "cost": 2}, // estimated weight in pounds: 25
  {"name": "Fishing net (25 square feet)", "weightCoins": 0, "weightLbs": 0, "cost": 4}, // estimated weight in pounds: 5
  {"name": "Flask, Empty", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.03},
  {"name": "Flask, Full", "weightCoins": 20, "weightLbs": 2, "cost": 0.1},
  {"name": "Grappling Hook", "weightCoins": 100, "weightLbs": 10, "cost": 1},
  {"name": "Hand Tool", "weightCoins": 10, "weightLbs": 1, "cost": 0.5},
  {"name": "Lantern, bullseye", "weightCoins": 50, "weightLbs": 5, "cost": 12},
  {"name": "Lantern, hooded", "weightCoins": 50, "weightLbs": 5, "cost": 7},
  {"name": "Lock", "weightCoins": 0, "weightLbs": 0, "cost": 20}, // estimated weight in pounds: 1
  {"name": "Mirror", "weightCoins": 5, "weightLbs": 0.5, "cost": 5},
  {"name": "Oil, lamp (1 pint)", "weightCoins": 10, "weightLbs": 1, "cost": 0.1},
  {"name": "Potion", "weightCoins": 25, "weightLbs": 2.5, "cost": 50},
  {"name": "Rations, Iron", "weightCoins": 75, "weightLbs": 7.5, "cost": 1},
  {"name": "Rations, Standard", "weightCoins": 200, "weightLbs": 20, "cost": 0.5},
  {"name": "Rod", "weightCoins": 60, "weightLbs": 6, "cost": 1},
  {"name": "Rope, hemp (50 feet)", "weightCoins": 100, "weightLbs": 10, "cost": 1},
  {"name": "Rope, silk (50 feet)", "weightCoins": 50, "weightLbs": 5, "cost": 10},
  {"name": "Sack, Large", "weightCoins": 20, "weightLbs": 2, "cost": 0.1},
  {"name": "Sack, Small", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.05},
  {"name": "Scroll Case", "weightCoins": 10, "weightLbs": 1, "cost": 1},
  {"name": "Shovel", "weightCoins": 50, "weightLbs": 5, "cost": 2},
  {"name": "Spike, iron", "weightCoins": 20, "weightLbs": 2, "cost": 0.05},
  {"name": "Tinderbox (Flint & Steel)", "weightCoins": 2, "weightLbs": 0.2, "cost": 0.25},
  {"name": "Torch", "weightCoins": 25, "weightLbs": 2.5, "cost": 0.01},
  {"name": "Waterskin, Empty", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.2},
  {"name": "Waterskin, Full", "weightCoins": 50, "weightLbs": 5, "cost": 0.5},
  {"name": "Wolfsbane", "weightCoins": 0, "weightLbs": 0, "cost": 0.1} // estimated weight in pounds: 0.1
];


/**
 * @typedef {Array<EquipItem>} WeaponList
 */

/** @type {WeaponList} */
export const Weapons = [
  {"name": "Arrow or Quarrel", "weightCoins": 2, "weightLbs": 0.2, "cost": 0},
  {"name": "Axe, Battle", "weightCoins": 75, "weightLbs": 7.5, "cost": 0},
  {"name": "Axe, Hand", "weightCoins": 50, "weightLbs": 5, "cost": 0},
  {"name": "Bow, Long", "weightCoins": 100, "weightLbs": 10, "cost": 0},
  {"name": "Bow, Short", "weightCoins": 50, "weightLbs": 5, "cost": 0},
  {"name": "Club", "weightCoins": 30, "weightLbs": 3, "cost": 0},
  {"name": "Crossbow, Heavy", "weightCoins": 80, "weightLbs": 8, "cost": 0},
  {"name": "Crossbow, Light", "weightCoins": 50, "weightLbs": 5, "cost": 0},
  {"name": "Dagger", "weightCoins": 10, "weightLbs": 1, "cost": 0},
  {"name": "Javelin", "weightCoins": 20, "weightLbs": 2, "cost": 0},
  {"name": "Mace", "weightCoins": 75, "weightLbs": 7.5, "cost": 0},
  {"name": "Sling Stone", "weightCoins": 2, "weightLbs": 0.2, "cost": 0},
  {"name": "Spear", "weightCoins": 40, "weightLbs": 4, "cost": 0},
  {"name": "Staff", "weightCoins": 50, "weightLbs": 5, "cost": 0},
  {"name": "Sword, Bastard", "weightCoins": 100, "weightLbs": 10, "cost": 0},
  {"name": "Sword, Short", "weightCoins": 30, "weightLbs": 3, "cost": 0},
  {"name": "Sword, Long", "weightCoins": 60, "weightLbs": 6, "cost": 0},
  {"name": "Sword, Two-Handed", "weightCoins": 250, "weightLbs": 25, "cost": 0},
  {"name": "Warhammer", "weightCoins": 60, "weightLbs": 6, "cost": 0}
];

/** @type {Array<EquipItem>} */
export const AllEquipment = [
  ...Armor,
  ...Weapons,
  ...Equipment,
]
