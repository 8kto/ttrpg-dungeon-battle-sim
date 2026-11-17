import { DEFAULT_SAVES } from '../../attacks/types'
import { ConfigParser } from '../ConfigParser'

describe('ConfigParser', () => {
  const parser = new ConfigParser()
  const char = { armorClass: 13, damage: 'd6', hitDice: [2, 8], name: 'Goblin', saves: DEFAULT_SAVES, toHit: 1 }
  const config = {
    battleCount: 100,
    biasMonsters: 0,
    biasPlayers: 5,
    initiative: 'Fixed',
    maxAttacks: 0,
    monsters: [char],
    players: [{ ...char, name: 'Hero' }],
    rounding: 'Up',
    strategy: 'Average',
    targeting: 'Focus',
  }
  const parse = (data: object): ReturnType<ConfigParser['parse']> => parser.parse(JSON.stringify(data))
  const errorsOf = (data: object): string[] => {
    const result = parse(data)

    return result.ok ? [] : result.errors
  }

  it('parses a valid config', () => {
    expect(parse(config)).toEqual({ config, ok: true })
  })

  it('accepts a config with characters only', () => {
    expect(parse({ monsters: [char], players: [char] })).toEqual({
      config: { monsters: [char], players: [char] },
      ok: true,
    })
  })

  it('adds default saves to characters without them', () => {
    const { saves, ...noSaves } = char
    const result = parse({ ...config, monsters: [noSaves] })

    expect(result.ok && result.config.monsters[0].saves).toEqual(saves)
  })

  it('reports missing characters', () => {
    expect(errorsOf({ battleCount: 1 })).toEqual([
      '"players" must be a list of characters',
      '"monsters" must be a list of characters',
    ])
  })

  it('reports invalid JSON', () => {
    const result = parser.parse('{ players: ')

    expect(result.ok).toBe(false)
    expect(!result.ok && result.errors[0]).toMatch(/^invalid JSON: /)
  })

  it.each(['[]', '42', 'null'])('reports a non-object config %s', (json) => {
    expect(parser.parse(json)).toEqual({ errors: ['config must be an object'], ok: false })
  })

  it.each<[object, string[]]>([
    [{ players: 'heroes' }, ['"players" must be a list of characters']],
    [{ monsters: {} }, ['"monsters" must be a list of characters']],
    [{ battleCount: '100' }, ['"battleCount" must be a number']],
    [{ maxAttacks: null }, ['"maxAttacks" must be a number']],
    [{ strategy: 'Best' }, ['"strategy" must be one of: Average, Random, Max']],
    [{ rounding: 0 }, ['"rounding" must be one of: Up, Down']],
    [{ targeting: 'focus' }, ['"targeting" must be one of: Random, Focus']],
    [{ initiative: 'Once' }, ['"initiative" must be one of: Random, Fixed']],
    [{ monsters: [42] }, ['Monsters #1: must be an object']],
  ])('reports %j', (override, errors) => {
    expect(errorsOf({ ...config, ...override })).toEqual(errors)
  })

  it.each<[object, string]>([
    [{ name: 1 }, '"name" must be a string'],
    [{ damage: null }, '"damage" must be a string'],
    [{ armorClass: '13' }, '"armorClass" must be a number'],
    [{ toHit: null }, '"toHit" must be a number'],
    [{ hitDice: 2 }, '"hitDice" must be [count, die], e.g. [2, 8]'],
    [{ hitDice: [2] }, '"hitDice" must be [count, die], e.g. [2, 8]'],
    [{ hitDice: [2, 'd8'] }, '"hitDice" must be [count, die], e.g. [2, 8]'],
    [{ saves: { poison: 12 } }, '"saves" must have a number for each of: paralyze, poison, breath, device, magic'],
  ])('reports invalid character field %j', (override, error) => {
    expect(errorsOf({ ...config, players: [char, { ...char, ...override }] })).toEqual([`Players #2: ${error}`])
  })

  it('reports all errors at once', () => {
    expect(errorsOf({ ...config, battleCount: 'x', monsters: [{ ...char, armorClass: 'x' }] })).toEqual([
      '"battleCount" must be a number',
      'Monsters #1: "armorClass" must be a number',
    ])
  })
})
