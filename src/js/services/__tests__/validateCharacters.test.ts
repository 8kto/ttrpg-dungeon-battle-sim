import { Dice } from 'ttrpg-lib-dice'

import { DEFAULT_SAVES } from '../attacks/types'
import { AverageStrategy } from '../strategies/AverageStrategy'
import type { ICharacter } from '../types'
import { validateCharacters } from '../validateCharacters'

describe('validateCharacters', () => {
  const strategy = new AverageStrategy()
  const validChar: ICharacter = {
    armorClass: 13,
    damage: 'd6, 2d4+1',
    hitDice: [2, Dice.d8],
    name: 'Goblin',
    saves: DEFAULT_SAVES,
    toHit: 1,
  }

  it('returns no errors for valid characters', () => {
    expect(validateCharacters([validChar], strategy, 'Monsters')).toEqual([])
  })

  it('accepts options and effects', () => {
    expect(
      validateCharacters([{ ...validChar, damage: 'd6, d6 | d10[poison(-2),save_or_die]' }], strategy, 'Monsters'),
    ).toEqual([])
  })

  it.each([-1, 21, 1.5, NaN])('reports invalid save value %d', (poison) => {
    expect(validateCharacters([{ ...validChar, saves: { ...DEFAULT_SAVES, poison } }], strategy, 'Monsters')).toEqual([
      'Monsters #1 (Goblin): invalid Poison save',
    ])
  })

  it.each([0, 20])('accepts save value %d', (poison) => {
    expect(validateCharacters([{ ...validChar, saves: { ...DEFAULT_SAVES, poison } }], strategy, 'Monsters')).toEqual(
      [],
    )
  })

  it('reports an empty side', () => {
    expect(validateCharacters([], strategy, 'Monsters')).toEqual(['Monsters: no characters'])
  })

  it.each<[Partial<ICharacter>, string]>([
    [{ armorClass: NaN }, 'invalid AC'],
    [{ toHit: NaN }, 'invalid To-Hit'],
    [{ hitDice: [0, Dice.d8] }, 'invalid Hit Dice'],
    [{ hitDice: [NaN, Dice.d8] }, 'invalid Hit Dice'],
    [{ damage: '' }, 'no damage formula'],
    [{ damage: 'd6, abc' }, 'invalid damage formula "abc"'],
    [{ damage: 'd6[paralyze,paralize]' }, 'unknown modifier "paralize" in "d6[paralyze,paralize]"'],
    [{ damage: 'd6||d8' }, 'empty option in "d6||d8"'],
    [{ damage: 'd6[poison,damage_each_round(abc)]' }, 'invalid damage formula "abc"'],
  ])('reports %j', (override, error) => {
    expect(validateCharacters([{ ...validChar, ...override }], strategy, 'Monsters')).toEqual([
      `Monsters #1 (Goblin): ${error}`,
    ])
  })
})
