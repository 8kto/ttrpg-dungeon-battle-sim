# Dungeon Battle Simulator

A browser-based tool for simulating turn-based combat between players and monsters. Compatible with the world’s
most popular role-playing game.

## Overview

Battle Simulator models engagements between two groups:

- Players & Henchmen (optional)
- Monsters

Each combatant can be defined by:

- Name
- Armor Class (ascending)
- Attack Bonus (to-hit)
- Hit Dice
- Damage: one or more attacks, e.g. `d6, d8+1`

Two modes of simulation are available:

- **Average**: uses expected values for hit points and damage
- **Random**: rolls dice for each attack and hit-point roll

## Features

- Deterministic (Average) or stochastic (Random) outcomes
- Configurable number of simulations
- Detailed logs for each battle and round
- Summary of win percentages and average survivors
- Export and Import from JSON to restore or share settings
