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
- Damage: formulas like `d6`, `2d4`, `d6+1` (see [Damage syntax](#damage-syntax))
- Saving throws: Paralyze 14, Poison 12, Breath 15, Device 13, Magic 16 by default (0–20); a save succeeds when
  `d20 + bonus >= value`

Simulation strategies are:

- **Average**: uses average values for hit points and damage
- **Random**: rolls dice for each attack and hit-point roll
- **Max**: uses max values for hit points and damage (e.g., `6` for `d6` and `5` for `d4+1`)

## Damage syntax

- `,` separates attacks made in one turn: `d6, d6, d8` attacks three times.
- `|` separates alternative options, one option is used per turn: `d6, d6 | d8` attacks twice with `d6` or once with
  `d8`. The Max strategy picks the option with the highest max damage, Random and Average pick one at random.
- Tags in brackets after a formula apply on hit: `d6[tag, modifier, ...]`.
  - A tag without modifiers just labels the attack in the log: `d6[knife] | d4[dagger]`.
  - A save name as the tag (`paralyze`, `poison`, `breath`, `device`, `magic`) makes the target roll that save once
    per attack; a bonus or penalty goes in parentheses with a sign: `poison(-2)`, `paralyze(+2)`. Any other tag
    (`fire`, `🧊`) has no save: modifiers always apply.
  - Modifiers (on a failed save or without a save):
    - `paralyze` / `paralyze(d4)` — the target skips its turns until the end of battle / for d4 turns; attacks
      against it hit automatically for max weapon damage, and it fails all saves
    - `save_or_die` — the target dies
    - `save_for_half(d8)` — d8 damage, half (rounded down) on a successful save
    - `d8` — extra d8 damage
    - `damage_each_round(d4)` / `damage_each_round(d4, 3)` — d4 damage at the start of each of the target's turns
      from the next round, until the end of battle / for 3 turns; identical effects don't stack
- Examples: `d6[poison, save_or_die]`, `d6[paralyze(+2), paralyze(d4)]`, `d6[breath, save_for_half(2d6)]`,
  `d4, d4 | d10[fire, damage_each_round(d4, 3)]`.

## Features

- Simulation can be configured with Stratege, Battles number, Biases for skipping turns for both sides, Maximum attacks allowed per figure.
- Detailed logs for each battle and round
- Summary of win percentages and average survivors
- Export and Import from JSON to restore or share settings
