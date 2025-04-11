/* eslint-disable sort-keys-fix/sort-keys-fix */

import type { ArmorClass } from '../../domain/snw/Character'
import type { PrimeAttribute } from '../../domain/snw/CharacterClass'
import type { SavingThrow } from '../../domain/snw/SavingThrow'

export const Formatter: Record<string | 'default', CallableFunction> = {
  'character.classDef.SavingThrow': (val: SavingThrow): string => val.snw.value.toString(),

  'character.armorClass': (val: ArmorClass): string => `${val.dac}[${val.aac}]`,

  'character.classDef.PrimeAttr': (val: PrimeAttribute[]): string =>
    val.map(([k]) => k.toUpperCase().slice(0, 3)).join(', '),

  'character.experiencePointsBonus': (val: number): string => `${val}%`,

  'character.classDef.name': (name: string): string => {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
  },

  default: (val: unknown): string => {
    if (Array.isArray(val)) {
      return val.join(',')
    } else if (typeof val === 'object') {
      val = JSON.stringify(val)
    }

    return val?.toString() ?? 'NA'
  },
}
