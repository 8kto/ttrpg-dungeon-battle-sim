## Character and inventory generator for Swords & Wizardry (Complete/Revised)

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

Contributions are welcome!

## Disclaimer I

This is an unofficial tool for "Swords and Wizardry" and is not endorsed by the game's publishers.
All related trademarks belong to their respective owners.

## Disclaimer II

This is a quick and dirty code; I spent only a little time making it "clean". You can read the sources at your own risk.

To see a better approach I took on a similar project, check out my other TTRPG helper and [generator for the Lamentation of the Flame Princess](https://github.com/8kto/ttrpg-lotfp-helpers) system.

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
- [x] Exports inventories as JSON, which can be manually added to the browser's storage (dev tools). I didn’t have time yet to write a more convenient import feature.
- [x] Custom items
- [x] Builds with WMR

## Contributions

Contributions are welcome. Code should follow conventions described in [CodeConventions](./CodeConventions.md).

### TODO

- [ ] Mobiles support (?)
- [ ] Languages support (?)
- [ ] Add coins
- [ ] More convenient Import
- [ ] New random character: adjust heuristics (drop hopeless, pick random properly)
- [ ] Race
- [ ] Char To Hit
- [ ] Char: edit numbers
- [ ] Saving Throw / num + details
- [ ] Generate with strict 0e attrs
- [ ] Fighter Parrying Ability
- [ ] daisyUI, dark/light themes
