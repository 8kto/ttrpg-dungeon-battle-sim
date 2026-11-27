import { deepFreeze } from '../object'

describe('deepFreeze', () => {
  it('freezes nested objects and arrays', () => {
    const value = { list: [{ name: 'a' }], nested: { deep: { n: 1 } } }

    expect(deepFreeze(value)).toBe(value)
    expect(Object.isFrozen(value)).toBe(true)
    expect(Object.isFrozen(value.list)).toBe(true)
    expect(Object.isFrozen(value.list[0])).toBe(true)
    expect(Object.isFrozen(value.nested.deep)).toBe(true)
    expect(() => {
      value.nested.deep.n = 2
    }).toThrow(TypeError)
  })

  it.each([null, 1, 'text', true])('returns %p as is', (value) => {
    expect(deepFreeze(value)).toBe(value)
  })
})
