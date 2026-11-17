import { capitalize } from '../text'

describe('capitalize', () => {
  it.each([
    ['poison', 'Poison'],
    ['Breath', 'Breath'],
    ['a', 'A'],
  ])('capitalizes "%s"', (text, expected) => {
    expect(capitalize(text)).toBe(expected)
  })
})
