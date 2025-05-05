# Dungeon Battle Simulator

A browser-based tool for simulating turn-based combat between players and monsters. Compatible with the world’s
most popular role-playing game.

## Overview

Battle Simulator models engagements between two groups:

- **Players & Henchmen**
- **Monsters**

Each combatant can be defined by:

- **Name** (Player, Henchman, or Monster)
- **Armor Class (AC)**
- **Attack Bonus (to-hit)**
- **Hit Dice** (count and die type)
- **Damage Formulas** (one or more, e.g. `d6,d8+1`)

Two modes of simulation are available:

- **Average**: uses expected values for hit points and damage
- **Random**: rolls dice for each attack and hit-point roll

You can run any number of battles in sequence, observe a progress bar, and view detailed per-battle logs or high-level statistics.

## Features

- **Roster Management**

  - Add, duplicate, or remove entries for Players, Henchmen, and Monsters
  - Default settings for each role, editable in-place

- **Simulation Modes**

  - Deterministic (Average) or stochastic (Random) outcomes
  - Configurable number of simulations

- **Progress Feedback**

  - Interactive progress bar
  - Cursor changes to indicate active simulation

- **Logging and Statistics**

  - Detailed logs for each battle and round
  - Summary of win percentages and average survivors

- **Configuration Export/Import**

  - Export current setup as JSON
  - Import from JSON to restore or share settings
