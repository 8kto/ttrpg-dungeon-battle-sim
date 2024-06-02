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
  {"name": "Shield", "weightCoins": 100, "weightLbs": 10, cost: 15},
  {"name": "Leather", "weightCoins": 250, "weightLbs": 25, cost: 5},
  {"name": "Ring", "weightCoins": 400, "weightLbs": 40, cost: 30},
  {"name": "Chain", "weightCoins": 500, "weightLbs": 50, cost: 75},
  {"name": "Plate", "weightCoins": 700, "weightLbs": 70, cost: 100},
]


/**
 * @typedef {Array<EquipItem>} ItemList
 */

/** @type {ItemList} */
export const Equipment = [
  {"name": "Backpack", "weightCoins": 20, "weightLbs": 2, "cost": 5},
  {"name": "Barrel", "weightCoins": 0, "weightLbs": 25, "cost": 2}, // estimated weight in pounds: 25
  {"name": "Bedroll", "weightCoins": 30, "weightLbs": 3, "cost": 1},
  {"name": "Bell", "weightCoins": 0, "weightLbs": 1, "cost": 1}, // estimated weight in pounds: 1
  {"name": "Block and tackle", "weightCoins": 0, "weightLbs": 5, "cost": 5}, // estimated weight in pounds: 5
  {"name": "Bottle or Flagon", "weightCoins": 60, "weightLbs": 6, "cost": 2},
  {"name": "Candle", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.01},
  {"name": "Canvas (per square yard)", "weightCoins": 0, "weightLbs": 0.5, "cost": 0.1}, // estimated weight in pounds: 0.5
  {"name": "Case (map or scroll)", "weightCoins": 10, "weightLbs": 1, "cost": 1},
  {"name": "Chain (10 feet)", "weightCoins": 0, "weightLbs": 20, "cost": 30}, // estimated weight in pounds: 10
  {"name": "Chalk, 1 piece", "weightCoins": 0, "weightLbs": 0.1, "cost": 0.05}, // estimated weight in pounds: 0.1
  {"name": "Chest", "weightCoins": 0, "weightLbs": 25, "cost": 2}, // estimated weight in pounds: 25
  {"name": "Fishing net (25 square feet)", "weightCoins": 0, "weightLbs": 5, "cost": 4}, // estimated weight in pounds: 5
  {"name": "Flask, Empty", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.03},
  {"name": "Flask, Full", "weightCoins": 20, "weightLbs": 2, "cost": 0.1},
  {"name": "Garlic, charmed", "weightCoins": 0, "weightLbs": 0.1, "cost": 10}, // estimated weight in pounds: 0.1
  {"name": "Grappling Hook", "weightCoins": 100, "weightLbs": 10, "cost": 1},
  {"name": "Hammer", "weightCoins": 0, "weightLbs": 3, "cost": 0.5}, // estimated weight in pounds: 3
  {"name": "Holy symbol, wooden", "weightCoins": 0, "weightLbs": 0.2, "cost": 1}, // estimated weight in pounds: 0.2
  {"name": "Holy symbol, silver", "weightCoins": 0, "weightLbs": 0.5, "cost": 25}, // estimated weight in pounds: 0.5
  {"name": "Holy water (flask)", "weightCoins": 0, "weightLbs": 1, "cost": 25}, // estimated weight in pounds: 1
  {"name": "Ink (1-ounce bottle)", "weightCoins": 0, "weightLbs": 0.1, "cost": 1}, // estimated weight in pounds: 0.1
  {"name": "Ladder (10 foot)", "weightCoins": 0, "weightLbs": 20, "cost": 0.05}, // estimated weight in pounds: 20
  {"name": "Lamp, bronze", "weightCoins": 0, "weightLbs": 2, "cost": 0.1}, // estimated weight in pounds: 2
  {"name": "Lantern, bullseye", "weightCoins": 50, "weightLbs": 5, "cost": 12},
  {"name": "Lantern, hooded", "weightCoins": 50, "weightLbs": 5, "cost": 7},
  {"name": "Lock", "weightCoins": 0, "weightLbs": 1, "cost": 20}, // estimated weight in pounds: 1
  {"name": "Manacles", "weightCoins": 0, "weightLbs": 2, "cost": 15}, // estimated weight in pounds: 2
  {"name": "Mirror", "weightCoins": 5, "weightLbs": 0.5, "cost": 20},
  {"name": "Musical instrument", "weightCoins": 0, "weightLbs": 3, "cost": 5}, // estimated weight in pounds: 3
  {"name": "Oil, lamp (1 pint)", "weightCoins": 10, "weightLbs": 1, "cost": 0.1},
  {"name": "Parchment (sheet)", "weightCoins": 0, "weightLbs": 0.5, "cost": 0.2}, // estimated weight in pounds: 0.05
  {"name": "Pole (10 foot)", "weightCoins": 0, "weightLbs": 10, "cost": 0.2}, // estimated weight in pounds: 7
  {"name": "Pot, iron", "weightCoins": 0, "weightLbs": 5, "cost": 0.5}, // estimated weight in pounds: 5
  {"name": "Rations, Iron", "weightCoins": 75, "weightLbs": 1, "cost": 1},
  {"name": "Rations, Standard", "weightCoins": 200, "weightLbs": 1, "cost": 0.5},
  {"name": "Rod", "weightCoins": 60, "weightLbs": 6, "cost": 1},
  {"name": "Rope, hemp (50 feet)", "weightCoins": 100, "weightLbs": 10, "cost": 1},
  {"name": "Rope, silk (50 feet)", "weightCoins": 50, "weightLbs": 5, "cost": 10},
  {"name": "Sack, Large", "weightCoins": 20, "weightLbs": 2, "cost": 0.1},
  {"name": "Sack, Small", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.05},
  {"name": "Scroll Case", "weightCoins": 10, "weightLbs": 1, "cost": 1},
  {"name": "Shovel", "weightCoins": 50, "weightLbs": 5, "cost": 2},
  {"name": "Signal whistle", "weightCoins": 0, "weightLbs": 0.1, "cost": 0.5}, // estimated weight in pounds: 0.1
  {"name": "Spike, iron", "weightCoins": 20, "weightLbs": 2, "cost": 0.05},
  {"name": "Spellbook, blank", "weightCoins": 0, "weightLbs": 5, "cost": 25}, // estimated weight in pounds: 3
  {"name": "Tent", "weightCoins": 0, "weightLbs": 20, "cost": 10}, // estimated weight in pounds: 20
  {"name": "Tinderbox (Flint & Steel)", "weightCoins": 2, "weightLbs": 0.2, "cost": 0.25},
  {"name": "Torch", "weightCoins": 25, "weightLbs": 2.5, "cost": 0.01},
  {"name": "Waterskin, Empty", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.2},
  {"name": "Waterskin, Full", "weightCoins": 50, "weightLbs": 5, "cost": 0.5},
  {"name": "Wolfsbane", "weightCoins": 0, "weightLbs": 0.5, "cost": 0.1} // estimated weight in pounds: 0.1
];


