import type { MonsterTrait } from '../consts'
import { MonsterTraitAttacks } from '../consts'

// Appends the attack of every trait to the damage formula, e.g. Poisonous + 'd6' = 'd6,d4[poison, save_or_die]';
// without the damage only the trait attacks are returned
export const addTraitAttacks = (traits: MonsterTrait[], damage: string = ''): string =>
  [damage, ...traits.map((trait) => MonsterTraitAttacks[trait])].filter(Boolean).join(',')
