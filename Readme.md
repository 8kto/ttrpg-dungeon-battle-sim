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
- Damage: formulas like `d6`, `2d4`, `d6+1`. Separate multiple attacks with commas.

Simulation strategies are:

- **Average**: uses average values for hit points and damage
- **Random**: rolls dice for each attack and hit-point roll
- **Max**: uses max values for hit points and damage (e.g., `6` for `d6` and `5` for `d4+1`)

## Features

- Simulation can be configured with Stratege, Battles number, Biases for skipping turns for both sides, Maximum attacks allowed per figure.
- Detailed logs for each battle and round
- Summary of win percentages and average survivors
- Export and Import from JSON to restore or share settings