/**
 * @typedef {Array<EquipItem>} WeaponList
 */

/** @type {WeaponList} */
export const Weapons = [
  {"name": "Arrows (20)", "weightCoins": 10, "weightLbs": 1, "cost": 2},
  {"name": "Arrow or Quarrel", "weightCoins": 5, "weightLbs": 0.5, "cost": 0.1},
  {"name": "Axe, Battle", "weightCoins": 150, "weightLbs": 15, "cost": 5},
  {"name": "Axe, Hand", "weightCoins": 50, "weightLbs": 5, "cost": 1},
  {"name": "Bow, Long", "weightCoins": 50, "weightLbs": 5, "cost": 60},
  {"name": "Bow, Short", "weightCoins": 50, "weightLbs": 5, "cost": 15},
  {"name": "Club", "weightCoins": 100, "weightLbs": 10, "cost": 0},
  {"name": "Crossbow, Heavy", "weightCoins": 50, "weightLbs": 5, "cost": 20},
  {"name": "Crossbow, Light", "weightCoins": 50, "weightLbs": 5, "cost": 12},
  {"name": "Dagger", "weightCoins": 20, "weightLbs": 2, "cost": 2},
  {"name": "Javelin", "weightCoins": 50, "weightLbs": 5, "cost": 0.5},
  {"name": "Mace", "weightCoins": 100, "weightLbs": 10, "cost": 10},
  {"name": "Sling Stone", "weightCoins": 4, "weightLbs": 0.4, "cost": 0},
  {"name": "Sling Stones (20)", "weightCoins": 50, "weightLbs": 5, "cost": 0},
  {"name": "Spear", "weightCoins": 100, "weightLbs": 10, "cost": 1},
  {"name": "Staff", "weightCoins": 0, "weightLbs": 10, "cost": 0},
  {"name": "Sword, Bastard", "weightCoins": 100, "weightLbs": 10, "cost": 20},
  {"name": "Sword, Short", "weightCoins": 50, "weightLbs": 5, "cost": 8},
  {"name": "Sword, Long", "weightCoins": 100, "weightLbs": 10, "cost": 15},
  {"name": "Sword, Two-Handed", "weightCoins": 150, "weightLbs": 15, "cost": 30},
  {"name": "Hammer, war", "weightCoins": 100, "weightLbs": 10, "cost": 1}
];

/** @type {Array<EquipItem>} */
export const AllEquipment = [
  ...Armor,
  ...Weapons,
  ...Equipment,
]
