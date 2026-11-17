import type { Saves } from '../attacks/types'
import { DEFAULT_SAVES, SaveType } from '../attacks/types'
import { messages } from '../messages/MessageService'
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
      return { errors: [messages.t('config.errors.invalidJson', { error: (err as Error).message })], ok: false }
    }
    if (!isObject(data)) {
      return { errors: [messages.t('config.errors.rootNotObject')], ok: false }
    }

    const errors = [
      ...this.checkSettings(data),
      ...this.checkCharacters(data, 'players', messages.t('sides.players')),
      ...this.checkCharacters(data, 'monsters', messages.t('sides.monsters')),
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
      errors.push(messages.t('config.errors.notNumber', { key })),
    )
    Object.entries(ConfigParser.ENUM_SETTINGS)
      .filter(([key, names]) => key in data && !names.includes(data[key] as string))
      .forEach(([key, names]) => errors.push(messages.t('config.errors.enum', { key, values: names.join(', ') })))

    return errors
  }

  private checkCharacters(data: JsonObject, key: 'players' | 'monsters', sideName: string): string[] {
    const chars = data[key]
    if (!Array.isArray(chars)) {
      return [messages.t('config.errors.notCharacterList', { key })]
    }

    return chars.flatMap((char, i) =>
      this.checkCharacter(char).map((error) =>
        messages.t('validation.character.error', { character: `${sideName} #${i + 1}`, error }),
      ),
    )
  }

  private checkCharacter(char: unknown): string[] {
    if (!isObject(char)) {
      return [messages.t('config.errors.notObject')]
    }

    const errors: string[] = []
    ;(['name', 'damage'] as const)
      .filter((key) => typeof char[key] !== 'string')
      .forEach((key) => errors.push(messages.t('config.errors.notString', { key })))
    ;(['armorClass', 'toHit'] as const)
      .filter((key) => !isNumber(char[key]))
      .forEach((key) => errors.push(messages.t('config.errors.notNumber', { key })))

    const { hitDice, saves } = char
    if (!Array.isArray(hitDice) || hitDice.length !== 2 || !hitDice.every(isNumber)) {
      errors.push(messages.t('config.errors.hitDice'))
    }
    // configs exported before the saves were added have none: the defaults are used
    if ('saves' in char && !this.isSaves(saves)) {
      errors.push(messages.t('config.errors.saves', { saves: Object.values(SaveType).join(', ') }))
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
