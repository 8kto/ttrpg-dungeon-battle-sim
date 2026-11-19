# Dungeon Battle Simulator

A browser-based tool for simulating turn-based combat between players and monsters. Compatible with the world’s
most popular role-playing game.

## Demo

https://dungeon-battle.ivlev.blog/

## Overview

Battle Simulator models engagements between two groups:

- Players & Henchmen (optional)
- Monsters

Each combatant can be defined by:

- Name
- Armor Class (ascending)
- Attack Bonus (to-hit)
- Hit Dice
- Damage: formulas like `d6`, `2d4`, `d6+1`, `d6+d4` (see [Damage syntax](#damage-syntax))
- Saving throws: Paralyze 14, Poison 12, Breath 15, Device 13, Magic 16 by default (0–20); a save succeeds when
  `d20 + bonus >= value`

Simulation strategies are:

- **Average**: uses average values for hit points and damage
- **Random**: rolls dice for each attack and hit-point roll
- **Max**: uses max values for hit points and damage (e.g., `6` for `d6` and `5` for `d4+1`)

## Damage syntax

- A damage formula is dice and numbers joined by `+` and `-`: `d6`, `2d4+1`, `d6+d10`, `d8-d4`, `5`.
- `,` separates attacks made in one turn: `d6, d6, d8` attacks three times.
- `|` separates alternative options, one option is used per turn: `d6, d6 | d8` attacks twice with `d6` or once with
  `d8`. The Max strategy picks the option with the highest max damage, Random and Average pick one at random.
- A name in angle brackets after the formula labels the attack in the log: `d6<Sword> | d4<Fire Breath>`. Names are
  optional, up to 30 characters, and can't contain `<`, `>`, `[`, `]`, `,` or `|`.
- An effect in square brackets after the formula and the name applies on hit: `d6<Bite>[save, modifier, ...]` or
  `d6[modifier, ...]`.
  - A save (`paralyze`, `poison`, `breath`, `device`, `magic`) goes first and makes the target roll that save once
    per attack; a bonus or penalty goes in parentheses with a sign: `poison(-2)`, `paralyze(+2)`. A save needs
    modifiers. Without a save, modifiers always apply.
  - Modifiers (on a failed save or without a save):
    - `paralyze` / `paralyze(d4)` — the target skips its turns until the end of battle / for d4 turns; attacks
      against it hit automatically for max weapon damage, and it fails all saves. A lone `d6[paralyze]` is this
      modifier without a save
    - `save_or_die` — the target dies; requires a save
    - `save_for_half(d8)` — d8 damage, half (rounded down) on a successful save; requires a save
    - `d8` — extra d8 damage; requires a save (without a save, add it to the formula: `d6+d8`)
    - `damage_each_round(d4)` / `damage_each_round(d4, 3)` — d4 damage at the start of each of the target's turns
      from the next round, until the end of battle / for 3 turns; identical effects don't stack
- The log and the summary name an effect by the attack name, else by the save, else by its modifiers.
- Examples: `d6<Sword>[poison, save_or_die]`, `d6[paralyze(+2), paralyze(d4)]`,
  `d4<Fire Breath>[breath, save_for_half(2d6)]`, `d4, d4 | d10<Fire>[damage_each_round(d4, 3)]`.

## Features

- Simulation can be configured with Stratege, Battles number, Biases for skipping turns for both sides, Maximum attacks allowed per figure.
- Detailed logs for each battle and round
- Summary of win percentages and average survivors
- Export and Import from JSON to restore or share settings
