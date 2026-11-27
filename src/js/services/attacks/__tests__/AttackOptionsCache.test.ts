import { AttackOptionsCache } from '../AttackOptionsCache'
import { DamageParser } from '../DamageParser'
import type { IDamageParser } from '../IDamageParser'

describe('AttackOptionsCache', () => {
  it('parses the damage', () => {
    expect(new AttackOptionsCache().get('d6, d4 | d8')).toEqual(new DamageParser().parseDamage('d6, d4 | d8'))
  })

  it('parses every damage text once', () => {
    const parser = new DamageParser()
    const parseDamage = jest.spyOn(parser, 'parseDamage')
    const cache = new AttackOptionsCache(parser as IDamageParser)

    const first = cache.get('d6[Poison, save_or_die]')
    expect(cache.get('d6[Poison, save_or_die]')).toBe(first)
    cache.get('d8')

    expect(parseDamage).toHaveBeenCalledTimes(2)
  })

  it('freezes the options, shared by the battles', () => {
    const [[attack]] = new AttackOptionsCache().get('d6<Bite>[Poison, paralyzed(2)]')
    expect(Object.isFrozen(attack)).toBe(true)
    expect(Object.isFrozen(attack.effect?.modifiers[0])).toBe(true)
  })

  it('does not cache damage that does not parse', () => {
    const cache = new AttackOptionsCache()
    expect(() => cache.get('d6[')).toThrow()
    expect(() => cache.get('d6[')).toThrow()
  })
})
