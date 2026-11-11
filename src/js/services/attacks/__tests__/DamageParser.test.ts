import { getFormulasOf, parseAttack, parseDamage } from '../parseDamage'
import type { AttackEffect } from '../types'
import { ModifierKind, SaveType } from '../types'

const sources = (input: string): string[][] => parseDamage(input).map((option) => option.map((a) => a.source))

describe('parseDamage', () => {
  it('parses plain formulas', () => {
    expect(parseDamage('d6+1, d4')).toEqual([
      [
        { damage: 'd6+1', effect: null, source: 'd6+1' },
        { damage: 'd4', effect: null, source: 'd4' },
      ],
    ])
  })

  it.each<[string, string[][]]>([
    ['d6,d6,d8', [['d6', 'd6', 'd8']]],
    ['d6,d6|d8', [['d6', 'd6'], ['d8']]],
    ['d6|d4|d8', [['d6'], ['d4'], ['d8']]],
    ['d6, d6 | d10-1', [['d6', 'd6'], ['d10-1']]],
    ['d4,d4|d10[breath,save_for_half(3d6)]', [['d4', 'd4'], ['d10[breath,save_for_half(3d6)]']]],
  ])('parses options of "%s"', (input, expected) => {
    expect(sources(input)).toEqual(expected)
  })

  it.each<[string, AttackEffect]>([
    [
      'd6[paralyze,paralyze(d4)]',
      {
        label: 'paralyze',
        modifiers: [{ duration: 'd4', kind: ModifierKind.Paralyze }],
        save: SaveType.Paralyze,
        saveMod: 0,
      },
    ],
    [
      'd6[paralyze(+2),paralyze(d4)]',
      {
        label: 'paralyze',
        modifiers: [{ duration: 'd4', kind: ModifierKind.Paralyze }],
        save: SaveType.Paralyze,
        saveMod: 2,
      },
    ],
    [
      'd6[poison(-2), save_or_die]',
      { label: 'poison', modifiers: [{ kind: ModifierKind.SaveOrDie }], save: SaveType.Poison, saveMod: -2 },
    ],
    [
      'd6[magic,save_or_die]',
      { label: 'magic', modifiers: [{ kind: ModifierKind.SaveOrDie }], save: SaveType.Magic, saveMod: 0 },
    ],
    [
      'd6[magic,d8]',
      {
        label: 'magic',
        modifiers: [{ damage: 'd8', kind: ModifierKind.ExtraDamage }],
        save: SaveType.Magic,
        saveMod: 0,
      },
    ],
    [
      'd6[breath,save_for_half(d8)]',
      {
        label: 'breath',
        modifiers: [{ damage: 'd8', kind: ModifierKind.SaveForHalf }],
        save: SaveType.Breath,
        saveMod: 0,
      },
    ],
    [
      'd6[poison,damage_each_round(d4)]',
      {
        label: 'poison',
        modifiers: [{ damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }],
        save: SaveType.Poison,
        saveMod: 0,
      },
    ],
    [
      'd6[poison,damage_each_round(d4,3)]',
      {
        label: 'poison',
        modifiers: [{ damage: 'd4', duration: '3', kind: ModifierKind.DamageEachRound }],
        save: SaveType.Poison,
        saveMod: 0,
      },
    ],
    [
      'd6[🧊,damage_each_round(d4)]',
      {
        label: '🧊',
        modifiers: [{ damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd6[🧊+2,d4]',
      { label: '🧊+2', modifiers: [{ damage: 'd4', kind: ModifierKind.ExtraDamage }], save: null, saveMod: 0 },
    ],
    [
      'd6[poisonous,d4]',
      { label: 'poisonous', modifiers: [{ damage: 'd4', kind: ModifierKind.ExtraDamage }], save: null, saveMod: 0 },
    ],
    ['d6[knife]', { label: 'knife', modifiers: [], save: null, saveMod: 0 }],
  ])('parses effect of "%s"', (input, expected) => {
    expect(parseAttack(input).effect).toEqual(expected)
  })

  it('parses label-only options', () => {
    const [[knife], [dagger]] = parseDamage('d6[knife]|d4[dagger]')

    expect(knife.damage).toBe('d6')
    expect(knife.effect?.label).toBe('knife')
    expect(dagger.damage).toBe('d4')
    expect(dagger.effect?.label).toBe('dagger')
  })

  it('ignores case and whitespace', () => {
    const strip = (input: string): unknown =>
      parseDamage(input).map((option) => option.map(({ damage, effect }) => ({ damage, effect })))

    expect(strip('D6 [ Poison ( -2 ) , SAVE_OR_DIE ] | D8')).toEqual(strip('d6[poison(-2),save_or_die]|d8'))
    expect(parseAttack(' D6 [ Poison , Damage_Each_Round( D4 , 3 ) ] ')).toMatchObject({
      damage: 'd6',
      effect: { modifiers: [{ damage: 'd4', duration: '3', kind: ModifierKind.DamageEachRound }] },
    })
  })

  it.each<[string, RegExp]>([
    ['d6[', /unbalanced/],
    ['d6]', /unbalanced/],
    ['d6[]', /missing tag/],
    ['d6[poison,]', /empty modifier/],
    ['[poison]', /missing damage formula/],
    ['d6||d8', /empty option/],
    ['|d8', /empty option/],
    ['d6|', /empty option/],
    ['d6,,d8', /empty attack/],
    ['', /empty/],
    ['d6[poison|magic]', /"\|" inside brackets/],
    ['d6[poison(2)]', /save bonus needs a sign/],
    ['d6[poison+2]', /invalid save tag "poison\+2"/],
    ['d6[poison(d4)]', /invalid save tag/],
    ['d6[poison 2,d4]', /invalid save tag/],
    ['d6[poison]', /save tag without modifiers/],
    ['d6[paralyze,paralize]', /unknown modifier "paralize"/],
    ['d6[poison,save_for_half]', /save_for_half requires a damage formula/],
    ['d6[🧊,save_or_die]', /save_or_die requires a save tag/],
    ['d6[🧊,save_for_half(d6)]', /save_for_half requires a save tag/],
    ['d6[poison,paralyze(d4,2)]', /paralyze takes at most one argument/],
    ['d6[poison,damage_each_round(d4,2,1)]', /at most two arguments/],
    ['d6[poison,save_or_die(d4)]', /save_or_die takes no arguments/],
  ])('rejects malformed damage "%s"', (input, error) => {
    expect(() => parseDamage(input)).toThrow(error)
  })

  it('lists formulas for validation', () => {
    expect(getFormulasOf(parseAttack('d6[poison,damage_each_round(d4,3),save_for_half(2d6)]'))).toEqual([
      'd6',
      'd4',
      '3',
      '2d6',
    ])
  })
})
