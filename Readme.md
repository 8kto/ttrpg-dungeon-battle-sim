## Character and inventory generator for Swords & Wizardry (Complete)

![linter and tests](https://github.com/8kto/ttrpg-snw-generator/actions/workflows/main.yml/badge.svg)

```
                           _                         _                  _
                          | |       ___             (_)                | |
 _____      _____  _ __ __| |___   ( _ )   __      ___ ______ _ _ __ __| |_ __ _   _
/ __\ \ /\ / / _ \| '__/ _` / __|  / _ \/\ \ \ /\ / / |_  / _` | '__/ _` | '__| | | |
\__ \\ V  V / (_) | | | (_| \__ \ | (_>  <  \ V  V /| |/ / (_| | | | (_| | |  | |_| |
|___/ \_/\_/ \___/|_|  \__,_|___/  \___/\/   \_/\_/ |_/___\__,_|_|  \__,_|_|   \__, |
                                                                                __/ |
                                                                               |___/
```

A tool built super quickly for my fellow OSR players.
I sourced the equipment lists, along with their weights and costs, from the rulebook and used the **BFRPG Equipment Emporium** to fill in any missing weights.

Check out my other TTRPG helper and [generator for the Lamentation of the Flame Princess](https://github.com/8kto/ttrpg-lotfp-helpers) system.

Contributions are welcome!

## Disclaimer

This is an unofficial tool for "Swords and Wizardry" and is not endorsed by the game's publishers.
All related trademarks belong to their respective owners.

## Demo

Current URL: https://swords-and-wizardry.ivlev.blog/

## Features

- [x] Random character generation (check TODO)
- [x] Spell lists for casters. Magic Users get their spells randomly according to their Intelligence score
- [x] Lists of equipment, weapons, and armor with weight and cost
- [x] Inventory management, calculating total weight, cost, and speed
- [x] Multiple inventories that can be renamed. For example: "Zsusza, the thief", "Zoltan, the mercenary", "Solomon, the donkey", etc.
- [x] Quick equipment sets that can be selected to save time when generating a new character
- [x] Saves inventory in the browser's local storage, meaning the selected items will persist after a page reload
- [x] Displays help on encumbrance and speed
- [x] Converts text (which can be copied from other sources) into equipment and adds it to the inventory
- [x] Exports and import characters and their inventories
- [x] Custom items
- [x] Builds with WMR
- [x] Mobiles support (limited, desktop is the prio)
- [x] Cool retro pixel UI (well, designers needed)

## Contributions

Contributions are welcome. Code should follow conventions described in [Code Conventions](./CodeConventions.md).

### TODO

- [ ] Languages support (?)
- [ ] Add coins
- [ ] New random character: adjust heuristics (drop hopeless, pick random properly)
- [ ] Race
  - [ ] Half elves cannot be pure Fighters or MU, only listed classes (and other races?)
- [ ] Char: edit numbers
- [ ] Generate with strict 0e attrs
- [ ] Fighter Parrying Ability
- [ ] lighter font/dark themes (?)
- [ ] Console log with events like "Intelligence: rolled 3d6 with 12 ..." (?)
- [ ] Reorder inventories
- [ ] Adjustment to Retainer (CHA)
