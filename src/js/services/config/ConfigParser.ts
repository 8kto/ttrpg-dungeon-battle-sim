import type { Saves } from '../attacks/types'
import { DEFAULT_SAVES, SaveType } from '../attacks/types'
import type { ICharacter } from '../types'
import { Initiative, Rounding, Strategy, Targeting } from '../types'
import type { IConfigParser, ImportedConfig, ParseResult } from './IConfigParser'

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

// names of a numeric enum, as the selects use them: "Average", "Random", ...
const enumNames = (e: object): string[] => Object.keys(e).filter((key) => Number.isNaN(Number(key)))

export class ConfigParser implements IConfigParser {
  private static readonly NUMBER_SETTINGS: readonly string[] = [
    'battleCount',
    'biasPlayers',
    'biasMonsters',
    'maxAttacks',
  ]
  private static readonly ENUM_SETTINGS: Readonly<Record<string, string[]>> = {
    initiative: enumNames(Initiative),
    rounding: enumNames(Rounding),
    strategy: enumNames(Strategy),
    targeting: enumNames(Targeting),
  }

  parse(json: string): ParseResult {
    let data: unknown
    try {
      data = JSON.parse(json)
    } catch (err) {
      return { errors: [`invalid JSON: ${(err as Error).message}`], ok: false }
    }
    if (!isObject(data)) {
      return { errors: ['config must be an object'], ok: false }
    }

    const errors = [
      ...this.checkSettings(data),
      ...this.checkCharacters(data.players, 'Players'),
      ...this.checkCharacters(data.monsters, 'Monsters'),
    ]
    if (errors.length > 0) {
      return { errors, ok: false }
    }

    return { config: this.normalize(data as ImportedConfig), ok: true }
  }

  // settings are optional, but must have the right type when present
  private checkSettings(data: JsonObject): string[] {
    const errors: string[] = []

    ConfigParser.NUMBER_SETTINGS.filter((key) => key in data && !isNumber(data[key])).forEach((key) =>
      errors.push(`"${key}" must be a number`),
    )
    Object.entries(ConfigParser.ENUM_SETTINGS)
      .filter(([key, names]) => key in data && !names.includes(data[key] as string))
      .forEach(([key, names]) => errors.push(`"${key}" must be one of: ${names.join(', ')}`))

    return errors
  }

  private checkCharacters(chars: unknown, sideName: string): string[] {
    if (!Array.isArray(chars)) {
      return [`"${sideName.toLowerCase()}" must be a list of characters`]
    }

    return chars.flatMap((char, i) => this.checkCharacter(char).map((error) => `${sideName} #${i + 1}: ${error}`))
  }

  private checkCharacter(char: unknown): string[] {
    if (!isObject(char)) {
      return ['must be an object']
    }

    const errors: string[] = []
    ;(['name', 'damage'] as const)
      .filter((key) => typeof char[key] !== 'string')
      .forEach((key) => errors.push(`"${key}" must be a string`))
    ;(['armorClass', 'toHit'] as const)
      .filter((key) => !isNumber(char[key]))
      .forEach((key) => errors.push(`"${key}" must be a number`))

    const { hitDice, saves } = char
    if (!Array.isArray(hitDice) || hitDice.length !== 2 || !hitDice.every(isNumber)) {
      errors.push('"hitDice" must be [count, die], e.g. [2, 8]')
    }
    // configs exported before the saves were added have none: the defaults are used
    if ('saves' in char && !this.isSaves(saves)) {
      errors.push(`"saves" must have a number for each of: ${Object.values(SaveType).join(', ')}`)
    }

    return errors
  }

  private isSaves(saves: unknown): saves is Saves {
    return isObject(saves) && Object.values(SaveType).every((save) => isNumber(saves[save]))
  }

  private normalize(config: ImportedConfig): ImportedConfig {
    const withSaves = (char: ICharacter): ICharacter => ({ ...char, saves: char.saves ?? { ...DEFAULT_SAVES } })

    return { ...config, monsters: config.monsters.map(withSaves), players: config.players.map(withSaves) }
  }
}
