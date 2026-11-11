import { MonsterTrait, MonsterTraitAttacks } from '../../consts'
import { DamageParser } from '../../services/attacks/DamageParser'
import { addTraitAttacks } from '../addTraitAttacks'

describe('addTraitAttacks', () => {
  it('should keep the damage without traits', () => {
    expect(addTraitAttacks([], 'd6[claws],d6[horns]')).toBe('d6[claws],d6[horns]')
  })

  it('should append an attack per trait', () => {
    expect(addTraitAttacks([MonsterTrait.Poisonous, MonsterTrait.Fiery], 'd6')).toBe(
      'd6,d4[poison, save_or_die],d4[fire, damage_each_round(d4, 3)]',
    )
  })

  // eslint-disable-next-line no-undefined
  it.each([undefined, ''])('should return only the trait attacks without damage [%j]', (damage) => {
    expect(addTraitAttacks([MonsterTrait.Paralyzing], damage)).toBe('d4[paralyze, paralyze(d4)]')
  })

  it.each(Object.values(MonsterTrait))('should have a valid attack for trait [%s]', (trait) => {
    expect(() => new DamageParser().parseDamage(MonsterTraitAttacks[trait])).not.toThrow()
  })
})
