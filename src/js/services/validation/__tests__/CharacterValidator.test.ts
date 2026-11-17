import { Dice } from 'ttrpg-lib-dice'

import { DEFAULT_SAVES } from '../../attacks/types'
import { AverageStrategy } from '../../strategies/AverageStrategy'
import type { ICharacter } from '../../types'
import { CharacterValidator, getCharacterValidator } from '../CharacterValidator'
import type { ICharacterRule } from '../ICharacterValidator'

describe('CharacterValidator', () => {
  const validator = getCharacterValidator(new AverageStrategy())
  const validChar: ICharacter = {
    armorClass: 13,
    damage: 'd6, 2d4+1',
    hitDice: [2, Dice.d8],
    name: 'Goblin',
    saves: DEFAULT_SAVES,
    toHit: 1,
  }

  it('returns no errors for valid characters', () => {
    expect(validator.validate([validChar], 'Monsters')).toEqual([])
  })

  it('accepts options and effects', () => {
    expect(validator.validate([{ ...validChar, damage: 'd6, d6 | d10[poison(-2),save_or_die]' }], 'Monsters')).toEqual(
      [],
    )
  })

  it.each([5, 21, 6.5, NaN])('reports invalid save value %d', (poison) => {
    expect(validator.validate([{ ...validChar, saves: { ...DEFAULT_SAVES, poison } }], 'Monsters')).toEqual([
      'Monsters #1 (Goblin): invalid Poison save (6..20)',
    ])
  })

  it.each([6, 20])('accepts save value %d', (poison) => {
    expect(validator.validate([{ ...validChar, saves: { ...DEFAULT_SAVES, poison } }], 'Monsters')).toEqual([])
  })

  it.each<Partial<ICharacter>>([
    { armorClass: 6, hitDice: [1, Dice.d8], toHit: -5 },
    { armorClass: 20, hitDice: [50, Dice.d8], toHit: 10 },
  ])('accepts boundary values %j', (override) => {
    expect(validator.validate([{ ...validChar, ...override }], 'Monsters')).toEqual([])
  })

  it('reports the count and the type of hit dice separately', () => {
    expect(validator.validate([{ ...validChar, hitDice: [0, 7 as Dice] }], 'Monsters')).toEqual([
      'Monsters #1 (Goblin): invalid Hit Dice (1..50)',
      'Monsters #1 (Goblin): invalid Hit Dice type (d4, d6, d8, d10, d12, d20, d100)',
    ])
  })

  it('reports an empty side', () => {
    expect(validator.validate([], 'Monsters')).toEqual(['Monsters: no characters'])
  })

  it.each<[Partial<ICharacter>, string]>([
    [{ armorClass: NaN }, 'invalid AC (6..20)'],
    [{ armorClass: 5 }, 'invalid AC (6..20)'],
    [{ armorClass: 21 }, 'invalid AC (6..20)'],
    [{ armorClass: 12.5 }, 'invalid AC (6..20)'],
    [{ toHit: NaN }, 'invalid To-Hit (-5..10)'],
    [{ toHit: -6 }, 'invalid To-Hit (-5..10)'],
    [{ toHit: 11 }, 'invalid To-Hit (-5..10)'],
    [{ hitDice: [0, Dice.d8] }, 'invalid Hit Dice (1..50)'],
    [{ hitDice: [51, Dice.d8] }, 'invalid Hit Dice (1..50)'],
    [{ hitDice: [NaN, Dice.d8] }, 'invalid Hit Dice (1..50)'],
    [{ hitDice: [2.5, Dice.d8] }, 'invalid Hit Dice (1..50)'],
    [{ hitDice: [2, 7 as Dice] }, 'invalid Hit Dice type (d4, d6, d8, d10, d12, d20, d100)'],
    [{ hitDice: [2, NaN as Dice] }, 'invalid Hit Dice type (d4, d6, d8, d10, d12, d20, d100)'],
    [{ toHit: 1.5 }, 'invalid To-Hit (-5..10)'],
    [{ damage: '' }, 'no damage formula'],
    [{ damage: 'd6, abc' }, 'invalid damage formula "abc"'],
    [{ damage: 'd6[paralyze,paralize]' }, 'unknown modifier "paralize" in "d6[paralyze,paralize]"'],
    [{ damage: 'd6||d8' }, 'empty option in "d6||d8"'],
    [{ damage: 'd6[poison,damage_each_round(abc)]' }, 'invalid damage formula "abc"'],
  ])('reports %j', (override, error) => {
    expect(validator.validate([{ ...validChar, ...override }], 'Monsters')).toEqual([`Monsters #1 (Goblin): ${error}`])
  })

  it('prefixes errors of every rule with the character label', () => {
    const rules: ICharacterRule[] = [{ check: () => ['first'] }, { check: () => [] }, { check: () => ['second'] }]

    expect(new CharacterValidator(rules).validate([validChar, { ...validChar, name: 'Orc' }], 'Players')).toEqual([
      'Players #1 (Goblin): first',
      'Players #1 (Goblin): second',
      'Players #2 (Orc): first',
      'Players #2 (Orc): second',
    ])
  })
})
