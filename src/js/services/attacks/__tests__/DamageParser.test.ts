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
    // brackets in a name don't count
    ['d6<Bow (long>, d4<Claw)> | d8', [['d6<Bow (long>', 'd4<Claw)>'], ['d8']]],
  ])('parses options of "%s"', (input, expected) => {
    expect(sources(input)).toEqual(expected)
  })

  it.each<[string, AttackEffect | null]>([
    [
      'd6[paralyze,paralyzed(d4)]',
      {
        areaTargets: null,
        id: 'Paralyze, paralyzed(d4)',
        label: 'Paralyze',
        modifiers: [{ duration: 'd4', kind: ModifierKind.Paralyzed }],
        save: SaveType.Paralyze,
        saveMod: 0,
      },
    ],
    [
      'd6[paralyze(+2),paralyzed(d4)]',
      {
        areaTargets: null,
        id: 'Paralyze(+2), paralyzed(d4)',
        label: 'Paralyze',
        modifiers: [{ duration: 'd4', kind: ModifierKind.Paralyzed }],
        save: SaveType.Paralyze,
        saveMod: 2,
      },
    ],
    [
      'd6[poison(-2), save_or_die]',
      {
        areaTargets: null,
        id: 'Poison(-2), save_or_die',
        label: 'Poison',
        modifiers: [{ kind: ModifierKind.SaveOrDie }],
        save: SaveType.Poison,
        saveMod: -2,
      },
    ],
    [
      'd6[magic,save_or_die]',
      {
        areaTargets: null,
        id: 'Magic, save_or_die',
        label: 'Magic',
        modifiers: [{ kind: ModifierKind.SaveOrDie }],
        save: SaveType.Magic,
        saveMod: 0,
      },
    ],
    [
      'd6[magic,d8]',
      {
        areaTargets: null,
        id: 'Magic, d8',
        label: 'Magic',
        modifiers: [{ damage: 'd8', kind: ModifierKind.ExtraDamage }],
        save: SaveType.Magic,
        saveMod: 0,
      },
    ],
    [
      'd6[breath,save_for_half(d8)]',
      {
        areaTargets: null,
        id: 'Breath, save_for_half(d8)',
        label: 'Breath',
        modifiers: [{ damage: 'd8', kind: ModifierKind.SaveForHalf }],
        save: SaveType.Breath,
        saveMod: 0,
      },
    ],
    [
      'd6[poison,damage_each_round(d4)]',
      {
        areaTargets: null,
        id: 'Poison, damage_each_round(d4)',
        label: 'Poison',
        modifiers: [{ damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }],
        save: SaveType.Poison,
        saveMod: 0,
      },
    ],
    [
      'd6[poison,damage_each_round(d4,3)]',
      {
        areaTargets: null,
        id: 'Poison, damage_each_round(d4, 3)',
        label: 'Poison',
        modifiers: [{ damage: 'd4', duration: '3', kind: ModifierKind.DamageEachRound }],
        save: SaveType.Poison,
        saveMod: 0,
      },
    ],
    [
      'd6[damage_each_round(d4)]',
      {
        areaTargets: null,
        id: 'damage_each_round(d4)',
        label: 'damage_each_round(d4)',
        modifiers: [{ damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd6[paralyzed(d4), damage_each_round(1)]',
      {
        areaTargets: null,
        id: 'paralyzed(d4), damage_each_round(1)',
        label: 'paralyzed(d4), damage_each_round(1)',
        modifiers: [
          { duration: 'd4', kind: ModifierKind.Paralyzed },
          { damage: '1', duration: null, kind: ModifierKind.DamageEachRound },
        ],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd6[paralyzed]',
      {
        areaTargets: null,
        id: 'paralyzed',
        label: 'paralyzed',
        modifiers: [{ duration: null, kind: ModifierKind.Paralyzed }],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd6[paralyzed(3)]',
      {
        areaTargets: null,
        id: 'paralyzed(3)',
        label: 'paralyzed(3)',
        modifiers: [{ duration: '3', kind: ModifierKind.Paralyzed }],
        save: null,
        saveMod: 0,
      },
    ],
    // "paralyze" is always the save, "paralyzed" the modifier
    [
      'd6[paralyzed, damage_each_round(d4)]',
      {
        areaTargets: null,
        id: 'paralyzed, damage_each_round(d4)',
        label: 'paralyzed, damage_each_round(d4)',
        modifiers: [
          { duration: null, kind: ModifierKind.Paralyzed },
          { damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound },
        ],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd6[paralyze, d4]',
      {
        areaTargets: null,
        id: 'Paralyze, d4',
        label: 'Paralyze',
        modifiers: [{ damage: 'd4', kind: ModifierKind.ExtraDamage }],
        save: SaveType.Paralyze,
        saveMod: 0,
      },
    ],
    [
      'd6<🧊 Ice>[damage_each_round(d4)]',
      {
        areaTargets: null,
        id: '🧊 Ice (damage_each_round(d4))',
        label: '🧊 Ice',
        modifiers: [{ damage: 'd4', duration: null, kind: ModifierKind.DamageEachRound }],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd4<Fire Breath>[breath, save_for_half(d6)]',
      {
        areaTargets: null,
        id: 'Fire Breath (Breath, save_for_half(d6))',
        label: 'Fire Breath',
        modifiers: [{ damage: 'd6', kind: ModifierKind.SaveForHalf }],
        save: SaveType.Breath,
        saveMod: 0,
      },
    ],
    [
      'd4<Gaze>[PARALYZE, petrified]',
      {
        areaTargets: null,
        id: 'Gaze (Paralyze, petrified)',
        label: 'Gaze',
        modifiers: [{ duration: null, kind: ModifierKind.Petrified }],
        save: SaveType.Paralyze,
        saveMod: 0,
      },
    ],
    [
      'd4[petrified(d4)]',
      {
        areaTargets: null,
        id: 'petrified(d4)',
        label: 'petrified(d4)',
        modifiers: [{ duration: 'd4', kind: ModifierKind.Petrified }],
        save: null,
        saveMod: 0,
      },
    ],
    [
      'd6[breath, targets]',
      {
        areaTargets: '3',
        id: 'Breath, targets',
        label: 'Breath',
        modifiers: [{ count: null, kind: ModifierKind.Targets }],
        save: SaveType.Breath,
        saveMod: 0,
      },
    ],
    [
      '0<Bomb>[Paralyze, save_for_half(d4), targets(4)]',
      {
        areaTargets: '4',
        id: 'Bomb (Paralyze, save_for_half(d4), targets(4))',
        label: 'Bomb',
        modifiers: [
          { damage: 'd4', kind: ModifierKind.SaveForHalf },
          { count: '4', kind: ModifierKind.Targets },
        ],
        save: SaveType.Paralyze,
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
    ['d6<Bow (long)>', 'Bow (long)', 'd6'],
    ['d6<Bow (long>[poison, save_or_die]', 'Bow (long', 'd6'],
    ['2d6+d4<poison>[poison, d4]', 'poison', '2d6+d4'],
    ['d6[poison, save_or_die]', null, 'd6'],
  ])('parses the name of "%s"', (input, name, damage) => {
    const attack = parser.parseAttack(input)

    expect(attack.name).toBe(name)
    expect(attack.damage).toBe(damage)
  })

  it('gives effects with the same name different ids', () => {
    const [[bite, otherBite]] = parser.parseDamage('d6<Bite>[poison, save_or_die], d4<Bite>[paralyzed(1)]')

    expect(bite.effect?.label).toBe(otherBite.effect?.label)
    expect(bite.effect?.id).toBe('Bite (Poison, save_or_die)')
    expect(otherBite.effect?.id).toBe('Bite (paralyzed(1))')
  })

  it('gives the same id to the same effect written differently', () => {
    expect(parser.parseAttack('d6[ Poison(-2),SAVE_OR_DIE ]').effect?.id).toBe(
      parser.parseAttack('d8[poison(-2), save_or_die]').effect?.id,
    )
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
    ['d6<a<b>', /name "a<b" can't contain/],
    ['d6<a<b>>', /unbalanced/],
    ['d6[poison, save_or_die]<Bite>', /expected a formula with an optional name and effect/],
    ['d6<a>x', /expected a formula/],
    ['d6[poison, save_or_die]x', /expected a formula/],
    ['d6<a>[poison, save_or_die]<b>', /expected a formula/],
    ['d6<a,b>', /name "a,b" can't contain/],
    ['d6<a[b]>', /name "a\[b\]" can't contain/],
    ['d6<a|b>', /name "a\|b" can't contain/],
    ['d6<a|b> | d4', /name "a\|b" can't contain/],
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
    ['d6[paralyze]', /save without modifiers: "paralyze" does nothing/],
    ['d6[paralyze,paralize]', /unknown modifier "paralize"/],
    ['d6[poison, paralyze]', /unknown modifier "paralyze"/],
    ['d6[paralyze, paralyze(d4)]', /unknown modifier "paralyze"/],
    ['d6[paralyze(d4)]', /invalid save tag "paralyze\(d4\)"/],
    ['d6[paralyzed, poison]', /unknown modifier "poison"/],
    ['d6[knife]', /unknown modifier "knife" in/],
    ['d6[🧊, damage_each_round(d4,3)]', /unknown modifier "🧊" in/],
    ['d6[poison ivy]', /unknown modifier "poison ivy" in/],
    ['d6[damage_each_round(d4), 🧊]', /unknown modifier "🧊" in/],
    ['d6[d4]', /extra damage d4 requires a save; without a save add it to the formula, e.g. d6\+d4/],
    ['d6<Shock>[damage_each_round(1), d4]', /extra damage d4 requires a save/],
    ['d6[poison,save_for_half]', /save_for_half requires a damage formula/],
    ['d6[save_or_die]', /save_or_die requires a save/],
    ['d6<Fire>[save_for_half(d6)]', /save_for_half requires a save/],
    ['d6[poison,paralyzed(d4,2)]', /paralyzed takes at most one argument/],
    ['d6[poison,damage_each_round(d4,2,1)]', /at most two arguments/],
    ['d6[poison,save_or_die(d4)]', /save_or_die takes no arguments/],
    ['d6[poison, save_or_die, poison]', /unknown modifier "poison"/],
    ['d6[poison, petrified(d4, 2)]', /petrified takes at most one argument/],
    ['d6[targets(2)]', /targets requires a save/],
    ['d6[targets, paralyzed]', /targets requires a save/],
    ['d6[breath, targets(2, 3)]', /targets takes at most one argument/],
    ['d6[breath, targets, targets(2)]', /targets can be used once/],
    ['d6[poison(2), d4]', /save bonus needs a sign: Poison\(\+2\)/],
  ])('rejects malformed damage "%s"', (input, error) => {
    expect(() => parser.parseDamage(input)).toThrow(error)
  })

  it.each<[string, boolean]>([
    ['2d6+1', true],
    ['0', true],
    ['0d6', false],
    ['d0', false],
    ['save_or_die', false],
  ])('tells whether "%s" is a formula', (text, expected) => {
    expect(parser.isFormula(text)).toBe(expected)
  })

  it('lists formulas of petrification and targets for validation', () => {
    expect(parser.getFormulasOf(parser.parseAttack('0[magic, petrified(d4), targets(d3)]'))).toEqual(['0', 'd4', 'd3'])
    expect(parser.getFormulasOf(parser.parseAttack('d6[magic, petrified, targets]'))).toEqual(['d6'])
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
