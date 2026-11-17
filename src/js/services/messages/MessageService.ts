import { catalog } from './catalog'
import type { IMessageService } from './IMessageService'
import type { Catalog, MessageArgs, MessageKey } from './types'

type Params = Record<string, string | number>

const PLACEHOLDER_RE: RegExp = /\{(\w+)\}/g

// nested catalog -> { 'battle.death': '💀 {name} is dead', ... }
const flatten = (node: object, prefix: string = ''): Map<string, string> =>
  Object.entries(node).reduce((templates, [key, value]) => {
    const path = `${prefix}${key}`
    if (typeof value === 'string') {
      return templates.set(path, value)
    }
    flatten(value, `${path}.`).forEach((template, nested) => templates.set(nested, template))

    return templates
  }, new Map<string, string>())

// unknown placeholders are left as they are, so a missing param is visible in the output
export const interpolate = (template: string, params: Params = {}): string =>
  template.replace(PLACEHOLDER_RE, (placeholder, name: string) => {
    if (!(name in params)) {
      console.error(`Missing message param "${name}" in "${template}"`)

      return placeholder
    }

    return String(params[name])
  })

export class MessageService implements IMessageService {
  private readonly templates: ReadonlyMap<string, string>

  constructor(messages: Catalog = catalog) {
    this.templates = flatten(messages)
  }

  t<K extends MessageKey>(key: K, ...[params]: MessageArgs<K>): string {
    const template = this.templates.get(key)
    if (typeof template !== 'string') {
      throw new Error(`Unknown message key: ${key}`)
    }

    return interpolate(template, params)
  }
}

export const messages: MessageService = new MessageService()
