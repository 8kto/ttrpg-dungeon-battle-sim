import { catalog } from '../catalog'
import { interpolate, messages } from '../MessageService'

// bypasses the key and params typing to test runtime behavior
const untyped = (key: string, params?: object): string =>
  (messages.t as (k: string, p?: object) => string).call(messages, key, params)

const flat = (node: object, prefix: string = ''): Record<string, string> =>
  Object.entries(node).reduce<Record<string, string>>(
    (acc, [key, value]) =>
      typeof value === 'string'
        ? { ...acc, [`${prefix}${key}`]: value }
        : { ...acc, ...flat(value, `${prefix}${key}.`) },
    {},
  )

describe('interpolate', () => {
  it('replaces placeholders with params', () => {
    expect(interpolate('{name} takes {dmg} damage', { dmg: 5, name: 'Orc' })).toBe('Orc takes 5 damage')
  })

  it('replaces every occurrence of a placeholder', () => {
    expect(interpolate('{save}(+N) or {save}(-N)', { save: 'death' })).toBe('death(+N) or death(-N)')
  })

  it('keeps zero and empty values', () => {
    expect(interpolate('[{a}|{b}]', { a: 0, b: '' })).toBe('[0|]')
  })

  it('returns a template without placeholders as is', () => {
    expect(interpolate('No battles completed')).toBe('No battles completed')
  })

  it('leaves a missing param visible and reports it', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(interpolate('{name} is dead', {})).toBe('{name} is dead')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('"name"'))

    spy.mockRestore()
  })
})

describe('MessageService', () => {
  it('resolves nested keys', () => {
    expect(messages.t('battle.effects.paralyzed', { name: 'Orc' })).toBe('😵 Orc is paralyzed, skips turn')
    expect(messages.t('stats.noneCompleted')).toBe('No battles completed')
  })

  it('throws on an unknown key', () => {
    expect(() => untyped('battle.nope')).toThrow('Unknown message key: battle.nope')
  })

  it('throws on a group key', () => {
    expect(() => untyped('ui.damageToggle')).toThrow('Unknown message key: ui.damageToggle')
  })

  // every template must render without leftovers when all its placeholders get a value
  it.each(Object.entries(flat(catalog)))('renders %s', (key, template) => {
    const params = Object.fromEntries([...template.matchAll(/\{(\w+)\}/g)].map(([, name]) => [name, 'x']))
    const text = untyped(key, params)

    expect(text).not.toMatch(/\{\w+\}/)
    expect(text.trim()).not.toBe('')
  })
})

// compile-time checks: run by tsc, these lines must keep failing type checking
export const typeChecks = (): void => {
  // @ts-expect-error unknown key
  messages.t('battle.dead', { name: 'x' })
  // @ts-expect-error missing params
  messages.t('battle.death')
  // @ts-expect-error misspelled param
  messages.t('battle.death', { nme: 'x' })
  // @ts-expect-error params of a template without placeholders
  messages.t('stats.noneCompleted', { name: 'x' })
  // @ts-expect-error a group is not a template
  messages.t('battle.effects')
}
