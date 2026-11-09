import { Dice } from 'ttrpg-lib-dice'

import { AverageStrategy } from '../strategies/AverageStrategy'
import type { ICharacter } from '../types'
import { validateCharacters } from '../validateCharacters'

describe('validateCharacters', () => {
  const strategy = new AverageStrategy()
  const validChar: ICharacter = {
    armorClass: 13,
    damage: ['d6', '2d4+1'],
    hitDice: [2, Dice.d8],
    name: 'Goblin',
    toHit: 1,
  }

  it('returns no errors for valid characters', () => {
    expect(validateCharacters([validChar], strategy, 'Monsters')).toEqual([])
  })

  it('reports an empty side', () => {
    expect(validateCharacters([], strategy, 'Monsters')).toEqual(['Monsters: no characters'])
  })

  it.each<[Partial<ICharacter>, string]>([
    [{ armorClass: NaN }, 'invalid AC'],
    [{ toHit: NaN }, 'invalid To-Hit'],
    [{ hitDice: [0, Dice.d8] }, 'invalid Hit Dice'],
    [{ hitDice: [NaN, Dice.d8] }, 'invalid Hit Dice'],
    [{ damage: [] }, 'no damage formula'],
    [{ damage: ['d6', 'abc'] }, 'invalid damage formula "abc"'],
  ])('reports %j', (override, error) => {
    expect(validateCharacters([{ ...validChar, ...override }], strategy, 'Monsters')).toEqual([
      `Monsters #1 (Goblin): ${error}`,
    ])
  })
})
