import type { catalog } from './catalog'

export type Catalog = typeof catalog

// dot paths of all templates: 'battle.death' | 'stats.winRate' | ...
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]

// template at a dot path
type At<T, K extends string> = K extends `${infer H}.${infer R}`
  ? H extends keyof T
    ? At<T[H], R>
    : never
  : K extends keyof T
    ? T[K]
    : never

// '{name} takes {dmg}' -> 'name' | 'dmg'
type Placeholders<S> = S extends `${string}{${infer P}}${infer Rest}` ? P | Placeholders<Rest> : never

export type MessageKey = Leaves<Catalog>

export type MessageParams<K extends MessageKey> = Record<Placeholders<At<Catalog, K>>, string | number>

// params are required only when the template has placeholders
export type MessageArgs<K extends MessageKey> = [Placeholders<At<Catalog, K>>] extends [never]
  ? []
  : [params: MessageParams<K>]
