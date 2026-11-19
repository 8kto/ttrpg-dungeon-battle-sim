import { DamageParser } from '../DamageParser'
import type { AttackEffect } from '../types'
import { ModifierKind, SaveType } from '../types'

const parser = new DamageParser()

const sources = (input: string): string[][] => parser.parseDamage(input).map((option) => option.map((a) => a.source))

describe('DamageParser', () => {
  it('parses plain formulas', () => {
    expect(parser.parseDamage('d6+1, d4')).toEqual([
      [
        { damage: 'd6+1', effect: null, name: null, source: 'd6+1' },
        { damage: 'd4', effect: null, name: null, source: 'd4' },
      ],
    ])
  })

  it.each<[string, string[][]]>([
    ['d6,d6,d8', [['d6', 'd6', 'd8']]],
    ['d6,d6|d8', [['d6', 'd6'], ['d8']]],
    ['d6|d4|d8', [['d6'], ['d4'], ['d8']]],
    ['d6, d6 | d10-1', [['d6', 'd6'], ['d10-1']]],
    ['d4,d4|d10[breath,save_for_half(3d6)]', [['d4', 'd4'], ['d10[breath,save_for_half(3d6)]']]],
    ['d6<Sword>[poison, save_or_die] | d4<Fire Breath>', [['d6<Sword>[poison, save_or_die]'], ['d4<Fire Breath>']]],
    ['d6+d10, d4<a b>', [['d6+d10', 'd4<a b>']]],
  ])('parses options of "%s"', (input, expected) => {
    expect(sources(input)).toEqual(expected)
  })

  it.each<[string, AttackEffect | null]>([
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
      'd6[damage_each_round(d4)]',
      {
        label: 'damage_each_round(d4)',
        modifiers: [{ damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd6[paralyze(d4), damage_each_round(1)]',
      {
        label: 'paralyze(d4), damage_each_round(1)',
        modifiers: [
          { duration: 'd4', kind: ModifierKind.Paralyze },
          { damage: '1', duration: null, kind: ModifierKind.DamageEachRound },
        ],
        save: null,
        saveMod: 0,
      },
    ],
    // a lone "paralyze" is the modifier, a save would need modifiers
    [
      'd6[paralyze]',
      { label: 'paralyze', modifiers: [{ duration: null, kind: ModifierKind.Paralyze }], save: null, saveMod: 0 },
    ],
    [
      'd6[paralyze(3)]',
      { label: 'paralyze(3)', modifiers: [{ duration: '3', kind: ModifierKind.Paralyze }], save: null, saveMod: 0 },
    ],
    [
      'd6[paralyze, d4]',
      {
        label: 'paralyze',
        modifiers: [{ damage: 'd4', kind: ModifierKind.ExtraDamage }],
        save: SaveType.Paralyze,
        saveMod: 0,
      },
    ],
    [
      'd6<🧊 Ice>[damage_each_round(d4)]',
      {
        label: '🧊 Ice',
        modifiers: [{ damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd4<Fire Breath>[breath, save_for_half(d6)]',
      {
        label: 'Fire Breath',
        modifiers: [{ damage: 'd6', kind: ModifierKind.SaveForHalf }],
        save: SaveType.Breath,
        saveMod: 0,
      },
    ],
    ['d6<Sword>', null],
  ])('parses effect of "%s"', (input, expected) => {
    expect(parser.parseAttack(input).effect).toEqual(expected)
  })

  it.each<[string, string | null, string]>([
    ['d4<dagger>', 'dagger', 'd4'],
    ['d6<Sword>[damage_each_round(d4,3)]', 'Sword', 'd6'],
    ['d6 < Long Sword > [poison, save_or_die]', 'Long Sword', 'd6'],
    ['2d6+d4<poison>[poison, d4]', 'poison', '2d6+d4'],
    ['d6[poison, save_or_die]', null, 'd6'],
  ])('parses the name of "%s"', (input, name, damage) => {
    const attack = parser.parseAttack(input)

    expect(attack.name).toBe(name)
    expect(attack.damage).toBe(damage)
  })

  it('ignores case and whitespace', () => {
    const strip = (input: string): unknown =>
      parser.parseDamage(input).map((option) => option.map(({ damage, effect, name }) => ({ damage, effect, name })))

    expect(strip('D6 <Bite> [ Poison ( -2 ) , SAVE_OR_DIE ] | D8')).toEqual(
      strip('d6<Bite>[poison(-2),save_or_die]|d8'),
    )
    expect(parser.parseAttack(' D6 [ Poison , Damage_Each_Round( D4 , 3 ) ] ')).toMatchObject({
      damage: 'd6',
      effect: { modifiers: [{ damage: 'd4', duration: '3', kind: ModifierKind.DamageEachRound }] },
    })
  })

  it.each<[string, RegExp]>([
    ['d6[', /unbalanced/],
    ['d6]', /unbalanced/],
    ['d6[]', /empty brackets/],
    ['d6<>', /empty name/],
    ['d6< >[poison, save_or_die]', /empty name/],
    ['d6<', /unbalanced/],
    ['d6>', /unbalanced/],
    ['d6<a<b>>', /expected a formula with an optional name and effect/],
    ['d6[poison, save_or_die]<Bite>', /expected a formula with an optional name and effect/],
    ['d6<a>x', /expected a formula/],
    ['d6[poison, save_or_die]x', /expected a formula/],
    ['d6<a>[poison, save_or_die]<b>', /expected a formula/],
    ['d6<a,b>', /name "a,b" can't contain/],
    ['d6<a[b]>', /name "a\[b\]" can't contain/],
    ['d6<a|b>', /"\|" inside brackets/],
    [`d6<${'x'.repeat(31)}>`, /is longer than 30 characters/],
    ['d6[poison,]', /empty modifier/],
    ['[poison, save_or_die]', /missing damage formula/],
    ['<Sword>', /missing damage formula/],
    ['d6||d8', /empty option/],
    ['|d8', /empty option/],
    ['d6|', /empty option/],
    ['d6,,d8', /empty attack/],
    ['', /empty/],
    ['d6[poison|magic]', /"\|" inside brackets/],
    ['d6[poison(2), d4]', /save bonus needs a sign/],
    ['d6[poison+2, d4]', /invalid save tag "poison\+2"/],
    ['d6[poison(d4)]', /invalid save tag/],
    ['d6[poison 2,d4]', /invalid save tag "poison 2"/],
    ['d6[poisonous, d4]', /unknown modifier "poisonous"/],
    ['d6[poison]', /save without modifiers/],
    ['d6[magic(+2)]', /save without modifiers/],
    ['d6[paralyze(+2)]', /save without modifiers/],
    ['d6[paralyze,paralize]', /unknown modifier "paralize"/],
    ['d6[knife]', /unknown modifier "knife"; a name goes in angle brackets: d6<knife>/],
    ['d6[fire, damage_each_round(d4)]', /unknown modifier "fire"; a name goes in angle brackets/],
    ['d6[d4]', /extra damage d4 requires a save; without a save add it to the formula, e.g. d6\+d4/],
    ['d6<Shock>[damage_each_round(1), d4]', /extra damage d4 requires a save/],
    ['d6[poison,save_for_half]', /save_for_half requires a damage formula/],
    ['d6[save_or_die]', /save_or_die requires a save/],
    ['d6<Fire>[save_for_half(d6)]', /save_for_half requires a save/],
    ['d6[poison,paralyze(d4,2)]', /paralyze takes at most one argument/],
    ['d6[poison,damage_each_round(d4,2,1)]', /at most two arguments/],
    ['d6[poison,save_or_die(d4)]', /save_or_die takes no arguments/],
    ['d6[poison, save_or_die, poison]', /unknown modifier "poison"/],
  ])('rejects malformed damage "%s"', (input, error) => {
    expect(() => parser.parseDamage(input)).toThrow(error)
  })

  it('lists formulas for validation', () => {
    expect(parser.getFormulasOf(parser.parseAttack('d6[poison,damage_each_round(d4,3),save_for_half(2d6)]'))).toEqual([
      'd6',
      'd4',
      '3',
      '2d6',
    ])
  })

  describe('getMaxDamage', () => {
    it.each<[string, number]>([
      ['d6', 6],
      ['d6+1', 7],
      ['2d6-1', 11],
      ['5', 5],
      ['2d4 + 1', 9],
    ])('"%s" → %d', (formula, expected) => {
      expect(parser.getMaxDamage(formula)).toBe(expected)
    })

    it.each(['', 'd', 'hello', 'd6+', 'd6*2'])('throws on "%s"', (formula) => {
      expect(() => parser.getMaxDamage(formula)).toThrow(`Invalid damage formula: "${formula}"`)
    })
  })

  describe('checkName', () => {
    it.each(['Sword', 'Fire Breath', 'poison', 'poison ivy', '🧊', '🧙🏽‍♂️', 'claws!', 'x'.repeat(30), '🧊'.repeat(30)])(
      'accepts "%s"',
      (name) => {
        expect(parser.checkName(name)).toBeNull()
      },
    )

    it.each<[string, RegExp]>([
      ['', /empty name/],
      ['a,b', /can't contain/],
      ['a|b', /can't contain/],
      ['a<b', /can't contain/],
      ['a>b', /can't contain/],
      ['a[b', /can't contain/],
      ['a]b', /can't contain/],
      ['x'.repeat(31), /longer than 30 characters/],
    ])('rejects "%s"', (name, error) => {
      expect(parser.checkName(name)).toMatch(error)
    })
  })
})
