import { MonsterTrait, MonsterTraitAttacks } from '../../consts'
import { DamageParser } from '../../services/attacks/DamageParser'
import { addTraitAttacks } from '../addTraitAttacks'

describe('addTraitAttacks', () => {
  it('should keep the damage without traits', () => {
    expect(addTraitAttacks([], 'd6<Claws>,d6<Horns>')).toBe('d6<Claws>,d6<Horns>')
  })

  it('should append an attack per trait', () => {
    expect(addTraitAttacks([MonsterTrait.Poisonous, MonsterTrait.Fiery], 'd6')).toBe(
      'd6,d4<Poisonous bite>[Poison, save_or_die],d4<Fire breath>[damage_each_round(d4, 3)]',
    )
  })

  // eslint-disable-next-line no-undefined
  it.each([undefined, ''])('should return only the trait attacks without damage [%j]', (damage) => {
    expect(addTraitAttacks([MonsterTrait.Paralyzing], damage)).toBe('d4<Paralyzing touch>[Paralyze, paralyzed(d4)]')
  })

  it.each(Object.values(MonsterTrait))('should have a valid attack for trait [%s]', (trait) => {
    expect(() => new DamageParser().parseDamage(MonsterTraitAttacks[trait])).not.toThrow()
  })
})
