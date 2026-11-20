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
    'd6+d10-1',
    'd6<claws>',
    'd4[poison(-2), save_or_die]',
    'd8[paralyze, paralyzed(d4)]',
    'd6[breath(+1), save_for_half(2d6)]',
    'd4<Fire Breath>[breath, save_for_half(d6)]',
    'd4<Fire>[damage_each_round(d4, 3)]',
    'd4[magic, damage_each_round(1), d6]',
    'd6<🧊>[paralyzed(2)] | d4, d4',
    'd6[paralyzed]',
    'd6[paralyzed, damage_each_round(d4)]',
  ])('writes "%s" back as it was parsed', (damage) => {
    expect(serializer.serializeDamage(parser.parseDamage(damage))).toBe(damage)
  })

  it('normalizes spacing and case', () => {
    expect(serializer.serializeDamage(parser.parseDamage('D6 < Bite > [Poison( - 2 ),save_or_die]|d4,d4'))).toBe(
      'd6<Bite>[poison(-2), save_or_die] | d4, d4',
    )
  })

  // the paralysis modifier first must not read as the paralyze save
  it('writes paralysis without a save so that it parses back', () => {
    const damage = serializer.serializeAttack({
      damage: 'd6',
      effect: {
        modifiers: [
          { duration: null, kind: ModifierKind.Paralyzed },
          { damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound },
        ],
        save: null,
        saveMod: 0,
      },
      name: null,
    })

    expect(parser.parseAttack(damage).effect).toMatchObject({
      modifiers: [{ kind: ModifierKind.Paralyzed }, { kind: ModifierKind.DamageEachRound }],
      save: null,
    })
  })

  it('omits a zero save bonus', () => {
    expect(
      serializer.serializeAttack({
        damage: 'd6',
        effect: {
          modifiers: [{ kind: ModifierKind.SaveOrDie }],
          save: SaveType.Poison,
          saveMod: 0,
        },
        name: null,
      }),
    ).toBe('d6[poison, save_or_die]')
  })
})
