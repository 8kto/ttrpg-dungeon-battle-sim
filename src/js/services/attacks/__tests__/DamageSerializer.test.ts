import { DamageParser } from '../DamageParser'
import { DamageSerializer } from '../DamageSerializer'
import { ModifierKind, SaveType } from '../types'

describe('DamageSerializer', () => {
  const parser = new DamageParser()
  const serializer = new DamageSerializer()

  it.each([
    'd6',
    '2d6+1',
    'd6, d4 | d10',
    'd6[claws]',
    'd4[poison(-2), save_or_die]',
    'd8[paralyze, paralyze(d4)]',
    'd6[breath(+1), save_for_half(2d6)]',
    'd4[fire, damage_each_round(d4, 3), d6]',
    'd4[magic, damage_each_round(1)]',
    'd6[🧊, paralyze(2)] | d4, d4',
  ])('writes "%s" back as it was parsed', (damage) => {
    expect(serializer.serializeDamage(parser.parseDamage(damage))).toBe(damage)
  })

  it('normalizes spacing and case', () => {
    expect(serializer.serializeDamage(parser.parseDamage('D6[Poison( - 2 ),save_or_die]|d4,d4'))).toBe(
      'd6[poison(-2), save_or_die] | d4, d4',
    )
  })

  it('omits a zero save bonus', () => {
    expect(
      serializer.serializeAttack({
        damage: 'd6',
        effect: {
          label: 'poison',
          modifiers: [{ kind: ModifierKind.SaveOrDie }],
          save: SaveType.Poison,
          saveMod: 0,
        },
      }),
    ).toBe('d6[poison, save_or_die]')
  })
})
